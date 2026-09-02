package api

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"strings"
	"time"
)

type syncHeartbeatRequest struct {
	SiteCode           string     `json:"site_code"`
	SiteName           string     `json:"site_name"`
	SiteAddress        string     `json:"site_address"`
	City               string     `json:"city"`
	Province           string     `json:"province"`
	OperationalStatus  string     `json:"operational_status"`
	ActiveOperatorID   *string    `json:"active_operator_id"`
	ActiveOperatorName string     `json:"active_operator_name"`
	LastSeenAt         *time.Time `json:"last_seen_at"`
	AppVersion         string     `json:"app_version"`
	ServiceVersion     string     `json:"service_version"`
}

type syncVehicleBatchRequest struct {
	SiteCode            string              `json:"site_code"`
	LastSourceUpdatedAt *time.Time          `json:"last_source_updated_at"`
	LastSiteSequence    *int64              `json:"last_site_sequence"`
	Records             []syncVehicleRecord `json:"records"`
}

type syncVehicleRecord struct {
	SiteTransactionID     string          `json:"site_transaction_id"`
	TransactionNo         string          `json:"transaction_no"`
	PlateNo               string          `json:"plate_no"`
	VehicleClass          string          `json:"vehicle_class"`
	OperatorName          string          `json:"operator_name"`
	LocationLat           *float64        `json:"location_lat"`
	LocationLng           *float64        `json:"location_lng"`
	LocationAddress       string          `json:"location_address"`
	TotalWeight           *float64        `json:"total_weight"`
	LengthMM              *float64        `json:"length_mm"`
	WidthMM               *float64        `json:"width_mm"`
	HeightMM              *float64        `json:"height_mm"`
	AxleCount             *int            `json:"axle_count"`
	ViolationStatus       string          `json:"violation_status"`
	ViolationNotes        string          `json:"violation_notes"`
	EnforcementStartedAt  *time.Time      `json:"enforcement_started_at"`
	EnforcementFinishedAt *time.Time      `json:"enforcement_finished_at"`
	SourceUpdatedAt       *time.Time      `json:"source_updated_at"`
	RawPayload            json.RawMessage `json:"raw_payload"`
	IsDeleted             bool            `json:"is_deleted"`
}

type syncAttachmentCompleteRequest struct {
	SiteCode string                 `json:"site_code"`
	Records  []syncAttachmentRecord `json:"records"`
}

type syncAttachmentPrepareRequest struct {
	SiteCode string                 `json:"site_code"`
	Records  []syncAttachmentRecord `json:"records"`
}

type syncAttachmentRecord struct {
	SiteAttachmentID  string          `json:"site_attachment_id"`
	SiteTransactionID string          `json:"site_transaction_id"`
	AttachmentType    string          `json:"attachment_type"`
	ObjectKey         string          `json:"object_key"`
	FileName          string          `json:"file_name"`
	MimeType          string          `json:"mime_type"`
	FileSize          *int64          `json:"file_size"`
	Checksum          string          `json:"checksum"`
	UploadStatus      string          `json:"upload_status"`
	SourceCreatedAt   *time.Time      `json:"source_created_at"`
	SourceUpdatedAt   *time.Time      `json:"source_updated_at"`
	RawPayload        json.RawMessage `json:"raw_payload"`
	IsDeleted         bool            `json:"is_deleted"`
}

type syncCursorRequest struct {
	SiteCode            string     `json:"site_code"`
	SyncType            string     `json:"sync_type"`
	LastSourceUpdatedAt *time.Time `json:"last_source_updated_at"`
	LastSiteSequence    *int64     `json:"last_site_sequence"`
	LastError           string     `json:"last_error"`
	RetryCount          int        `json:"retry_count"`
}

