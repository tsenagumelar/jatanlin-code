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
	Action          string   `json:"action"`
	Reason          string   `json:"reason"`
	Result          *string  `json:"result"`
	Attachments     []string `json:"attachments"`
	ActualPlateNo   *string  `json:"actual_plat_no"`
	ActualLength    *float64 `json:"actual_length"`
	ActualWidth     *float64 `json:"actual_width"`
	ActualHeight    *float64 `json:"actual_height"`
	ActualWeight    *float64 `json:"actual_weight"`
	ActualTotalAxle *int     `json:"actual_total_axle"`
	LocationAddress *string  `json:"location_address"`
	Latitude        *float64 `json:"location_lat"`
	Longitude       *float64 `json:"location_lng"`
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
