package orchestrator

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

var ErrNoActiveSession = errors.New("no active session")

var sourceTypes = []string{"ANPR", "AXLE", "WIM", "CCTV", "DIMENSION"}

type Service struct {
	db             *sql.DB
	siteID         uuid.UUID
	defaultTimeout time.Duration
}

type StartRequest struct {
	SessionName          string            `json:"session_name"`
	SourceModes          map[string]string `json:"source_modes"`
	SourceTimeoutSeconds map[string]int    `json:"source_timeout_seconds"`
}

type FinalizeRequest struct {
	Latitude  *float64 `json:"latitude"`
	Longitude *float64 `json:"longitude"`
}

type SourceState struct {
	SourceType   string     `json:"source_type"`
	SourceMode   string     `json:"source_mode"`
	SourceStatus string     `json:"source_status"`
	DeviceID     *string    `json:"device_id"`
	RecordID     *string    `json:"source_record_id"`
	ReceivedAt   *time.Time `json:"received_at"`
	TimeoutAt    *time.Time `json:"timeout_at"`
	ErrorCode    *string    `json:"error_code"`
	ErrorMessage *string    `json:"error_message"`
}

type Session struct {
	ID        string        `json:"id"`
	Code      string        `json:"code"`
	SiteID    string        `json:"site_id"`
	Name      *string       `json:"session_name"`
	Status    string        `json:"status"`
	StartedAt time.Time     `json:"started_at"`
	EndedAt   *time.Time    `json:"ended_at"`
	StartedBy *string       `json:"started_by"`
	Sources   []SourceState `json:"sources"`
}

type FinalizeResult struct {
	Session      Session  `json:"session"`
	VehicleID    string   `json:"vehicle_actual_id"`
	Completeness string   `json:"completeness_status"`
	Missing      []string `json:"missing_sources"`
	AlreadyDone  bool     `json:"already_finalized"`
}

func NewService(db *sql.DB, siteID string, defaultTimeout time.Duration) (*Service, error) {
	parsedSiteID, err := uuid.Parse(strings.TrimSpace(siteID))
	if err != nil || parsedSiteID == uuid.Nil {
		return nil, fmt.Errorf("invalid orchestrator site id")
	}
	if defaultTimeout <= 0 {
		defaultTimeout = 60 * time.Second
	}
	return &Service{db: db, siteID: parsedSiteID, defaultTimeout: defaultTimeout}, nil
}

func (s *Service) Start(ctx context.Context, actorID string, req StartRequest) (*Session, bool, error) {
	actor, err := validUUID(actorID, "actor")
	if err != nil {
		return nil, false, err
	}
	modes, timeouts, err := s.normalizeSourceOptions(req)
	if err != nil {
		return nil, false, err
	}
	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		return nil, false, err
	}
	defer tx.Rollback()
	if _, err := tx.ExecContext(ctx, `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, s.siteID.String()); err != nil {
		return nil, false, err
	}
	existing, err := getActiveSession(ctx, tx, s.siteID)
	if err == nil {
		if err := attachLatestSourceRecords(ctx, tx, s.siteID, uuid.MustParse(existing.ID)); err != nil {
			return nil, false, err
		}
		if err := reconcileTimeouts(ctx, tx, existing.ID); err != nil {
			return nil, false, err
		}
		if err := loadSources(ctx, tx, existing); err != nil {
			return nil, false, err
		}
		if err := tx.Commit(); err != nil {
			return nil, false, err
		}
		return existing, true, nil
	}
	if !errors.Is(err, ErrNoActiveSession) {
		return nil, false, err
	}
	startedAt := time.Now()
	name := strings.TrimSpace(req.SessionName)
	if name == "" {
		name = "WIM-" + startedAt.Format("20060102-150405")
	}
	created := &Session{SiteID: s.siteID.String(), Status: "IN_PROGRESS", StartedAt: startedAt}
	if err := tx.QueryRowContext(ctx, `
		INSERT INTO public.transact_wim_session
		  (session_name, site_id, started_at, status, started_by, is_dummy, is_active, is_deleted, created_by, created_date)
		VALUES ($1, $2, $3, 'IN_PROGRESS', $4, $5, true, false, $4, $3)
		RETURNING id::text, code, session_name, started_by::text
	`, name, s.siteID, startedAt, actor, allSourcesDummy(modes)).Scan(&created.ID, &created.Code, &created.Name, &created.StartedBy); err != nil {
		return nil, false, err
	}
	for _, sourceType := range sourceTypes {
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO public.transact_session_source
			  (site_id, session_id, source_type, source_mode, source_status, device_id,
			   timeout_at, created_by, created_date)
			VALUES ($1, $2, $3, $4, $5,
			  (SELECT d.id FROM public.master_device d JOIN public.master_device_type dt ON dt.id=d.device_type_id
			   WHERE upper(dt.type_name)=$3 AND COALESCE(d.is_active,false)=true
			     AND COALESCE(d.is_deleted,false)=false ORDER BY d.created_date LIMIT 1),
			  $6, $7, $8)
		`, s.siteID, created.ID, sourceType, modes[sourceType], initialStatus(modes[sourceType]),
			startedAt.Add(timeouts[sourceType]), actor, startedAt); err != nil {
			return nil, false, err
		}
	}
	if err := loadSources(ctx, tx, created); err != nil {
		return nil, false, err
	}
	if err := tx.Commit(); err != nil {
		return nil, false, err
	}
	return created, false, nil
}