func (s *Server) handleSyncHeartbeat(w http.ResponseWriter, r *http.Request) {
	var request syncHeartbeatRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	request.SiteCode = strings.TrimSpace(request.SiteCode)
	if request.SiteCode == "" {
		writeError(w, http.StatusBadRequest, "site_code is required")
		return
	}
	if strings.TrimSpace(request.SiteName) == "" {
		request.SiteName = request.SiteCode
	}
	if strings.TrimSpace(request.OperationalStatus) == "" {
		request.OperationalStatus = "online"
	}
	lastSeen := time.Now()
	if request.LastSeenAt != nil {
		lastSeen = *request.LastSeenAt
	}

	var siteID string
	err := s.DB.QueryRow(`
		INSERT INTO public.dc_site (
			site_code,
			site_name,
			site_address,
			city,
			province,
			operational_status,
			active_operator_id,
			active_operator_name,
			last_seen_at,
			last_sync_at,
			app_version,
			service_version
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10, $11)
		ON CONFLICT (site_code) DO UPDATE
		SET site_name = EXCLUDED.site_name,
		    site_address = EXCLUDED.site_address,
		    city = EXCLUDED.city,
		    province = EXCLUDED.province,
		    operational_status = EXCLUDED.operational_status,
		    active_operator_id = EXCLUDED.active_operator_id,
		    active_operator_name = EXCLUDED.active_operator_name,
		    last_seen_at = EXCLUDED.last_seen_at,
		    last_sync_at = now(),
		    app_version = EXCLUDED.app_version,
		    service_version = EXCLUDED.service_version,
		    is_active = true,
		    is_deleted = false,
		    updated_at = now()
		RETURNING id::text
	`, request.SiteCode, request.SiteName, nullString(request.SiteAddress), nullString(request.City), nullString(request.Province), request.OperationalStatus, nullUUID(request.ActiveOperatorID), nullString(request.ActiveOperatorName), lastSeen, nullString(request.AppVersion), nullString(request.ServiceVersion)).Scan(&siteID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"site_id": siteID,
		"status":  "accepted",
	})
}

func (s *Server) handleSyncVehicleActualBatch(w http.ResponseWriter, r *http.Request) {
	var request syncVehicleBatchRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	siteID, ok := s.lookupSiteID(w, request.SiteCode)
	if !ok {
		return
	}

	success := 0
	failed := 0
	for _, record := range request.Records {
		if strings.TrimSpace(record.SiteTransactionID) == "" {
			failed++
			continue
		}
		rawPayload := record.RawPayload
		if len(rawPayload) == 0 {
			rawPayload = []byte(`{}`)
		}
		_, err := s.DB.Exec(`
			INSERT INTO public.dc_vehicle_actual (
				site_id,
				site_transaction_id,
				transaction_no,
				plate_no,
				vehicle_class,
				operator_name,
				location_lat,
				location_lng,
				location_address,
				total_weight,
				length_mm,
				width_mm,
				height_mm,
				axle_count,
				violation_status,
				violation_notes,
				enforcement_started_at,
				enforcement_finished_at,
				source_updated_at,
				raw_payload,
				is_deleted
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, COALESCE(NULLIF($15, ''), 'pending'), $16, $17, $18, $19, $20, $21)
			ON CONFLICT (site_id, site_transaction_id) DO UPDATE
			SET transaction_no = EXCLUDED.transaction_no,
			    plate_no = EXCLUDED.plate_no,
			    vehicle_class = EXCLUDED.vehicle_class,
			    operator_name = EXCLUDED.operator_name,
			    location_lat = EXCLUDED.location_lat,
			    location_lng = EXCLUDED.location_lng,
			    location_address = EXCLUDED.location_address,
			    total_weight = EXCLUDED.total_weight,
			    length_mm = EXCLUDED.length_mm,
			    width_mm = EXCLUDED.width_mm,
			    height_mm = EXCLUDED.height_mm,
			    axle_count = EXCLUDED.axle_count,
			    violation_status = EXCLUDED.violation_status,
			    violation_notes = EXCLUDED.violation_notes,
			    enforcement_started_at = EXCLUDED.enforcement_started_at,
			    enforcement_finished_at = EXCLUDED.enforcement_finished_at,
			    source_updated_at = EXCLUDED.source_updated_at,
			    synced_at = now(),
			    raw_payload = EXCLUDED.raw_payload,
			    is_deleted = EXCLUDED.is_deleted,
			    updated_at = now()
		`, siteID, record.SiteTransactionID, nullString(record.TransactionNo), nullString(record.PlateNo), nullString(record.VehicleClass), nullString(record.OperatorName), record.LocationLat, record.LocationLng, nullString(record.LocationAddress), record.TotalWeight, record.LengthMM, record.WidthMM, record.HeightMM, record.AxleCount, record.ViolationStatus, nullString(record.ViolationNotes), record.EnforcementStartedAt, record.EnforcementFinishedAt, record.SourceUpdatedAt, rawPayload, record.IsDeleted)
		if err != nil {
			failed++
			continue
		}
		success++
	}

	status := "success"
	if failed > 0 {
		status = "partial"
	}
	if err := s.writeSyncCursor(siteID, "vehicle_actual", request.LastSourceUpdatedAt, request.LastSiteSequence, ""); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_ = s.writeSyncLog(siteID, "vehicle_actual", status, len(request.Records), success, failed, "")

	writeJSON(w, http.StatusOK, map[string]any{
		"status":          status,
		"records_total":   len(request.Records),
		"records_success": success,
		"records_failed":  failed,
	})
}

