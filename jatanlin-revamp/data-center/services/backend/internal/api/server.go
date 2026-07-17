package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"jatanlin-data-center-backend/internal/auth"
	"jatanlin-data-center-backend/internal/config"
)

type Server struct {
	DB     *sql.DB
	Config config.Config
	Auth   *auth.Service
}

func NewServer(db *sql.DB, cfg config.Config) *Server {
	return &Server{
		DB:     db,
		Config: cfg,
		Auth:   auth.NewService(db, cfg.JWTSecret),
	}
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", s.handleHealth)
	mux.HandleFunc("POST /api/auth/login", s.handleLogin)
	mux.HandleFunc("GET /api/auth/me", s.withAuth(s.handleMe))
	mux.HandleFunc("GET /api/data-center/overview", s.withAuth(s.handleOverview))
	mux.HandleFunc("GET /api/data-center/transactions/{id}", s.withAuth(s.handleTransactionDetail))
	mux.HandleFunc("POST /api/sync/heartbeat", s.withSiteSyncAuth(s.handleSyncHeartbeat))
	mux.HandleFunc("POST /api/sync/mirror/batch", s.withSiteSyncAuth(s.handleSyncMirrorBatch))
	mux.HandleFunc("POST /api/sync/vehicle-actual/batch", s.withSiteSyncAuth(s.handleSyncVehicleActualBatch))
	mux.HandleFunc("POST /api/sync/attachments/prepare", s.withSiteSyncAuth(s.handleSyncAttachmentPrepare))
	mux.HandleFunc("POST /api/sync/attachments/complete", s.withSiteSyncAuth(s.handleSyncAttachmentComplete))
	mux.HandleFunc("POST /api/sync/cursor", s.withSiteSyncAuth(s.handleSyncCursor))
	return s.withCORS(mux)
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	response, err := s.Auth.Login(strings.TrimSpace(request.Username), request.Password)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, response)
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
	claims, _ := r.Context().Value(claimsContextKey{}).(map[string]any)
	writeJSON(w, http.StatusOK, map[string]any{"claims": claims})
}