func (s *Service) Active(ctx context.Context) (*Session, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()
	session, err := getActiveSession(ctx, tx, s.siteID)
	if err != nil {
		return nil, err
	}
	if err := attachLatestSourceRecords(ctx, tx, s.siteID, uuid.MustParse(session.ID)); err != nil {
		return nil, err
	}
	if err := reconcileTimeouts(ctx, tx, session.ID); err != nil {
		return nil, err
	}
	if err := loadSources(ctx, tx, session); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return session, nil
}

func (s *Service) Finalize(ctx context.Context, actorID, sessionID string, req FinalizeRequest) (*FinalizeResult, error) {
	actor, err := validUUID(actorID, "actor")
	if err != nil {
		return nil, err
	}
	sessionUUID, err := validUUID(sessionID, "session")
	if err != nil {
		return nil, err
	}
	if err := validateCoordinates(req.Latitude, req.Longitude); err != nil {
		return nil, err
	}
	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()
	session, err := getSessionForUpdate(ctx, tx, s.siteID, sessionUUID)
	if err != nil {
		return nil, err
	}
	if existing, err := findActual(ctx, tx, s.siteID, sessionUUID); err == nil {
		if session.Status != "COMPLETED" {
			endedAt := time.Now()
			if _, err := tx.ExecContext(ctx, `UPDATE public.transact_wim_session
				SET status='COMPLETED',ended_at=COALESCE(ended_at,$3),ended_by=COALESCE(ended_by,$2),
				processed_vehicles=1,is_active=false,updated_by=$2,updated_date=$3 WHERE id=$1 AND site_id=$4`,
				sessionUUID, actor, endedAt, s.siteID); err != nil {
				return nil, err
			}
			session.Status = "COMPLETED"
			session.EndedAt = &endedAt
		}
		if err := loadSources(ctx, tx, session); err != nil {
			return nil, err
		}
		if err := tx.Commit(); err != nil {
			return nil, err
		}
		return &FinalizeResult{Session: *session, VehicleID: existing.ID, Completeness: existing.Completeness, Missing: existing.Missing, AlreadyDone: true}, nil
	} else if !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	if err := attachLatestSourceRecords(ctx, tx, s.siteID, sessionUUID); err != nil {
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, `
		UPDATE public.transact_session_source
		SET source_status='TIMEOUT', error_code=COALESCE(error_code,'FINALIZED_WITHOUT_DATA'),
		    error_message=COALESCE(error_message,'Session finalized before source data was received'),
		    updated_by=$2, updated_date=now()
		WHERE session_id=$1 AND source_status IN ('PENDING','WAITING')
	`, sessionUUID, actor); err != nil {
		return nil, err
	}
	actual, err := insertActual(ctx, tx, s.siteID, sessionUUID, actor, req)
	if err != nil {
		return nil, err
	}
	endedAt := time.Now()
	if _, err := tx.ExecContext(ctx, `
		UPDATE public.transact_wim_session
		SET status='COMPLETED', ended_at=$3, ended_by=$2, processed_vehicles=1, is_active=false,
		    updated_by=$2, updated_date=$3 WHERE id=$1 AND site_id=$4
	`, sessionUUID, actor, endedAt, s.siteID); err != nil {
		return nil, err
	}
	session.Status = "COMPLETED"
	session.EndedAt = &endedAt
	if err := loadSources(ctx, tx, session); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return &FinalizeResult{Session: *session, VehicleID: actual.ID, Completeness: actual.Completeness, Missing: actual.Missing}, nil
}