func (s *Server) handleSyncAttachmentPrepare(w http.ResponseWriter, r *http.Request) {
	var request syncAttachmentPrepareRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	if _, ok := s.lookupSiteID(w, request.SiteCode); !ok {
		return
	}

	type preparedAttachment struct {
		SiteAttachmentID string `json:"site_attachment_id"`
		Bucket           string `json:"bucket"`
		ObjectKey        string `json:"object_key"`
		UploadURL        string `json:"upload_url"`
		UploadMode       string `json:"upload_mode"`
	}

	prepared := make([]preparedAttachment, 0, len(request.Records))
	for _, record := range request.Records {
		objectKey := strings.TrimSpace(record.ObjectKey)
		if objectKey == "" {
			objectKey = defaultAttachmentObjectKey(request.SiteCode, record)
		}
		prepared = append(prepared, preparedAttachment{
			SiteAttachmentID: record.SiteAttachmentID,
			Bucket:           s.Config.MinIOBucket,
			ObjectKey:        objectKey,
			UploadURL:        minIOPublicObjectURL(s.Config.MinIOPublicEndpoint, s.Config.MinIOBucket, objectKey),
			UploadMode:       "minio-object-target",
		})
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"bucket":      s.Config.MinIOBucket,
		"endpoint":    s.Config.MinIOPublicEndpoint,
		"attachments": prepared,
	})
}

func (s *Server) handleSyncAttachmentComplete(w http.ResponseWriter, r *http.Request) {
	var request syncAttachmentCompleteRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	siteID, ok := s.lookupSiteID(w, request.SiteCode)
	if !ok {
		return
	}

	success := 0
	failed := 0
	for _, record := range request.Records {
		if strings.TrimSpace(record.SiteAttachmentID) == "" {
			failed++
			continue
		}
		objectKey := strings.TrimSpace(record.ObjectKey)
		if objectKey == "" {
			objectKey = defaultAttachmentObjectKey(request.SiteCode, record)
		}
		status := strings.TrimSpace(record.UploadStatus)
		if status == "" {
			status = "completed"
		}
		rawPayload := record.RawPayload
		if len(rawPayload) == 0 {
			rawPayload = []byte(`{}`)
		}
		_, err := s.DB.Exec(`
			INSERT INTO public.dc_vehicle_attachment (
				site_id,
				vehicle_actual_id,
				site_attachment_id,
				site_transaction_id,
				attachment_type,
				bucket,
				object_key,
				file_name,
				mime_type,
				file_size,
				checksum,
				upload_status,
				source_created_at,
				source_updated_at,
				raw_payload,
				is_deleted
			)
			VALUES (
				$1,
				(SELECT id FROM public.dc_vehicle_actual WHERE site_id = $1 AND site_transaction_id = NULLIF($2, '')::uuid LIMIT 1),
				$3,
				NULLIF($2, '')::uuid,
				COALESCE(NULLIF($4, ''), 'evidence'),
				$5,
				$6,
				$7,
				$8,
				$9,
				$10,
				$11,
				$12,
				$13,
				$14,
				$15
			)
			ON CONFLICT (site_id, site_attachment_id) DO UPDATE
			SET vehicle_actual_id = EXCLUDED.vehicle_actual_id,
			    site_transaction_id = EXCLUDED.site_transaction_id,
			    attachment_type = EXCLUDED.attachment_type,
			    bucket = EXCLUDED.bucket,
			    object_key = EXCLUDED.object_key,
			    file_name = EXCLUDED.file_name,
			    mime_type = EXCLUDED.mime_type,
			    file_size = EXCLUDED.file_size,
			    checksum = EXCLUDED.checksum,
			    upload_status = EXCLUDED.upload_status,
			    source_created_at = EXCLUDED.source_created_at,
			    source_updated_at = EXCLUDED.source_updated_at,
			    synced_at = now(),
			    raw_payload = EXCLUDED.raw_payload,
			    is_deleted = EXCLUDED.is_deleted,
			    updated_at = now()
		`, siteID, record.SiteTransactionID, record.SiteAttachmentID, record.AttachmentType, s.Config.MinIOBucket, objectKey, nullString(record.FileName), nullString(record.MimeType), record.FileSize, nullString(record.Checksum), status, record.SourceCreatedAt, record.SourceUpdatedAt, rawPayload, record.IsDeleted)
		if err != nil {
			failed++
			continue
		}
		success++
	}

	status := "success"
	if failed > 0 {
		status = "partial"
	}
	_ = s.writeSyncLog(siteID, "attachment", status, len(request.Records), success, failed, "")

	writeJSON(w, http.StatusOK, map[string]any{
		"status":          status,
		"records_total":   len(request.Records),
		"records_success": success,
		"records_failed":  failed,
	})
}

