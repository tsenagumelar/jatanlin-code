package etlenas

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"strings"
	"time"

	"jatanlin-data-center-backend/internal/config"
)

type Worker struct {
	db     *sql.DB
	config config.Config
	client *Client
}

type candidate struct {
	SiteID, SiteCode, SiteName, SiteLocation, SiteAddress string
	ActualID, SourceActualID, SourceStatusID              string
	Plate, VehicleType                                    string
	Latitude, Longitude                                   sql.NullString
	CaptureTime                                           time.Time
	PlateImageBucket, PlateImageObject                    sql.NullString
	VehicleImageBucket, VehicleImageObject                sql.NullString
}

func NewWorker(db *sql.DB, cfg config.Config) *Worker {
	return &Worker{db: db, config: cfg, client: NewClient(cfg.ETLENAS)}
}

func (w *Worker) Run(ctx context.Context) {
	if !w.config.ETLENAS.Enabled {
		return
	}
	if err := w.client.Validate(); err != nil {
		log.Printf("ETLENAS worker disabled: %v", err)
		return
	}
	log.Printf("ETLENAS worker enabled (interval %s)", w.config.ETLENAS.Interval)
	w.runOnce(ctx)
	ticker := time.NewTicker(w.config.ETLENAS.Interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.runOnce(ctx)
		}
	}
}

func (w *Worker) runOnce(ctx context.Context) {
	for i := 0; i < 25; i++ {
		item, deliveryID, err := w.claim(ctx)
		if err == sql.ErrNoRows {
			return
		}
		if err != nil {
			log.Printf("ETLENAS claim: %v", err)
			return
		}
		w.deliver(ctx, deliveryID, item)
	}
}

func (w *Worker) claim(ctx context.Context) (candidate, string, error) {
	tx, err := w.db.BeginTx(ctx, nil)
	if err != nil {
		return candidate{}, "", err
	}
	defer tx.Rollback()
	var item candidate
	err = tx.QueryRowContext(ctx, `
		WITH latest AS (
			SELECT v.id, v.site_id, v.source_id, v.source_anpr_id, v.source_axle_id,
				COALESCE(v.actual_plat_no, a.plate_no, '') plate_no,
				ds.latitude::text latitude, ds.longitude::text longitude,
				COALESCE(a.captured_at, x.captured_at, v.created_date, v.synced_at) capture_time,
				COALESCE(x.vehicle_category, x.vehicle_body_type, '') vehicle_type,
				s.source_id status_source_id, s.result, ds.site_code, ds.site_name,
				COALESCE(ds.site_location, '') site_location, COALESCE(ds.site_address, '') site_address
			FROM public.dc_transact_vehicle_actual v
			JOIN public.dc_site ds ON ds.id = v.site_id AND COALESCE(ds.is_deleted, false) = false
			JOIN LATERAL (
				SELECT status.source_id, status.status, status.result,
					status.updated_date, status.created_date, status.synced_at
				FROM public.dc_transact_vehicle_status status
				WHERE status.site_id = v.site_id AND status.source_vehicle_actual_id = v.source_id
				  AND COALESCE(status.is_deleted, false) = false
				ORDER BY COALESCE(status.updated_date, status.created_date, status.synced_at) DESC LIMIT 1
			) s ON lower(s.status) = 'verified'
			LEFT JOIN public.dc_transact_anpr_capture a ON a.site_id=v.site_id AND a.source_id=v.source_anpr_id
			LEFT JOIN public.dc_transact_axle_capture x ON x.site_id=v.site_id AND x.source_id=v.source_axle_id
			WHERE COALESCE(v.is_deleted, false) = false
			  AND lower(trim(COALESCE(s.result, ''))) IN
			      ('over dimension', 'over loading', 'over dimension & over loading')
			  AND NOT EXISTS (
				SELECT 1 FROM public.dc_etlenas_delivery d
				WHERE d.site_id=v.site_id AND d.source_vehicle_actual_id=v.source_id
				  AND (d.delivery_status='SUCCESS' OR
				       (d.delivery_status IN ('PROCESSING','FAILED') AND d.started_at > now()-interval '5 minutes'))
			  )
			ORDER BY COALESCE(v.verified_at, s.updated_date, s.created_date, s.synced_at, v.synced_at)
			LIMIT 1 FOR UPDATE OF v SKIP LOCKED
		)
		SELECT l.site_id::text,l.site_code,l.site_name,l.site_location,l.site_address,l.id::text,l.source_id::text,l.status_source_id::text,
			l.plate_no,l.vehicle_type,l.latitude,l.longitude,l.capture_time,
			pa.bucket,pa.object_key,fa.bucket,fa.object_key
		FROM latest l
		LEFT JOIN LATERAL (SELECT bucket,object_key FROM public.dc_vehicle_attachment WHERE site_id=l.site_id AND raw_payload->>'source_id'=l.source_anpr_id::text AND attachment_type='anpr_plate_image' AND upload_status='completed' AND COALESCE(is_deleted,false)=false ORDER BY synced_at DESC LIMIT 1) pa ON true
		LEFT JOIN LATERAL (SELECT bucket,object_key FROM public.dc_vehicle_attachment WHERE site_id=l.site_id AND raw_payload->>'source_id'=l.source_anpr_id::text AND attachment_type='anpr_full_image' AND upload_status='completed' AND COALESCE(is_deleted,false)=false ORDER BY synced_at DESC LIMIT 1) fa ON true
	`).Scan(&item.SiteID, &item.SiteCode, &item.SiteName, &item.SiteLocation, &item.SiteAddress, &item.ActualID, &item.SourceActualID, &item.SourceStatusID,
		&item.Plate, &item.VehicleType, &item.Latitude, &item.Longitude, &item.CaptureTime,
		&item.PlateImageBucket, &item.PlateImageObject, &item.VehicleImageBucket, &item.VehicleImageObject)
	if err != nil {
		return candidate{}, "", err
	}
	var deliveryID string
	err = tx.QueryRowContext(ctx, `INSERT INTO public.dc_etlenas_delivery
		(site_id, vehicle_actual_id, source_vehicle_actual_id, source_vehicle_status_id, delivery_status)
		VALUES ($1::uuid,$2::uuid,$3::uuid,$4::uuid,'PROCESSING') RETURNING id::text`,
		item.SiteID, item.ActualID, item.SourceActualID, item.SourceStatusID).Scan(&deliveryID)
	if err != nil {
		return candidate{}, "", err
	}
	if err := tx.Commit(); err != nil {
		return candidate{}, "", err
	}
	return item, deliveryID, nil
}

