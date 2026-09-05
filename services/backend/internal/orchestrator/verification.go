package orchestrator

import (
	"context"
	"database/sql"
	"fmt"
	"reflect"
	"strings"

	"github.com/google/uuid"
)

type VerificationRequest struct {
	Action           string   `json:"action"`
	Reason           string   `json:"reason"`
	Result           *string  `json:"result"`
	Attachments      []string `json:"attachments"`
	ActualPlateNo    *string  `json:"actual_plat_no"`
	ActualLength     *float64 `json:"actual_length"`
	ActualWidth      *float64 `json:"actual_width"`
	ActualHeight     *float64 `json:"actual_height"`
	ActualWeight     *float64 `json:"actual_weight"`
	ActualTotalAxle  *int     `json:"actual_total_axle"`
	LocationAddress  *string  `json:"location_address"`
	Latitude         *float64 `json:"location_lat"`
	Longitude        *float64 `json:"location_lng"`
	SourceANPRBucket string   `json:"source_anpr_bucket"`
	SourceANPRObject string   `json:"source_anpr_object"`
	SourceAxleBucket string   `json:"source_axle_bucket"`
	SourceAxleObject string   `json:"source_axle_object"`
	SourceCCTVPath   string   `json:"source_cctv_path"`
}

type VerificationResult struct {
	VehicleID          string   `json:"vehicle_actual_id"`
	VerificationStatus string   `json:"verification_status"`
	DataOrigin         string   `json:"actual_data_origin"`
	RevisionNo         int      `json:"revision_no"`
	ChangedFields      []string `json:"changed_fields"`
}

type actualVerificationValues struct {
	PlateNo                       *string
	Length, Width, Height, Weight *float64
	TotalAxle                     *int
	Address                       *string
	Latitude, Longitude           *float64
}

func (s *Service) Verify(ctx context.Context, actorID, vehicleID string, req VerificationRequest) (*VerificationResult, error) {
	actor, err := validUUID(actorID, "actor")
	if err != nil {
		return nil, err
	}
	vehicle, err := validUUID(vehicleID, "vehicle")
	if err != nil {
		return nil, err
	}
	action := strings.ToLower(strings.TrimSpace(req.Action))
	statusMap := map[string]string{"save": "IN_REVIEW", "verify": "VERIFIED", "reject": "REJECTED"}
	verificationStatus, ok := statusMap[action]
	if !ok {
		return nil, fmt.Errorf("invalid verification action")
	}
	if err := validateCoordinates(req.Latitude, req.Longitude); err != nil {
		return nil, err
	}
	if action == "verify" && (blank(req.ActualPlateNo) || req.ActualTotalAxle == nil || req.ActualWeight == nil || req.ActualLength == nil || req.ActualWidth == nil || req.ActualHeight == nil) {
		return nil, fmt.Errorf("all actual vehicle fields are required for verification")
	}
	if action == "verify" && !validVerificationResult(req.Result) {
		return nil, fmt.Errorf("invalid verification result")
	}

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	beforeValues, beforeJSON, oldVerificationStatus, err := loadActualForVerification(ctx, tx, s.siteID, vehicle)
	if err != nil {
		return nil, err
	}
	afterValues := actualVerificationValues{req.ActualPlateNo, req.ActualLength, req.ActualWidth, req.ActualHeight, req.ActualWeight, req.ActualTotalAxle, req.LocationAddress, req.Latitude, req.Longitude}
	changedFields := changedActualFields(beforeValues, afterValues)
	manualChange := hasActualFieldChange(changedFields)
	reason := strings.TrimSpace(req.Reason)
	if (manualChange || action == "reject") && reason == "" {
		return nil, fmt.Errorf("reason is required for manual changes or rejection")
	}
	if oldVerificationStatus != verificationStatus {
		changedFields = append(changedFields, "verification_status")
	}
	if action == "verify" {
		if err := materializeMissingSources(ctx, tx, s.siteID, vehicle, actor, req); err != nil {
			return nil, err
		}
	}

	var afterJSON []byte
	var dataOrigin string
	var verifiedBy any
	if action == "verify" || action == "reject" {
		verifiedBy = actor
	}
	err = tx.QueryRowContext(ctx, `
		UPDATE public.transact_vehicle_actual SET
		 actual_plat_no=$3,actual_length=$4,actual_width=$5,actual_height=$6,actual_weight=$7,actual_total_axle=$8,
		 location_address=$9,location_lat=$10,location_lng=$11,verification_status=$12,
		 verified_by=$13,verified_at=CASE WHEN $13::uuid IS NULL THEN NULL ELSE now() END,
		 verification_notes=NULLIF($14,''),actual_data_origin=CASE WHEN $15 THEN 'MANUAL' ELSE actual_data_origin END,
		 updated_by=$2,updated_date=now()
		WHERE id=$1 AND site_id=$16 AND is_deleted=false
		RETURNING to_jsonb(transact_vehicle_actual),actual_data_origin
	`, vehicle, actor, req.ActualPlateNo, req.ActualLength, req.ActualWidth, req.ActualHeight, req.ActualWeight,
		req.ActualTotalAxle, req.LocationAddress, req.Latitude, req.Longitude, verificationStatus, verifiedBy, reason, manualChange, s.siteID).
		Scan(&afterJSON, &dataOrigin)
	if err != nil {
		return nil, err
	}

	revisionNo := 0
	if len(changedFields) > 0 {
		err = tx.QueryRowContext(ctx, `
			INSERT INTO public.transact_vehicle_revision
			(site_id,vehicle_actual_id,revision_no,reason,changed_fields,before_data,after_data,changed_by)
			SELECT $1,$2,COALESCE(max(revision_no),0)+1,NULLIF($3,''),$4,$5::jsonb,$6::jsonb,$7
			FROM public.transact_vehicle_revision WHERE vehicle_actual_id=$2
			RETURNING revision_no
		`, s.siteID, vehicle, reason, changedFields, string(beforeJSON), string(afterJSON), actor).Scan(&revisionNo)
		if err != nil {
			return nil, err
		}
	}

	_, err = tx.ExecContext(ctx, `UPDATE public.transact_vehicle_status
		SET is_active=false,updated_by=$2,updated_date=now()
		WHERE transact_vehicle_actual_id=$1 AND is_active=true AND is_deleted=false`, vehicle, actor)
	if err != nil {
		return nil, err
	}

	_, err = tx.ExecContext(ctx, `INSERT INTO public.transact_vehicle_status
		(site_id,transact_vehicle_actual_id,status,result,notes,attachment,is_active,is_deleted,created_by,created_date)
		VALUES ($1,$2,$3,NULLIF($4,''),NULLIF($5,''),$6,true,false,$7,now())`,
		s.siteID, vehicle, actionStatus(action), nullableText(req.Result), reason, req.Attachments, actor)
	if err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return &VerificationResult{vehicle.String(), verificationStatus, dataOrigin, revisionNo, changedFields}, nil
}

