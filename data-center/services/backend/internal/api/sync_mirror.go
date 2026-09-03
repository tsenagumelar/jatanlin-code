package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type syncMirrorBatchRequest struct {
	SiteCode            string            `json:"site_code"`
	TableName           string            `json:"table_name"`
	LastSourceUpdatedAt *time.Time        `json:"last_source_updated_at"`
	LastSiteSequence    *int64            `json:"last_site_sequence"`
	Records             []json.RawMessage `json:"records"`
}

func (s *Server) handleSyncMirrorBatch(w http.ResponseWriter, r *http.Request) {
	var request syncMirrorBatchRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	siteID, ok := s.lookupSiteID(w, request.SiteCode)
	if !ok {
		return
	}

	tableName := strings.TrimSpace(request.TableName)
	if tableName == "" {
		writeError(w, http.StatusBadRequest, "table_name is required")
		return
	}

	recordsJSON, err := json.Marshal(request.Records)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid records")
		return
	}

	upsert, ok := mirrorUpserts[tableName]
	if !ok {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("unsupported table_name %q", tableName))
		return
	}

	result, err := s.DB.Exec(upsert, siteID, string(recordsJSON))
	if err != nil {
		_ = s.writeSyncLog(siteID, tableName, "failed", len(request.Records), 0, len(request.Records), err.Error())
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	rowsAffected, _ := result.RowsAffected()

	if err := s.writeSyncCursor(siteID, tableName, request.LastSourceUpdatedAt, request.LastSiteSequence, ""); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.writeSyncLog(siteID, tableName, "success", len(request.Records), int(rowsAffected), 0, "")

	writeJSON(w, http.StatusOK, map[string]any{
		"status":          "success",
		"table_name":      tableName,
		"records_total":   len(request.Records),
		"records_success": rowsAffected,
		"records_failed":  0,
	})
}