type actualSummary struct {
	ID           string
	Completeness string
	Missing      []string
}

func getActiveSession(ctx context.Context, tx *sql.Tx, siteID uuid.UUID) (*Session, error) {
	session := &Session{SiteID: siteID.String()}
	err := tx.QueryRowContext(ctx, `SELECT id::text,code,session_name,status,started_at,ended_at,started_by::text
		FROM public.transact_wim_session WHERE site_id=$1 AND status IN ('STARTED','IN_PROGRESS')
		AND COALESCE(is_active,false)=true AND COALESCE(is_deleted,false)=false
		ORDER BY started_at DESC LIMIT 1`, siteID).
		Scan(&session.ID, &session.Code, &session.Name, &session.Status, &session.StartedAt, &session.EndedAt, &session.StartedBy)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNoActiveSession
	}
	return session, err
}

func getSessionForUpdate(ctx context.Context, tx *sql.Tx, siteID, sessionID uuid.UUID) (*Session, error) {
	session := &Session{SiteID: siteID.String()}
	err := tx.QueryRowContext(ctx, `SELECT id::text,code,session_name,status,started_at,ended_at,started_by::text
		FROM public.transact_wim_session WHERE id=$1 AND site_id=$2
		AND COALESCE(is_deleted,false)=false FOR UPDATE`, sessionID, siteID).
		Scan(&session.ID, &session.Code, &session.Name, &session.Status, &session.StartedAt, &session.EndedAt, &session.StartedBy)
	return session, err
}

func loadSources(ctx context.Context, tx *sql.Tx, session *Session) error {
	rows, err := tx.QueryContext(ctx, `SELECT source_type,source_mode,source_status,device_id::text,
		source_record_id::text,received_at,timeout_at,error_code,error_message
		FROM public.transact_session_source WHERE session_id=$1 AND COALESCE(is_deleted,false)=false
		ORDER BY CASE source_type WHEN 'ANPR' THEN 1 WHEN 'AXLE' THEN 2 WHEN 'WIM' THEN 3 WHEN 'CCTV' THEN 4 ELSE 5 END`, session.ID)
	if err != nil {
		return err
	}
	defer rows.Close()
	session.Sources = make([]SourceState, 0, len(sourceTypes))
	for rows.Next() {
		var source SourceState
		if err := rows.Scan(&source.SourceType, &source.SourceMode, &source.SourceStatus, &source.DeviceID,
			&source.RecordID, &source.ReceivedAt, &source.TimeoutAt, &source.ErrorCode, &source.ErrorMessage); err != nil {
			return err
		}
		session.Sources = append(session.Sources, source)
	}
	return rows.Err()
}

func reconcileTimeouts(ctx context.Context, tx *sql.Tx, sessionID string) error {
	_, err := tx.ExecContext(ctx, `UPDATE public.transact_session_source
		SET source_status='TIMEOUT',error_code=COALESCE(error_code,'SOURCE_TIMEOUT'),
		error_message=COALESCE(error_message,'Source did not provide data before its deadline'),updated_date=now()
		WHERE session_id=$1 AND source_status IN ('PENDING','WAITING') AND timeout_at IS NOT NULL AND timeout_at<=now()`, sessionID)
	return err
}