func materializeMissingSources(ctx context.Context, tx *sql.Tx, siteID, vehicleID, actorID uuid.UUID, req VerificationRequest) error {
	var sessionID sql.NullString
	var anprID, axleID, weighingID, dimensionID, cctvID sql.NullString
	if err := tx.QueryRowContext(ctx, `SELECT session_id::text,anpr_id::text,axle_id::text,transact_weighing_id::text,transact_dimension_id::text,transact_cctv_id::text
		FROM public.transact_vehicle_actual WHERE id=$1 AND site_id=$2 FOR UPDATE`, vehicleID, siteID).
		Scan(&sessionID, &anprID, &axleID, &weighingID, &dimensionID, &cctvID); err != nil {
		return err
	}
	if !sessionID.Valid {
		return fmt.Errorf("transaction session is required to create manual sources")
	}

	if !anprID.Valid {
		if err := tx.QueryRowContext(ctx, `INSERT INTO public.transact_anpr_capture
			(site_id,session_id,plate_no,captured_at,minio_bucket,minio_full_image_object,is_active,is_deleted,created_by,created_date,updated_by,updated_date)
			VALUES ($1,$2::uuid,$3,now(),NULLIF($4,''),NULLIF($5,''),true,false,$6,now(),$6,now()) RETURNING id::text`,
			siteID, sessionID.String, req.ActualPlateNo, strings.TrimSpace(req.SourceANPRBucket), strings.TrimSpace(req.SourceANPRObject), actorID).Scan(&anprID); err != nil {
			return fmt.Errorf("create manual ANPR source: %w", err)
		}
	}
	if anprID.Valid && strings.TrimSpace(req.SourceANPRObject) != "" {
		if _, err := tx.ExecContext(ctx, `UPDATE public.transact_anpr_capture SET minio_bucket=NULLIF($2,''),
			minio_full_image_object=$3,updated_by=$4,updated_date=now() WHERE id=$1::uuid`,
			anprID.String, strings.TrimSpace(req.SourceANPRBucket), strings.TrimSpace(req.SourceANPRObject), actorID); err != nil {
			return err
		}
	}
	if !axleID.Valid {
		lengthMM := 0
		if req.ActualLength != nil {
			lengthMM = int(*req.ActualLength * 1000)
		}
		if err := tx.QueryRowContext(ctx, `INSERT INTO public.transact_axle_capture
			(site_id,session_id,plate_no,captured_at,length_mm,total_axles,minio_bucket,minio_image_object,is_active,is_deleted,created_by,created_date,updated_by,updated_date)
			VALUES ($1,$2::uuid,$3,now(),NULLIF($4,0),$5,NULLIF($6,''),NULLIF($7,''),true,false,$8,now(),$8,now()) RETURNING id::text`,
			siteID, sessionID.String, req.ActualPlateNo, lengthMM, req.ActualTotalAxle, strings.TrimSpace(req.SourceAxleBucket), strings.TrimSpace(req.SourceAxleObject), actorID).Scan(&axleID); err != nil {
			return fmt.Errorf("create manual AXLE source: %w", err)
		}
	}
	if axleID.Valid && strings.TrimSpace(req.SourceAxleObject) != "" {
		if _, err := tx.ExecContext(ctx, `UPDATE public.transact_axle_capture SET minio_bucket=NULLIF($2,''),
			minio_image_object=$3,updated_by=$4,updated_date=now() WHERE id=$1::uuid`,
			axleID.String, strings.TrimSpace(req.SourceAxleBucket), strings.TrimSpace(req.SourceAxleObject), actorID); err != nil {
			return err
		}
	}
	if !weighingID.Valid {
		if err := tx.QueryRowContext(ctx, `INSERT INTO public.transact_weighing
			(site_id,session_id,total_axle,total_weight,is_active,is_deleted,created_by,created_date,updated_by,updated_date)
			VALUES ($1,$2::uuid,$3,$4,true,false,$5,now(),$5,now()) RETURNING id::text`,
			siteID, sessionID.String, req.ActualTotalAxle, req.ActualWeight, actorID).Scan(&weighingID); err != nil {
			return fmt.Errorf("create manual WIM source: %w", err)
		}
	}
	if !dimensionID.Valid {
		if err := tx.QueryRowContext(ctx, `INSERT INTO public.transact_dimension
			(site_id,session_id,anpr_id,length,width,height,is_active,is_deleted,created_by,created_date,updated_by,updated_date)
			VALUES ($1,$2::uuid,$3::uuid,$4,$5,$6,true,false,$7,now(),$7,now()) RETURNING id::text`,
			siteID, sessionID.String, anprID.String, req.ActualLength, req.ActualWidth, req.ActualHeight, actorID).Scan(&dimensionID); err != nil {
			return fmt.Errorf("create manual dimension source: %w", err)
		}
	}
	cctvPath := strings.TrimSpace(req.SourceCCTVPath)
	if !cctvID.Valid && cctvPath != "" {
		filename := cctvPath
		if slash := strings.LastIndex(filename, "/"); slash >= 0 {
			filename = filename[slash+1:]
		}
		if err := tx.QueryRowContext(ctx, `INSERT INTO public.transact_cctv
			(site_id,session_id,filename,filepath,is_active,is_deleted,created_by,created_date,updated_by,updated_date)
			VALUES ($1,$2::uuid,$3,$4,true,false,$5,now(),$5,now()) RETURNING id::text`,
			siteID, sessionID.String, filename, cctvPath, actorID).Scan(&cctvID); err != nil {
			return fmt.Errorf("create manual CCTV source: %w", err)
		}
	} else if cctvID.Valid && cctvPath != "" {
		if _, err := tx.ExecContext(ctx, `UPDATE public.transact_cctv SET filepath=$2,
			filename=$3,updated_by=$4,updated_date=now() WHERE id=$1::uuid`,
			cctvID.String, cctvPath, cctvPath[strings.LastIndex(cctvPath, "/")+1:], actorID); err != nil {
			return err
		}
	}

	if _, err := tx.ExecContext(ctx, `UPDATE public.transact_vehicle_actual SET
		anpr_id=COALESCE(anpr_id,$3::uuid),axle_id=COALESCE(axle_id,$4::uuid),
		transact_weighing_id=COALESCE(transact_weighing_id,$5::uuid),
		transact_dimension_id=COALESCE(transact_dimension_id,$6::uuid),
		transact_cctv_id=COALESCE(transact_cctv_id,NULLIF($7,'')::uuid)
		WHERE id=$1 AND site_id=$2`, vehicleID, siteID, anprID.String, axleID.String, weighingID.String, dimensionID.String, cctvID.String); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx, `UPDATE public.transact_vehicle_actual SET
		missing_sources=ARRAY_REMOVE(ARRAY[
			CASE WHEN anpr_id IS NULL THEN 'ANPR' END,CASE WHEN axle_id IS NULL THEN 'AXLE' END,
			CASE WHEN transact_weighing_id IS NULL THEN 'WIM' END,CASE WHEN transact_cctv_id IS NULL THEN 'CCTV' END,
			CASE WHEN transact_dimension_id IS NULL THEN 'DIMENSION' END]::text[],NULL),
		completeness_status=CASE WHEN anpr_id IS NOT NULL AND axle_id IS NOT NULL AND transact_weighing_id IS NOT NULL
			AND transact_cctv_id IS NOT NULL AND transact_dimension_id IS NOT NULL THEN 'COMPLETE' ELSE 'PARTIAL' END
		WHERE id=$1 AND site_id=$2`, vehicleID, siteID); err != nil {
		return err
	}
	sources := map[string]string{"ANPR": anprID.String, "AXLE": axleID.String, "WIM": weighingID.String, "DIMENSION": dimensionID.String}
	if cctvID.Valid {
		sources["CCTV"] = cctvID.String
	}
	for sourceType, sourceID := range sources {
		if _, err := tx.ExecContext(ctx, `UPDATE public.transact_session_source SET source_status='RECEIVED',
			source_record_id=$4::uuid,received_at=now(),error_code=NULL,error_message=NULL,
			metadata=metadata||'{"completed_during_verification":true}'::jsonb,updated_by=$5,updated_date=now()
			WHERE site_id=$1 AND session_id=$2::uuid AND source_type=$3`, siteID, sessionID.String, sourceType, sourceID, actorID); err != nil {
			return err
		}
	}
	return nil
}

