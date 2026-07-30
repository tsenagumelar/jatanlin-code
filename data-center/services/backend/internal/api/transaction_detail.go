package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type transactionSummary struct {
	ID                    string     `json:"id"`
	SiteID                string     `json:"site_id"`
	SourceID              string     `json:"source_id"`
	TransactionNo         string     `json:"transaction_no"`
	PlateNo               string     `json:"plate_no"`
	VehicleClass          string     `json:"vehicle_class"`
	OperatorName          string     `json:"operator_name"`
	LocationLat           *float64   `json:"location_lat"`
	LocationLng           *float64   `json:"location_lng"`
	LocationAddress       string     `json:"location_address"`
	TotalWeight           *float64   `json:"total_weight"`
	LengthMM              *float64   `json:"length_mm"`
	WidthMM               *float64   `json:"width_mm"`
	HeightMM              *float64   `json:"height_mm"`
	AxleCount             *int       `json:"axle_count"`
	ViolationStatus       string     `json:"violation_status"`
	ViolationNotes        string     `json:"violation_notes"`
	EnforcementStartedAt  *time.Time `json:"enforcement_started_at"`
	EnforcementFinishedAt *time.Time `json:"enforcement_finished_at"`
	SourceUpdatedAt       *time.Time `json:"source_updated_at"`
	SyncedAt              *time.Time `json:"synced_at"`
}

type transactionSite struct {
	ID                 string     `json:"id"`
	SiteCode           string     `json:"site_code"`
	SiteName           string     `json:"site_name"`
	City               string     `json:"city"`
	Province           string     `json:"province"`
	OperationalStatus  string     `json:"operational_status"`
	ActiveOperatorName string     `json:"active_operator_name"`
	LastSeenAt         *time.Time `json:"last_seen_at"`
	LastSyncAt         *time.Time `json:"last_sync_at"`
}

type transactionAttachment struct {
	ID              string     `json:"id"`
	AttachmentType  string     `json:"attachment_type"`
	Bucket          string     `json:"bucket"`
	ObjectKey       string     `json:"object_key"`
	FileName        string     `json:"file_name"`
	MimeType        string     `json:"mime_type"`
	FileSize        *int64     `json:"file_size"`
	Checksum        string     `json:"checksum"`
	UploadStatus    string     `json:"upload_status"`
	SourceUpdatedAt *time.Time `json:"source_updated_at"`
	SyncedAt        *time.Time `json:"synced_at"`
	PublicURL       string     `json:"public_url"`
}

func (s *Server) handleTransactionDetail(w http.ResponseWriter, r *http.Request) {
	transactionID := strings.TrimSpace(r.PathValue("id"))
	if transactionID == "" {
		writeError(w, http.StatusBadRequest, "transaction id is required")
		return
	}

	var summary transactionSummary
	var site transactionSite
	err := s.DB.QueryRow(`
		SELECT
			v.id::text,
			v.site_id::text,
			v.source_id,
			COALESCE(v.transaction_no, ''),
			COALESCE(v.plate_no, ''),
			COALESCE(v.vehicle_class, ''),
			COALESCE(v.operator_name, ''),
			v.location_lat::float8,
			v.location_lng::float8,
			COALESCE(v.location_address, ''),
			v.total_weight::float8,
			v.length_mm::float8,
			v.width_mm::float8,
			v.height_mm::float8,
			v.axle_count,
			COALESCE(v.violation_status, 'pending'),
			COALESCE(v.violation_notes, ''),
			v.enforcement_started_at,
			v.enforcement_finished_at,
			v.source_updated_at,
			v.synced_at,
			s.id::text,
			s.site_code,
			s.site_name,
			COALESCE(s.city, ''),
			COALESCE(s.province, ''),
			s.operational_status,
			COALESCE(s.active_operator_name, ''),
			s.last_seen_at,
			s.last_sync_at
		FROM public.dc_dashboard_vehicle_actual v
		JOIN public.dc_site s ON s.id = v.site_id
		WHERE v.id::text = $1
		  AND COALESCE(v.is_deleted, false) = false
		LIMIT 1
	`, transactionID).Scan(
		&summary.ID,
		&summary.SiteID,
		&summary.SourceID,
		&summary.TransactionNo,
		&summary.PlateNo,
		&summary.VehicleClass,
		&summary.OperatorName,
		&summary.LocationLat,
		&summary.LocationLng,
		&summary.LocationAddress,
		&summary.TotalWeight,
		&summary.LengthMM,
		&summary.WidthMM,
		&summary.HeightMM,
		&summary.AxleCount,
		&summary.ViolationStatus,
		&summary.ViolationNotes,
		&summary.EnforcementStartedAt,
		&summary.EnforcementFinishedAt,
		&summary.SourceUpdatedAt,
		&summary.SyncedAt,
		&site.ID,
		&site.SiteCode,
		&site.SiteName,
		&site.City,
		&site.Province,
		&site.OperationalStatus,
		&site.ActiveOperatorName,
		&site.LastSeenAt,
		&site.LastSyncAt,
	)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "transaction not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	raw, err := s.transactionRawDetail(site.ID, summary.SourceID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	attachments, err := s.transactionAttachments(site.ID, summary.SourceID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"transaction": summary,
		"site":        site,
		"raw":         raw,
		"attachments": attachments,
	})
}