func (s *Server) handleSyncCursor(w http.ResponseWriter, r *http.Request) {
	var request syncCursorRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	siteID, ok := s.lookupSiteID(w, request.SiteCode)
	if !ok {
		return
	}
	if strings.TrimSpace(request.SyncType) == "" {
		writeError(w, http.StatusBadRequest, "sync_type is required")
		return
	}
	if err := s.writeSyncCursor(siteID, request.SyncType, request.LastSourceUpdatedAt, request.LastSiteSequence, request.LastError); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "accepted"})
}

func (s *Server) lookupSiteID(w http.ResponseWriter, siteCode string) (string, bool) {
	siteCode = strings.TrimSpace(siteCode)
	if siteCode == "" {
		writeError(w, http.StatusBadRequest, "site_code is required")
		return "", false
	}
	var siteID string
	err := s.DB.QueryRow(`
		SELECT id::text
		FROM public.dc_site
		WHERE site_code = $1
		  AND COALESCE(is_deleted, false) = false
		LIMIT 1
	`, siteCode).Scan(&siteID)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "site not found, send heartbeat first")
		return "", false
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return "", false
	}
	return siteID, true
}

func (s *Server) writeSyncCursor(siteID string, syncType string, lastSourceUpdatedAt *time.Time, lastSiteSequence *int64, lastError string) error {
	syncType = strings.TrimSpace(syncType)
	if syncType == "" {
		syncType = "unknown"
	}
	_, err := s.DB.Exec(`
		INSERT INTO public.dc_site_sync_cursor (
			site_id,
			sync_type,
			last_source_updated_at,
			last_site_sequence,
			last_synced_at,
			last_error,
			retry_count
		)
		VALUES ($1, $2, $3, $4, now(), NULLIF($5, ''), CASE WHEN NULLIF($5, '') IS NULL THEN 0 ELSE 1 END)
		ON CONFLICT (site_id, sync_type) DO UPDATE
		SET last_source_updated_at = COALESCE(EXCLUDED.last_source_updated_at, public.dc_site_sync_cursor.last_source_updated_at),
		    last_site_sequence = COALESCE(EXCLUDED.last_site_sequence, public.dc_site_sync_cursor.last_site_sequence),
		    last_synced_at = now(),
		    last_error = EXCLUDED.last_error,
		    retry_count = CASE WHEN EXCLUDED.last_error IS NULL THEN 0 ELSE public.dc_site_sync_cursor.retry_count + 1 END,
		    updated_at = now()
	`, siteID, syncType, lastSourceUpdatedAt, lastSiteSequence, lastError)
	return err
}

func (s *Server) writeSyncLog(siteID string, syncType string, status string, total int, success int, failed int, message string) error {
	_, err := s.DB.Exec(`
		INSERT INTO public.dc_sync_log (
			site_id,
			sync_type,
			status,
			records_total,
			records_success,
			records_failed,
			message,
			finished_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, ''), now())
	`, siteID, syncType, status, total, success, failed, message)
	return err
}

func defaultAttachmentObjectKey(siteCode string, record syncAttachmentRecord) string {
	seed := strings.Join([]string{siteCode, record.SiteTransactionID, record.SiteAttachmentID, record.FileName}, ":")
	sum := sha256.Sum256([]byte(seed))
	ext := path.Ext(record.FileName)
	if ext == "" {
		ext = ".bin"
	}
	return fmt.Sprintf("%s/%s/%s%s", siteCode, time.Now().Format("2006/01/02"), hex.EncodeToString(sum[:12]), ext)
}

func nullString(value string) any {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}
	return value
}

func nullUUID(value *string) any {
	if value == nil || strings.TrimSpace(*value) == "" {
		return nil
	}
	return strings.TrimSpace(*value)
}