func (s *Server) handleOverview(w http.ResponseWriter, _ *http.Request) {
	var summary struct {
		TotalSites        int `json:"total_sites"`
		OnlineSites       int `json:"online_sites"`
		OfflineSites      int `json:"offline_sites"`
		ActiveOperators   int `json:"active_operators"`
		TodayTransactions int `json:"today_transactions"`
		TodayViolations   int `json:"today_violations"`
		TodayNormal       int `json:"today_normal"`
	}

	err := s.DB.QueryRow(`
		SELECT
			COUNT(*)::int,
			COUNT(*) FILTER (WHERE operational_status = 'online')::int,
			COUNT(*) FILTER (WHERE operational_status <> 'online')::int,
			COUNT(active_operator_name)::int
		FROM public.dc_site s
		WHERE COALESCE(is_deleted, false) = false
	`).Scan(&summary.TotalSites, &summary.OnlineSites, &summary.OfflineSites, &summary.ActiveOperators)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	err = s.DB.QueryRow(`
		SELECT
			COUNT(*)::int,
			COUNT(*) FILTER (WHERE violation_status = 'violation')::int,
			COUNT(*) FILTER (WHERE violation_status = 'normal')::int
		FROM public.dc_dashboard_vehicle_actual
		WHERE COALESCE(is_deleted, false) = false
		  AND enforcement_started_at >= date_trunc('day', now())
	`).Scan(&summary.TodayTransactions, &summary.TodayViolations, &summary.TodayNormal)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	rows, err := s.DB.Query(`
		WITH today_vehicle AS (
			SELECT
				site_id,
				COUNT(*)::int AS today_transactions,
				COUNT(*) FILTER (WHERE violation_status = 'violation')::int AS today_violations,
				COUNT(*) FILTER (WHERE violation_status = 'normal')::int AS today_normal,
				COUNT(*) FILTER (
					WHERE violation_status = 'violation'
					  AND COALESCE(violation_notes, '') ILIKE '%loading%'
				)::int AS today_over_loading,
				COUNT(*) FILTER (
					WHERE violation_status = 'violation'
					  AND COALESCE(violation_notes, '') NOT ILIKE '%loading%'
				)::int AS today_over_dimension
			FROM public.dc_dashboard_vehicle_actual
			WHERE COALESCE(is_deleted, false) = false
			  AND enforcement_started_at >= date_trunc('day', now())
			GROUP BY site_id
		)
		SELECT
			s.id::text,
			s.site_code,
			s.site_name,
			COALESCE(s.city, ''),
			COALESCE(s.province, ''),
			s.operational_status,
			COALESCE(s.active_operator_name, ''),
			s.last_seen_at,
			s.last_sync_at,
			COALESCE(v.today_transactions, 0),
			COALESCE(v.today_violations, 0),
			COALESCE(v.today_normal, 0),
			COALESCE(v.today_over_loading, 0),
			COALESCE(v.today_over_dimension, 0)
		FROM public.dc_site s
		LEFT JOIN today_vehicle v ON v.site_id = s.id
		WHERE COALESCE(s.is_deleted, false) = false
		ORDER BY s.site_code ASC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	type site struct {
		ID                 string     `json:"id"`
		SiteCode           string     `json:"site_code"`
		SiteName           string     `json:"site_name"`
		City               string     `json:"city"`
		Province           string     `json:"province"`
		OperationalStatus  string     `json:"operational_status"`
		ActiveOperatorName string     `json:"active_operator_name"`
		LastSeenAt         *time.Time `json:"last_seen_at"`
		LastSyncAt         *time.Time `json:"last_sync_at"`
		TodayTransactions  int        `json:"today_transactions"`
		TodayViolations    int        `json:"today_violations"`
		TodayNormal        int        `json:"today_normal"`
		TodayOverLoading   int        `json:"today_over_loading"`
		TodayOverDimension int        `json:"today_over_dimension"`
	}

	sites := []site{}
	for rows.Next() {
		var item site
		if err := rows.Scan(
			&item.ID,
			&item.SiteCode,
			&item.SiteName,
			&item.City,
			&item.Province,
			&item.OperationalStatus,
			&item.ActiveOperatorName,
			&item.LastSeenAt,
			&item.LastSyncAt,
			&item.TodayTransactions,
			&item.TodayViolations,
			&item.TodayNormal,
			&item.TodayOverLoading,
			&item.TodayOverDimension,
		); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		sites = append(sites, item)
	}

	recentRows, err := s.DB.Query(`
		SELECT
			v.id::text,
			COALESCE(v.enforcement_started_at, v.created_at),
			COALESCE(v.plate_no, ''),
			COALESCE(v.location_address, s.site_name),
			COALESCE(v.violation_status, 'pending'),
			COALESCE(v.violation_notes, ''),
			COALESCE(v.operator_name, ''),
			s.site_code,
			COALESCE(vs.status, CASE WHEN v.violation_status IN ('normal', 'violation') THEN 'verified' ELSE v.violation_status END, 'pending')
		FROM public.dc_dashboard_vehicle_actual v
		JOIN public.dc_site s ON s.id = v.site_id
		LEFT JOIN LATERAL (
			SELECT status
			FROM public.dc_transact_vehicle_status tvs
			WHERE tvs.site_id = v.site_id
			  AND tvs.source_vehicle_actual_id::text = v.source_id
			  AND COALESCE(tvs.is_deleted, false) = false
			ORDER BY COALESCE(tvs.updated_date, tvs.created_date, tvs.synced_at) DESC
			LIMIT 1
		) vs ON true
		WHERE COALESCE(v.is_deleted, false) = false
		ORDER BY COALESCE(v.enforcement_started_at, v.created_at) DESC
		LIMIT 10
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer recentRows.Close()

	type recentViolation struct {
		ID                 string    `json:"id"`
		Time               time.Time `json:"time"`
		PlateNo            string    `json:"plate_no"`
		Location           string    `json:"location"`
		ViolationStatus    string    `json:"violation_status"`
		ViolationNotes     string    `json:"violation_notes"`
		Officer            string    `json:"officer"`
		SiteCode           string    `json:"site_code"`
		VerificationStatus string    `json:"verification_status"`
	}

	recentViolations := []recentViolation{}
	for recentRows.Next() {
		var item recentViolation
		if err := recentRows.Scan(
			&item.ID,
			&item.Time,
			&item.PlateNo,
			&item.Location,
			&item.ViolationStatus,
			&item.ViolationNotes,
			&item.Officer,
			&item.SiteCode,
			&item.VerificationStatus,
		); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		recentViolations = append(recentViolations, item)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"summary":           summary,
		"sites":             sites,
		"recent_violations": recentViolations,
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