var mirrorUpserts = map[string]string{
	"master_role":          masterRecordUpsert("master_role", "role_name"),
	"master_device_type":   masterRecordUpsert("master_device_type", "type_name"),
	"master_vehicle_class": masterRecordUpsert("master_vehicle_class", "type"),
	"master_config":        masterRecordUpsert("master_config", "config_key"),
	"master_device":        masterRecordUpsert("master_device", "device_name"),
	"master_user":          masterRecordUpsert("master_user", "full_name"),
	"transact_wim_session": `
		WITH rows AS (
			SELECT *
			FROM jsonb_to_recordset($2::jsonb) AS x(
				id uuid,
				site_id uuid,
				code varchar(50),
				session_name varchar(200),
				started_at timestamptz,
				ended_at timestamptz,
				status varchar(50),
				total_vehicles int,
				processed_vehicles int,
				notes text,
				started_by uuid,
				ended_by uuid,
				is_dummy bool,
				is_active bool,
				is_deleted bool,
				created_by uuid,
				created_date timestamptz,
				updated_by uuid,
				updated_date timestamptz
			)
		)
		INSERT INTO public.dc_transact_wim_session (
			site_id, source_id, source_site_id, code, session_name, started_at, ended_at,
			status, total_vehicles, processed_vehicles, notes, started_by, ended_by,
			is_dummy, is_active, is_deleted, created_by, created_date, updated_by,
			updated_date, raw_payload
		)
		SELECT $1, id, site_id, code, session_name, started_at, ended_at,
			status, total_vehicles, processed_vehicles, notes, started_by, ended_by,
			is_dummy, is_active, COALESCE(is_deleted, false), created_by, created_date,
			updated_by, updated_date, to_jsonb(rows)
		FROM rows
		WHERE id IS NOT NULL
		ON CONFLICT (site_id, source_id) DO UPDATE
		SET source_site_id = EXCLUDED.source_site_id,
		    code = EXCLUDED.code,
		    session_name = EXCLUDED.session_name,
		    started_at = EXCLUDED.started_at,
		    ended_at = EXCLUDED.ended_at,
		    status = EXCLUDED.status,
		    total_vehicles = EXCLUDED.total_vehicles,
		    processed_vehicles = EXCLUDED.processed_vehicles,
		    notes = EXCLUDED.notes,
		    started_by = EXCLUDED.started_by,
		    ended_by = EXCLUDED.ended_by,
		    is_dummy = EXCLUDED.is_dummy,
		    is_active = EXCLUDED.is_active,
		    is_deleted = EXCLUDED.is_deleted,
		    created_by = EXCLUDED.created_by,
		    created_date = EXCLUDED.created_date,
		    updated_by = EXCLUDED.updated_by,
		    updated_date = EXCLUDED.updated_date,
		    synced_at = now(),
		    raw_payload = EXCLUDED.raw_payload
	`,
	"transact_anpr_capture": `
		WITH rows AS (
			SELECT *
			FROM jsonb_to_recordset($2::jsonb) AS x(
				id uuid,
				site_id uuid,
				session_id uuid,
				external_id varchar(100),
				plate_no varchar(32),
				confidence numeric(5,2),
				captured_at timestamptz,
				location_code varchar(100),
				camera_id varchar(100),
				minio_bucket varchar(100),
				minio_date_folder varchar(8),
				minio_xml_object text,
				minio_full_image_object text,
				minio_plate_image_object text,
				is_active bool,
				is_deleted bool,
				created_by uuid,
				created_date timestamptz,
				updated_by uuid,
				updated_date timestamptz
			)
		)
		INSERT INTO public.dc_transact_anpr_capture (
			site_id, source_id, source_site_id, source_session_id, external_id, plate_no,
			confidence, captured_at, location_code, camera_id, minio_bucket,
			minio_date_folder, minio_xml_object, minio_full_image_object,
			minio_plate_image_object, is_active, is_deleted, created_by, created_date,
			updated_by, updated_date, raw_payload
		)
		SELECT $1, id, site_id, session_id, external_id, plate_no,
			confidence, captured_at, location_code, camera_id, minio_bucket,
			minio_date_folder, minio_xml_object, minio_full_image_object,
			minio_plate_image_object, is_active, COALESCE(is_deleted, false),
			created_by, created_date, updated_by, updated_date, to_jsonb(rows)
		FROM rows
		WHERE id IS NOT NULL
		ON CONFLICT (site_id, source_id) DO UPDATE
		SET source_site_id = EXCLUDED.source_site_id,
		    source_session_id = EXCLUDED.source_session_id,
		    external_id = EXCLUDED.external_id,
		    plate_no = EXCLUDED.plate_no,
		    confidence = EXCLUDED.confidence,
		    captured_at = EXCLUDED.captured_at,
		    location_code = EXCLUDED.location_code,
		    camera_id = EXCLUDED.camera_id,
		    minio_bucket = EXCLUDED.minio_bucket,
		    minio_date_folder = EXCLUDED.minio_date_folder,
		    minio_xml_object = EXCLUDED.minio_xml_object,
		    minio_full_image_object = EXCLUDED.minio_full_image_object,
		    minio_plate_image_object = EXCLUDED.minio_plate_image_object,
		    is_active = EXCLUDED.is_active,
		    is_deleted = EXCLUDED.is_deleted,
		    created_by = EXCLUDED.created_by,
		    created_date = EXCLUDED.created_date,
		    updated_by = EXCLUDED.updated_by,
		    updated_date = EXCLUDED.updated_date,
		    synced_at = now(),
		    raw_payload = EXCLUDED.raw_payload
	`,
	"transact_axle_capture": `
		WITH rows AS (
			SELECT *
			FROM jsonb_to_recordset($2::jsonb) AS x(
				id uuid,
				site_id uuid,
				session_id uuid,
				external_id varchar(100),
				plate_no varchar(32),
				captured_at timestamptz,
				camera_id varchar(100),
				length_mm int,
				total_wheels int,
				total_axles int,
				vehicle_category varchar(50),
				vehicle_body_type varchar(50),
				minio_bucket varchar(100),
				minio_date_folder varchar(8),
				minio_xml_object text,
				minio_image_object text,
				is_active bool,
				is_deleted bool,
				created_by uuid,
				created_date timestamptz,
				updated_by uuid,
				updated_date timestamptz
			)
		)
		INSERT INTO public.dc_transact_axle_capture (
			site_id, source_id, source_site_id, source_session_id, external_id,
			plate_no, captured_at, camera_id, length_mm, total_wheels, total_axles,
			vehicle_category, vehicle_body_type, minio_bucket, minio_date_folder,
			minio_xml_object, minio_image_object, is_active, is_deleted,
			created_by, created_date, updated_by, updated_date, raw_payload
		)
		SELECT $1, id, site_id, session_id, external_id,
			plate_no, captured_at, camera_id, length_mm, total_wheels, total_axles,
			vehicle_category, vehicle_body_type, minio_bucket, minio_date_folder,
			minio_xml_object, minio_image_object, is_active, COALESCE(is_deleted, false),
			created_by, created_date, updated_by, updated_date, to_jsonb(rows)
		FROM rows
		WHERE id IS NOT NULL
		ON CONFLICT (site_id, source_id) DO UPDATE
		SET source_site_id = EXCLUDED.source_site_id,
		    source_session_id = EXCLUDED.source_session_id,
		    external_id = EXCLUDED.external_id,
		    plate_no = EXCLUDED.plate_no,
		    captured_at = EXCLUDED.captured_at,
		    camera_id = EXCLUDED.camera_id,
		    length_mm = EXCLUDED.length_mm,
		    total_wheels = EXCLUDED.total_wheels,
		    total_axles = EXCLUDED.total_axles,
		    vehicle_category = EXCLUDED.vehicle_category,
		    vehicle_body_type = EXCLUDED.vehicle_body_type,
		    minio_bucket = EXCLUDED.minio_bucket,
		    minio_date_folder = EXCLUDED.minio_date_folder,
		    minio_xml_object = EXCLUDED.minio_xml_object,
		    minio_image_object = EXCLUDED.minio_image_object,
		    is_active = EXCLUDED.is_active,
		    is_deleted = EXCLUDED.is_deleted,
		    created_by = EXCLUDED.created_by,
		    created_date = EXCLUDED.created_date,
		    updated_by = EXCLUDED.updated_by,
		    updated_date = EXCLUDED.updated_date,
		    synced_at = now(),
		    raw_payload = EXCLUDED.raw_payload
	`,
	"transact_vehicle_actual": `
		WITH rows AS (
			SELECT *
			FROM jsonb_to_recordset($2::jsonb) AS x(
				id uuid,
				site_id uuid,
				session_id uuid,
				anpr_id uuid,
				axle_id uuid,
				transact_dimension_id uuid,
				transact_weighing_id uuid,
				transact_cctv_id uuid,
				actual_width numeric(10,3),
				actual_length numeric(10,3),
				actual_height numeric(10,3),
				actual_weight numeric(12,3),
				actual_plat_no varchar(32),
				actual_total_axle int,
				location_lat numeric(10,7),
				location_lng numeric(10,7),
				location_address text,
				is_active bool,
				is_deleted bool,
				created_by uuid,
				created_date timestamptz,
				updated_by uuid,
				updated_date timestamptz
			)
		)
		INSERT INTO public.dc_transact_vehicle_actual (
			site_id, source_id, source_site_id, source_session_id, source_anpr_id,
			source_axle_id, source_dimension_id, source_weighing_id, source_cctv_id,
			actual_width, actual_length, actual_height, actual_weight, actual_plat_no,
			actual_total_axle, location_lat, location_lng, location_address,
			is_active, is_deleted, created_by, created_date, updated_by, updated_date,
			raw_payload
		)
		SELECT $1, id, site_id, session_id, anpr_id,
			axle_id, transact_dimension_id, transact_weighing_id, transact_cctv_id,
			actual_width, actual_length, actual_height, actual_weight, actual_plat_no,
			actual_total_axle, location_lat, location_lng, location_address,
			is_active, COALESCE(is_deleted, false), created_by, created_date,
			updated_by, updated_date, to_jsonb(rows)
		FROM rows
		WHERE id IS NOT NULL
		ON CONFLICT (site_id, source_id) DO UPDATE
		SET source_site_id = EXCLUDED.source_site_id,
		    source_session_id = EXCLUDED.source_session_id,
		    source_anpr_id = EXCLUDED.source_anpr_id,
		    source_axle_id = EXCLUDED.source_axle_id,
		    source_dimension_id = EXCLUDED.source_dimension_id,
		    source_weighing_id = EXCLUDED.source_weighing_id,
		    source_cctv_id = EXCLUDED.source_cctv_id,
		    actual_width = EXCLUDED.actual_width,
		    actual_length = EXCLUDED.actual_length,
		    actual_height = EXCLUDED.actual_height,
		    actual_weight = EXCLUDED.actual_weight,
		    actual_plat_no = EXCLUDED.actual_plat_no,
		    actual_total_axle = EXCLUDED.actual_total_axle,
		    location_lat = EXCLUDED.location_lat,
		    location_lng = EXCLUDED.location_lng,
		    location_address = EXCLUDED.location_address,
		    is_active = EXCLUDED.is_active,
		    is_deleted = EXCLUDED.is_deleted,
		    created_by = EXCLUDED.created_by,
		    created_date = EXCLUDED.created_date,
		    updated_by = EXCLUDED.updated_by,
		    updated_date = EXCLUDED.updated_date,
		    synced_at = now(),
		    raw_payload = EXCLUDED.raw_payload
	`,
	"transact_cctv": `
		WITH rows AS (
			SELECT *
			FROM jsonb_to_recordset($2::jsonb) AS x(
				id uuid,
				site_id uuid,
				session_id uuid,
				filename text,
				filepath text,
				is_active bool,
				is_deleted bool,
				created_by uuid,
				created_date timestamptz,
				updated_by uuid,
				updated_date timestamptz
			)
		)
		INSERT INTO public.dc_transact_cctv (
			site_id, source_id, source_site_id, source_session_id, filename, filepath,
			is_active, is_deleted, created_by, created_date, updated_by, updated_date,
			raw_payload
		)
		SELECT $1, id, site_id, session_id, filename, filepath,
			is_active, COALESCE(is_deleted, false), created_by, created_date,
			updated_by, updated_date, to_jsonb(rows)
		FROM rows
		WHERE id IS NOT NULL
		ON CONFLICT (site_id, source_id) DO UPDATE
		SET source_site_id = EXCLUDED.source_site_id,
		    source_session_id = EXCLUDED.source_session_id,
		    filename = EXCLUDED.filename,
		    filepath = EXCLUDED.filepath,
		    is_active = EXCLUDED.is_active,
		    is_deleted = EXCLUDED.is_deleted,
		    created_by = EXCLUDED.created_by,
		    created_date = EXCLUDED.created_date,
		    updated_by = EXCLUDED.updated_by,
		    updated_date = EXCLUDED.updated_date,
		    synced_at = now(),
		    raw_payload = EXCLUDED.raw_payload
	`,
	"transact_dimension": `
		WITH rows AS (
			SELECT *
			FROM jsonb_to_recordset($2::jsonb) AS x(
				id uuid,
				site_id uuid,
				session_id uuid,
				anpr_id uuid,
				filepath text,
				length numeric(10,3),
				width numeric(10,3),
				height numeric(10,3),
				is_active bool,
				is_deleted bool,
				created_by uuid,
				created_date timestamptz,
				updated_by uuid,
				updated_date timestamptz
			)
		)
		INSERT INTO public.dc_transact_dimension (
			site_id, source_id, source_site_id, source_session_id, source_anpr_id,
			filepath, length, width, height, is_active, is_deleted, created_by,
			created_date, updated_by, updated_date, raw_payload
		)
		SELECT $1, id, site_id, session_id, anpr_id,
			filepath, length, width, height, is_active, COALESCE(is_deleted, false),
			created_by, created_date, updated_by, updated_date, to_jsonb(rows)
		FROM rows
		WHERE id IS NOT NULL
		ON CONFLICT (site_id, source_id) DO UPDATE
		SET source_site_id = EXCLUDED.source_site_id,
		    source_session_id = EXCLUDED.source_session_id,
		    source_anpr_id = EXCLUDED.source_anpr_id,
		    filepath = EXCLUDED.filepath,
		    length = EXCLUDED.length,
		    width = EXCLUDED.width,
		    height = EXCLUDED.height,
		    is_active = EXCLUDED.is_active,
		    is_deleted = EXCLUDED.is_deleted,
		    created_by = EXCLUDED.created_by,
		    created_date = EXCLUDED.created_date,
		    updated_by = EXCLUDED.updated_by,
		    updated_date = EXCLUDED.updated_date,
		    synced_at = now(),
		    raw_payload = EXCLUDED.raw_payload
	`,
	"transact_weighing": `
		WITH rows AS (
			SELECT *
			FROM jsonb_to_recordset($2::jsonb) AS x(
				id uuid,
				site_id uuid,
				session_id uuid,
				total_axle int,
				axle_detail jsonb,
				total_weight numeric(12,3),
				is_active bool,
				is_deleted bool,
				created_by uuid,
				created_date timestamptz,
				updated_by uuid,
				updated_date timestamptz
			)
		)
		INSERT INTO public.dc_transact_weighing (
			site_id, source_id, source_site_id, source_session_id, total_axle,
			axle_detail, total_weight, is_active, is_deleted, created_by,
			created_date, updated_by, updated_date, raw_payload
		)
		SELECT $1, id, site_id, session_id, total_axle,
			axle_detail, total_weight, is_active, COALESCE(is_deleted, false),
			created_by, created_date, updated_by, updated_date, to_jsonb(rows)
		FROM rows
		WHERE id IS NOT NULL
		ON CONFLICT (site_id, source_id) DO UPDATE
		SET source_site_id = EXCLUDED.source_site_id,
		    source_session_id = EXCLUDED.source_session_id,
		    total_axle = EXCLUDED.total_axle,
		    axle_detail = EXCLUDED.axle_detail,
		    total_weight = EXCLUDED.total_weight,
		    is_active = EXCLUDED.is_active,
		    is_deleted = EXCLUDED.is_deleted,
		    created_by = EXCLUDED.created_by,
		    created_date = EXCLUDED.created_date,
		    updated_by = EXCLUDED.updated_by,
		    updated_date = EXCLUDED.updated_date,
		    synced_at = now(),
		    raw_payload = EXCLUDED.raw_payload
	`,
	"transact_vehicle_status": `
		WITH rows AS (
			SELECT *
			FROM jsonb_to_recordset($2::jsonb) AS x(
				id uuid,
				site_id uuid,
				transact_vehicle_actual_id uuid,
				status varchar(50),
				result varchar(50),
				notes text,
				attachment text[],
				is_violation bool,
				overload_percentage numeric(6, 2),
				etle_status_code int,
				etle_sent_at timestamptz,
				is_active bool,
				is_deleted bool,
				created_by uuid,
				created_date timestamptz,
				updated_by uuid,
				updated_date timestamptz
			)
		)
		INSERT INTO public.dc_transact_vehicle_status (
			site_id, source_id, source_site_id, source_vehicle_actual_id, status,
			result, notes, attachment, is_violation, overload_percentage,
			etle_status_code, etle_sent_at, is_active, is_deleted, created_by,
			created_date, updated_by, updated_date, raw_payload
		)
		SELECT $1, id, site_id, transact_vehicle_actual_id, COALESCE(status, 'UNKNOWN'),
			result, notes, attachment, COALESCE(is_violation, false), overload_percentage,
			etle_status_code, etle_sent_at, is_active, COALESCE(is_deleted, false),
			created_by, created_date, updated_by, updated_date, to_jsonb(rows)
		FROM rows
		WHERE id IS NOT NULL
		ON CONFLICT (site_id, source_id) DO UPDATE
		SET source_site_id = EXCLUDED.source_site_id,
		    source_vehicle_actual_id = EXCLUDED.source_vehicle_actual_id,
		    status = EXCLUDED.status,
		    result = EXCLUDED.result,
		    notes = EXCLUDED.notes,
		    attachment = EXCLUDED.attachment,
		    is_violation = EXCLUDED.is_violation,
		    overload_percentage = EXCLUDED.overload_percentage,
		    etle_status_code = EXCLUDED.etle_status_code,
		    etle_sent_at = EXCLUDED.etle_sent_at,
		    is_active = EXCLUDED.is_active,
		    is_deleted = EXCLUDED.is_deleted,
		    created_by = EXCLUDED.created_by,
		    created_date = EXCLUDED.created_date,
		    updated_by = EXCLUDED.updated_by,
		    updated_date = EXCLUDED.updated_date,
		    synced_at = now(),
		    raw_payload = EXCLUDED.raw_payload
	`,
}