func attachLatestSourceRecords(ctx context.Context, tx *sql.Tx, siteID, sessionID uuid.UUID) error {
	queries := map[string]string{
		"ANPR":      "SELECT id,COALESCE(captured_at,created_date) FROM public.transact_anpr_capture WHERE site_id=$1 AND session_id=$2 ORDER BY created_date DESC LIMIT 1",
		"AXLE":      "SELECT id,COALESCE(captured_at,created_date) FROM public.transact_axle_capture WHERE site_id=$1 AND session_id=$2 ORDER BY created_date DESC LIMIT 1",
		"WIM":       "SELECT id,created_date FROM public.transact_weighing WHERE site_id=$1 AND session_id=$2 ORDER BY created_date DESC LIMIT 1",
		"CCTV":      "SELECT id,created_date FROM public.transact_cctv WHERE site_id=$1 AND session_id=$2 ORDER BY created_date DESC LIMIT 1",
		"DIMENSION": "SELECT id,created_date FROM public.transact_dimension WHERE site_id=$1 AND session_id=$2 ORDER BY created_date DESC LIMIT 1",
	}
	for _, sourceType := range sourceTypes {
		var recordID uuid.UUID
		var receivedAt time.Time
		err := tx.QueryRowContext(ctx, queries[sourceType], siteID, sessionID).Scan(&recordID, &receivedAt)
		if errors.Is(err, sql.ErrNoRows) {
			continue
		}
		if err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, `UPDATE public.transact_session_source
			SET source_status='RECEIVED',source_record_id=$3,received_at=$4,error_code=NULL,error_message=NULL,updated_date=now()
			WHERE session_id=$1 AND source_type=$2`, sessionID, sourceType, recordID, receivedAt); err != nil {
			return err
		}
	}
	return nil
}

func insertActual(ctx context.Context, tx *sql.Tx, siteID, sessionID, actor uuid.UUID, req FinalizeRequest) (*actualSummary, error) {
	actual := &actualSummary{}
	err := tx.QueryRowContext(ctx, `
		WITH source AS (
		 SELECT max(source_record_id::text) FILTER(WHERE source_type='ANPR' AND source_status='RECEIVED')::uuid anpr_id,
		 max(source_record_id::text) FILTER(WHERE source_type='AXLE' AND source_status='RECEIVED')::uuid axle_id,
		 max(source_record_id::text) FILTER(WHERE source_type='WIM' AND source_status='RECEIVED')::uuid weighing_id,
		 max(source_record_id::text) FILTER(WHERE source_type='CCTV' AND source_status='RECEIVED')::uuid cctv_id,
		 max(source_record_id::text) FILTER(WHERE source_type='DIMENSION' AND source_status='RECEIVED')::uuid dimension_id,
		 array_agg(source_type ORDER BY source_type) FILTER(WHERE source_status<>'RECEIVED' AND source_mode<>'DISABLED') missing
		 FROM public.transact_session_source WHERE site_id=$1 AND session_id=$2
		), values_to_save AS (
		 SELECT source.*,COALESCE($4::numeric,ms.default_latitude) latitude,
		 COALESCE($5::numeric,ms.default_longitude) longitude,
		 CASE WHEN source.anpr_id IS NULL AND source.axle_id IS NULL AND source.weighing_id IS NULL
		 AND source.cctv_id IS NULL AND source.dimension_id IS NULL THEN 'EMPTY'
		 WHEN cardinality(COALESCE(source.missing,'{}'::text[]))=0 THEN 'COMPLETE'
		 ELSE 'PARTIAL' END completeness
		 FROM source CROSS JOIN public.master_site ms WHERE ms.id=$1
		)
		INSERT INTO public.transact_vehicle_actual
		(site_id,session_id,anpr_id,axle_id,transact_weighing_id,transact_cctv_id,transact_dimension_id,
		 actual_width,actual_length,actual_height,actual_weight,actual_plat_no,actual_total_axle,
		 location_lat,location_lng,completeness_status,missing_sources,verification_status,
		 is_active,is_deleted,created_by,created_date)
		SELECT $1,$2,v.anpr_id,v.axle_id,v.weighing_id,v.cctv_id,v.dimension_id,
		 d.width,COALESCE(d.length,a.length_mm/1000.0),d.height,w.total_weight,n.plate_no,
		 COALESCE(w.total_axle,a.total_axles),v.latitude,v.longitude,v.completeness,
		 COALESCE(v.missing,'{}'::text[]),'PENDING',true,false,$3,now()
		FROM values_to_save v LEFT JOIN public.transact_anpr_capture n ON n.id=v.anpr_id
		LEFT JOIN public.transact_axle_capture a ON a.id=v.axle_id
		LEFT JOIN public.transact_weighing w ON w.id=v.weighing_id
		LEFT JOIN public.transact_dimension d ON d.id=v.dimension_id
		ON CONFLICT (site_id,session_id) WHERE session_id IS NOT NULL DO NOTHING
		RETURNING id::text,completeness_status,missing_sources
	`, siteID, sessionID, actor, req.Latitude, req.Longitude).Scan(&actual.ID, &actual.Completeness, &actual.Missing)
	if errors.Is(err, sql.ErrNoRows) {
		return findActual(ctx, tx, siteID, sessionID)
	}
	return actual, err
}