func (w *Worker) deliver(ctx context.Context, deliveryID string, item candidate) {
	result, sendErr := w.client.Send(ctx, Violation{
		DeviceName: item.SiteName, LocationName: fallback(item.SiteLocation, item.SiteName), LocationDescription: item.SiteAddress,
		Latitude: item.Latitude.String, Longitude: item.Longitude.String, Plate: item.Plate,
		VehicleType: item.VehicleType, CaptureTime: item.CaptureTime,
		PlateImageURL:   w.objectURL(item.PlateImageBucket, item.PlateImageObject),
		VehicleImageURL: w.objectURL(item.VehicleImageBucket, item.VehicleImageObject),
	})
	status := "SUCCESS"
	errorMessage := ""
	if sendErr != nil {
		status = "FAILED"
		errorMessage = sendErr.Error()
	}
	responseJSON := json.RawMessage(nil)
	if json.Valid(result.Body) {
		responseJSON = result.Body
	}
	_, err := w.db.ExecContext(ctx, `UPDATE public.dc_etlenas_delivery SET
		delivery_status=$2,http_status=NULLIF($3,0),etlenas_status_code=$4,
		request_payload=NULLIF($5,'')::jsonb,response_payload=$6::jsonb,response_body=$7,
		error_message=NULLIF($8,''),synced_at=now(),updated_at=now()
		WHERE id=$1::uuid`, deliveryID, status, result.HTTPStatus, result.StatusCode, string(result.Payload), nullableJSON(responseJSON), string(result.Body), errorMessage)
	if err != nil {
		log.Printf("ETLENAS save delivery %s: %v", deliveryID, err)
		return
	}
	if sendErr != nil {
		log.Printf("ETLENAS delivery %s failed: %v", deliveryID, sendErr)
	}
}

func (w *Worker) objectURL(bucket, object sql.NullString) string {
	if !bucket.Valid || !object.Valid {
		return ""
	}
	endpoint := strings.TrimRight(w.config.MinIOPublicEndpoint, "/")
	if endpoint == "" {
		return ""
	}
	if !strings.HasPrefix(endpoint, "http://") && !strings.HasPrefix(endpoint, "https://") {
		endpoint = "http://" + endpoint
	}
	return endpoint + "/" + strings.Trim(bucket.String, "/") + "/" + strings.TrimLeft(object.String, "/")
}

func nullableJSON(value json.RawMessage) any {
	if len(value) == 0 {
		return nil
	}
	return string(value)
}