func masterRecordUpsert(tableName string, displayKey string) string {
	escapedTable := strings.ReplaceAll(tableName, `'`, `''`)
	escapedDisplayKey := strings.ReplaceAll(displayKey, `'`, `''`)
	return fmt.Sprintf(`
		WITH rows AS (
			SELECT value AS raw
			FROM jsonb_array_elements($2::jsonb)
		),
		normalized AS (
			SELECT
				raw,
				(raw->>'id')::uuid AS source_id,
				NULLIF(raw->>'code', '') AS code,
				COALESCE(
					NULLIF(raw->>'%s', ''),
					NULLIF(raw->>'full_name', ''),
					NULLIF(raw->>'username', ''),
					NULLIF(raw->>'code', ''),
					raw->>'id'
				) AS display_name,
				NULLIF(raw->>'created_date', '')::timestamptz AS source_created_at,
				NULLIF(raw->>'updated_date', '')::timestamptz AS source_updated_at,
				COALESCE(NULLIF(raw->>'is_active', '')::boolean, true) AS is_active,
				COALESCE(NULLIF(raw->>'is_deleted', '')::boolean, false) AS is_deleted
			FROM rows
			WHERE raw ? 'id'
			  AND COALESCE(raw->>'id', '') <> ''
		)
		INSERT INTO public.dc_master_record (
			site_id, table_name, source_id, code, display_name,
			source_created_at, source_updated_at, is_active, is_deleted, raw_payload
		)
		SELECT
			$1,
			'%s',
			source_id,
			code,
			display_name,
			source_created_at,
			source_updated_at,
			is_active,
			is_deleted,
			raw
		FROM normalized
		ON CONFLICT (site_id, table_name, source_id) DO UPDATE
		SET code = EXCLUDED.code,
		    display_name = EXCLUDED.display_name,
		    source_created_at = EXCLUDED.source_created_at,
		    source_updated_at = EXCLUDED.source_updated_at,
		    is_active = EXCLUDED.is_active,
		    is_deleted = EXCLUDED.is_deleted,
		    synced_at = now(),
		    updated_at = now(),
		    raw_payload = EXCLUDED.raw_payload
	`, escapedDisplayKey, escapedTable)
}