func findActual(ctx context.Context, tx *sql.Tx, siteID, sessionID uuid.UUID) (*actualSummary, error) {
	actual := &actualSummary{}
	err := tx.QueryRowContext(ctx, `SELECT id::text,completeness_status,missing_sources
		FROM public.transact_vehicle_actual WHERE site_id=$1 AND session_id=$2 LIMIT 1`, siteID, sessionID).
		Scan(&actual.ID, &actual.Completeness, &actual.Missing)
	return actual, err
}

func (s *Service) normalizeSourceOptions(req StartRequest) (map[string]string, map[string]time.Duration, error) {
	normalizedModes := make(map[string]string, len(req.SourceModes))
	for key, value := range req.SourceModes {
		normalizedModes[strings.ToUpper(strings.TrimSpace(key))] = value
	}
	normalizedTimeouts := make(map[string]int, len(req.SourceTimeoutSeconds))
	for key, value := range req.SourceTimeoutSeconds {
		normalizedTimeouts[strings.ToUpper(strings.TrimSpace(key))] = value
	}
	modes := make(map[string]string, len(sourceTypes))
	timeouts := make(map[string]time.Duration, len(sourceTypes))
	for _, sourceType := range sourceTypes {
		mode := strings.ToUpper(strings.TrimSpace(normalizedModes[sourceType]))
		if mode == "" {
			mode = "REAL"
		}
		if mode != "REAL" && mode != "DUMMY" && mode != "DISABLED" {
			return nil, nil, fmt.Errorf("invalid source mode for %s", sourceType)
		}
		seconds := normalizedTimeouts[sourceType]
		if seconds == 0 {
			seconds = int(s.defaultTimeout / time.Second)
		}
		if seconds < 1 || seconds > 3600 {
			return nil, nil, fmt.Errorf("source timeout for %s must be between 1 and 3600 seconds", sourceType)
		}
		modes[sourceType] = mode
		timeouts[sourceType] = time.Duration(seconds) * time.Second
	}
	return modes, timeouts, nil
}

func initialStatus(mode string) string {
	if mode == "DISABLED" {
		return "SKIPPED"
	}
	return "WAITING"
}

func allSourcesDummy(modes map[string]string) bool {
	for _, sourceType := range sourceTypes {
		if modes[sourceType] != "DUMMY" {
			return false
		}
	}
	return true
}

func validUUID(value, field string) (uuid.UUID, error) {
	parsed, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil || parsed == uuid.Nil {
		return uuid.Nil, fmt.Errorf("invalid %s id", field)
	}
	return parsed, nil
}

func validateCoordinates(latitude, longitude *float64) error {
	if (latitude == nil) != (longitude == nil) {
		return errors.New("latitude and longitude must be provided together")
	}
	if latitude != nil && (*latitude < -90 || *latitude > 90 || *longitude < -180 || *longitude > 180) {
		return errors.New("invalid coordinates")
	}
	return nil
}
