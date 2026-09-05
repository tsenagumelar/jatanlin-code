package api

import (
	"net/http"
	"strconv"
	"strings"
	"time"
)

type transactionListItem struct {
	ID                 string     `json:"id"`
	Time               time.Time  `json:"time"`
	TransactionNo      string     `json:"transaction_no"`
	PlateNo            string     `json:"plate_no"`
	Location           string     `json:"location"`
	ViolationStatus    string     `json:"violation_status"`
	ViolationNotes     string     `json:"violation_notes"`
	VerificationStatus string     `json:"verification_status"`
	Officer            string     `json:"officer"`
	SiteID             string     `json:"site_id"`
	SiteCode           string     `json:"site_code"`
	SiteName           string     `json:"site_name"`
	ETLENASStatus      string     `json:"etlenas_status"`
	ETLENASError       string     `json:"etlenas_error"`
	ETLENASSyncedAt    *time.Time `json:"etlenas_synced_at"`
	ANPRImageURL       string     `json:"anpr_image_url"`
	ANPRImageBucket    string     `json:"-"`
	ANPRImageObject    string     `json:"-"`
}

func (s *Server) handleTransactions(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	page := positiveQueryInt(query.Get("page"), 1)
	pageSize := positiveQueryInt(query.Get("page_size"), 25)
	if pageSize > 100 {
		pageSize = 100
	}

	startAt, err := optionalListDate(query.Get("start_date"), false)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid start_date; expected YYYY-MM-DD")
		return
	}
	endAt, err := optionalListDate(query.Get("end_date"), true)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid end_date; expected YYYY-MM-DD")
		return
	}
	if startAt != nil && endAt != nil && !endAt.After(*startAt) {
		writeError(w, http.StatusBadRequest, errInvalidDateRange.Error())
		return
	}

	status := strings.ToLower(strings.TrimSpace(query.Get("status")))
	if status != "" && status != "verified" && status != "pending" && status != "rejected" && status != "draft" {
		writeError(w, http.StatusBadRequest, "invalid status")
		return
	}

	rows, err := s.DB.Query(`
		SELECT
			v.id::text,
			COALESCE(v.enforcement_started_at, v.created_at),
			COALESCE(v.transaction_no, ''),
			COALESCE(v.plate_no, ''),
			COALESCE(v.location_address, s.site_name),
			COALESCE(v.violation_status, 'pending'),
			COALESCE(v.violation_notes, ''),
			COALESCE(v.operator_name, ''),
			s.id::text,
			s.site_code,
			s.site_name,
			status.verification_status,
			COALESCE(delivery.delivery_status, ''),
			COALESCE(delivery.error_message, ''),
			delivery.synced_at,
			COALESCE(anpr_image.bucket, ''),
			COALESCE(anpr_image.object_key, ''),
			COUNT(*) OVER()::int
		FROM public.dc_dashboard_vehicle_actual v
		JOIN public.dc_site s ON s.id = v.site_id
		LEFT JOIN public.dc_transact_vehicle_actual actual
		  ON actual.site_id=v.site_id AND actual.source_id::text=v.source_id
		LEFT JOIN LATERAL (
			SELECT COALESCE(
				(SELECT LOWER(tvs.status)
				 FROM public.dc_transact_vehicle_status tvs
				 WHERE tvs.site_id = v.site_id
				   AND tvs.source_vehicle_actual_id::text = v.source_id
				   AND COALESCE(tvs.is_deleted, false) = false
				 ORDER BY COALESCE(tvs.updated_date, tvs.created_date, tvs.synced_at) DESC
				 LIMIT 1),
				CASE WHEN v.violation_status IN ('normal', 'violation') THEN 'verified' ELSE LOWER(v.violation_status) END,
				'pending'
			) AS verification_status
		) status ON true
		LEFT JOIN LATERAL (
			SELECT d.delivery_status,d.error_message,d.synced_at
			FROM public.dc_etlenas_delivery d
			WHERE d.site_id=v.site_id AND d.source_vehicle_actual_id::text=v.source_id
			ORDER BY d.started_at DESC
			LIMIT 1
		) delivery ON true
		LEFT JOIN LATERAL (
			SELECT attachment.bucket,attachment.object_key
			FROM public.dc_vehicle_attachment attachment
			WHERE attachment.site_id=v.site_id
			  AND (attachment.raw_payload->>'source_id'=actual.source_anpr_id::text
			       OR attachment.site_transaction_id::text=actual.source_anpr_id::text)
			  AND attachment.attachment_type IN ('anpr_full_image','anpr_plate_image')
			  AND attachment.upload_status='completed'
			  AND COALESCE(attachment.is_deleted,false)=false
			ORDER BY CASE WHEN attachment.attachment_type='anpr_full_image' THEN 0 ELSE 1 END,
			         attachment.synced_at DESC
			LIMIT 1
		) anpr_image ON true
		WHERE COALESCE(v.is_deleted, false) = false
		  AND ($1::timestamptz IS NULL OR COALESCE(v.enforcement_started_at, v.created_at) >= $1)
		  AND ($2::timestamptz IS NULL OR COALESCE(v.enforcement_started_at, v.created_at) < $2)
		  AND ($3 = '' OR s.id::text = $3)
		  AND ($4 = '' OR status.verification_status = $4)
		  AND (
			$5 = '' OR
			COALESCE(v.plate_no, '') ILIKE '%%' || $5 || '%%' OR
			COALESCE(v.transaction_no, '') ILIKE '%%' || $5 || '%%' OR
			COALESCE(v.location_address, '') ILIKE '%%' || $5 || '%%' OR
			COALESCE(v.violation_notes, '') ILIKE '%%' || $5 || '%%' OR
			COALESCE(v.operator_name, '') ILIKE '%%' || $5 || '%%' OR
			s.site_code ILIKE '%%' || $5 || '%%' OR
			s.site_name ILIKE '%%' || $5 || '%%'
		  )
		ORDER BY COALESCE(v.enforcement_started_at, v.created_at) DESC
		LIMIT $6 OFFSET $7
	`, startAt, endAt, strings.TrimSpace(query.Get("site_id")), status, strings.TrimSpace(query.Get("q")), pageSize, (page-1)*pageSize)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	items := []transactionListItem{}
	total := 0
	for rows.Next() {
		var item transactionListItem
		if err := rows.Scan(
			&item.ID, &item.Time, &item.TransactionNo, &item.PlateNo,
			&item.Location, &item.ViolationStatus, &item.ViolationNotes,
			&item.Officer, &item.SiteID, &item.SiteCode, &item.SiteName,
			&item.VerificationStatus, &item.ETLENASStatus, &item.ETLENASError,
			&item.ETLENASSyncedAt, &item.ANPRImageBucket, &item.ANPRImageObject, &total,
		); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		item.ANPRImageURL = minIOPublicObjectURL(s.Config.MinIOPublicEndpoint, item.ANPRImageBucket, item.ANPRImageObject)
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	sites, err := s.transactionFilterSites()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items": items,
		"sites": sites,
		"pagination": map[string]int{
			"page": page, "page_size": pageSize, "total": total,
		},
	})
}