func (s *Server) transactionRawDetail(siteID string, sourceID string) (map[string]any, error) {
	var session, anpr, axle, cctv, dimension, weighing, actual, status sql.NullString
	err := s.DB.QueryRow(`
		WITH actual_row AS (
			SELECT *
			FROM public.dc_transact_vehicle_actual
			WHERE site_id = $1::uuid
			  AND source_id::text = $2
			  AND COALESCE(is_deleted, false) = false
			LIMIT 1
		)
		SELECT
			(SELECT to_jsonb(t)::text FROM public.dc_transact_wim_session t WHERE t.site_id = $1::uuid AND t.source_id = (SELECT source_session_id FROM actual_row) LIMIT 1),
			(SELECT to_jsonb(t)::text FROM public.dc_transact_anpr_capture t WHERE t.site_id = $1::uuid AND t.source_id = (SELECT source_anpr_id FROM actual_row) LIMIT 1),
			(SELECT to_jsonb(t)::text FROM public.dc_transact_axle_capture t WHERE t.site_id = $1::uuid AND t.source_id = (SELECT source_axle_id FROM actual_row) LIMIT 1),
			(SELECT to_jsonb(t)::text FROM public.dc_transact_cctv t WHERE t.site_id = $1::uuid AND t.source_id = (SELECT source_cctv_id FROM actual_row) LIMIT 1),
			(SELECT to_jsonb(t)::text FROM public.dc_transact_dimension t WHERE t.site_id = $1::uuid AND t.source_id = (SELECT source_dimension_id FROM actual_row) LIMIT 1),
			(SELECT to_jsonb(t)::text FROM public.dc_transact_weighing t WHERE t.site_id = $1::uuid AND t.source_id = (SELECT source_weighing_id FROM actual_row) LIMIT 1),
			(SELECT to_jsonb(t)::text FROM actual_row t LIMIT 1),
			(SELECT to_jsonb(t)::text FROM public.dc_transact_vehicle_status t WHERE t.site_id = $1::uuid AND t.source_vehicle_actual_id = (SELECT source_id FROM actual_row) ORDER BY COALESCE(t.updated_date, t.created_date, t.synced_at) DESC LIMIT 1)
	`, siteID, sourceID).Scan(&session, &anpr, &axle, &cctv, &dimension, &weighing, &actual, &status)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"session":        nullableRawJSON(session),
		"anpr":           nullableRawJSON(anpr),
		"axle":           nullableRawJSON(axle),
		"cctv":           nullableRawJSON(cctv),
		"dimension":      nullableRawJSON(dimension),
		"weighing":       nullableRawJSON(weighing),
		"vehicle_actual": nullableRawJSON(actual),
		"vehicle_status": nullableRawJSON(status),
	}, nil
}

func (s *Server) transactionAttachments(siteID string, sourceID string) ([]transactionAttachment, error) {
	rows, err := s.DB.Query(`
		WITH actual_row AS (
			SELECT *
			FROM public.dc_transact_vehicle_actual
			WHERE site_id = $1::uuid
			  AND source_id::text = $2
			  AND COALESCE(is_deleted, false) = false
			LIMIT 1
		),
		related_source AS (
			SELECT $2::text AS source_id
			UNION
			SELECT source_anpr_id::text FROM actual_row WHERE source_anpr_id IS NOT NULL
			UNION
			SELECT source_axle_id::text FROM actual_row WHERE source_axle_id IS NOT NULL
			UNION
			SELECT source_cctv_id::text FROM actual_row WHERE source_cctv_id IS NOT NULL
			UNION
			SELECT source_dimension_id::text FROM actual_row WHERE source_dimension_id IS NOT NULL
			UNION
			SELECT source_weighing_id::text FROM actual_row WHERE source_weighing_id IS NOT NULL
		)
		SELECT
			a.id::text,
			a.attachment_type,
			a.bucket,
			a.object_key,
			COALESCE(a.file_name, ''),
			COALESCE(a.mime_type, ''),
			a.file_size,
			COALESCE(a.checksum, ''),
			a.upload_status,
			a.source_updated_at,
			a.synced_at
		FROM public.dc_vehicle_attachment a
		WHERE a.site_id = $1::uuid
		  AND COALESCE(a.is_deleted, false) = false
		  AND (
			a.site_transaction_id::text IN (SELECT source_id FROM related_source)
			OR a.raw_payload->>'source_id' IN (SELECT source_id FROM related_source)
		  )
		ORDER BY COALESCE(a.source_updated_at, a.synced_at) DESC, a.attachment_type ASC
	`, siteID, sourceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	attachments := []transactionAttachment{}
	for rows.Next() {
		var item transactionAttachment
		if err := rows.Scan(
			&item.ID,
			&item.AttachmentType,
			&item.Bucket,
			&item.ObjectKey,
			&item.FileName,
			&item.MimeType,
			&item.FileSize,
			&item.Checksum,
			&item.UploadStatus,
			&item.SourceUpdatedAt,
			&item.SyncedAt,
		); err != nil {
			return nil, err
		}
		item.PublicURL = "http://" + s.Config.MinIOPublicEndpoint + "/" + item.Bucket + "/" + item.ObjectKey
		attachments = append(attachments, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return attachments, nil
}

func nullableRawJSON(value sql.NullString) any {
	if !value.Valid || strings.TrimSpace(value.String) == "" {
		return nil
	}
	var decoded any
	if err := json.Unmarshal([]byte(value.String), &decoded); err != nil {
		return map[string]any{
			"_decode_error": err.Error(),
			"_raw":          value.String,
		}
	}
	return decoded
}