func loadActualForVerification(ctx context.Context, tx *sql.Tx, siteID, vehicleID uuid.UUID) (actualVerificationValues, []byte, string, error) {
	var v actualVerificationValues
	var snapshot []byte
	var status string
	err := tx.QueryRowContext(ctx, `SELECT actual_plat_no,actual_length,actual_width,actual_height,actual_weight,
		actual_total_axle,location_address,location_lat,location_lng,to_jsonb(a),verification_status
		FROM public.transact_vehicle_actual a WHERE id=$1 AND site_id=$2 AND is_deleted=false FOR UPDATE`, vehicleID, siteID).
		Scan(&v.PlateNo, &v.Length, &v.Width, &v.Height, &v.Weight, &v.TotalAxle, &v.Address, &v.Latitude, &v.Longitude, &snapshot, &status)
	return v, snapshot, status, err
}

func changedActualFields(before, after actualVerificationValues) []string {
	fields := []struct {
		name          string
		before, after any
	}{
		{"actual_plat_no", before.PlateNo, after.PlateNo}, {"actual_length", before.Length, after.Length},
		{"actual_width", before.Width, after.Width}, {"actual_height", before.Height, after.Height},
		{"actual_weight", before.Weight, after.Weight}, {"actual_total_axle", before.TotalAxle, after.TotalAxle},
		{"location_address", before.Address, after.Address}, {"location_lat", before.Latitude, after.Latitude}, {"location_lng", before.Longitude, after.Longitude},
	}
	changed := make([]string, 0, len(fields))
	for _, field := range fields {
		if !reflect.DeepEqual(field.before, field.after) {
			changed = append(changed, field.name)
		}
	}
	return changed
}

func hasActualFieldChange(changedFields []string) bool {
	for _, field := range changedFields {
		if strings.HasPrefix(field, "actual_") {
			return true
		}
	}
	return false
}

func validVerificationResult(result *string) bool {
	if result == nil {
		return false
	}
	value := strings.TrimSpace(*result)
	return value == "Normal" || value == "Over Dimension" || value == "Over Loading" || value == "Over Dimension & Over Loading"
}

func actionStatus(action string) string {
	if action == "save" {
		return "draft"
	}
	if action == "verify" {
		return "verified"
	}
	return "rejected"
}
func nullableText(value *string) any {
	if value == nil {
		return nil
	}
	valueText := strings.TrimSpace(*value)
	if valueText == "" {
		return nil
	}
	return valueText
}
func blank(value *string) bool { return value == nil || strings.TrimSpace(*value) == "" }