func (s *Server) handleTransactionETLENASSync(w http.ResponseWriter, r *http.Request) {
	transactionID := strings.TrimSpace(r.PathValue("id"))
	if transactionID == "" {
		writeError(w, http.StatusBadRequest, "transaction id is required")
		return
	}
	if s.ETLENAS == nil {
		writeError(w, http.StatusServiceUnavailable, "ETLENAS service is unavailable")
		return
	}

	status, err := s.ETLENAS.DeliverTransaction(r.Context(), transactionID)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]any{
			"success": false,
			"status":  status,
			"error":   err.Error(),
		})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"status":  status,
	})
}

func (s *Server) transactionFilterSites() ([]map[string]string, error) {
	rows, err := s.DB.Query(`
		SELECT id::text, site_code, site_name
		FROM public.dc_site
		WHERE COALESCE(is_deleted, false) = false
		ORDER BY site_code
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	sites := []map[string]string{}
	for rows.Next() {
		var id, code, name string
		if err := rows.Scan(&id, &code, &name); err != nil {
			return nil, err
		}
		sites = append(sites, map[string]string{"id": id, "site_code": code, "site_name": name})
	}
	return sites, rows.Err()
}

func positiveQueryInt(value string, fallback int) int {
	parsed, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil || parsed < 1 {
		return fallback
	}
	return parsed
}

func optionalListDate(value string, endExclusive bool) (*time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	parsed, err := time.ParseInLocation("2006-01-02", value, time.Local)
	if err != nil {
		return nil, err
	}
	if endExclusive {
		parsed = parsed.AddDate(0, 0, 1)
	}
	return &parsed, nil
}
