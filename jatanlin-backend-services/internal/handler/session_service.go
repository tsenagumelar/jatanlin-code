package handler

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

// SessionService handles WIM session management for listeners
type SessionService struct {
	DB                   *sql.DB
	SiteUUID             string
	SessionWindowSeconds int
}

// NewSessionService creates a new session service
func NewSessionService(db *sql.DB, siteUUID string, windowSeconds int) *SessionService {
	return &SessionService{
		DB:                   db,
		SiteUUID:             siteUUID,
		SessionWindowSeconds: windowSeconds,
	}
}

// ActiveSession represents an active WIM session
type ActiveSession struct {
	ID        uuid.UUID
	Code      string
	SiteID    uuid.UUID
	StartedAt time.Time
	EndedAt   *time.Time // For window calculation
	Status    string
	IsDummy   bool
}

// GetActiveSession returns the currently active session for the site
// Active session is one with status IN_PROGRESS (managed via Hasura)
func (s *SessionService) GetActiveSession() (*ActiveSession, error) {
	var session ActiveSession
	var endedAt sql.NullTime

	queryBySite := `
		SELECT id, code, site_id, started_at, ended_at, status, COALESCE(is_dummy, false)
		FROM transact_wim_session
		WHERE site_id = $1
			AND status = 'IN_PROGRESS'
			AND is_active = true
			AND is_deleted = false
		ORDER BY started_at DESC
		LIMIT 1
	`

	err := s.DB.QueryRow(queryBySite, s.SiteUUID).Scan(
		&session.ID,
		&session.Code,
		&session.SiteID,
		&session.StartedAt,
		&endedAt,
		&session.Status,
		&session.IsDummy,
	)

	if err == sql.ErrNoRows {
		// Fallback for single-site deployments where SITE_CODE/SITE_UUID can drift
		// from web session site_id. Keep service running while exposing warning log.
		queryAnySite := `
			SELECT id, code, site_id, started_at, ended_at, status, COALESCE(is_dummy, false)
			FROM transact_wim_session
			WHERE status = 'IN_PROGRESS'
				AND is_active = true
				AND is_deleted = false
			ORDER BY started_at DESC
			LIMIT 1
		`
		errAny := s.DB.QueryRow(queryAnySite).Scan(
			&session.ID,
			&session.Code,
			&session.SiteID,
			&session.StartedAt,
			&endedAt,
			&session.Status,
			&session.IsDummy,
		)
		if errAny == sql.ErrNoRows {
			s.logNoActiveSessionDiagnostics()
			return nil, nil // No active session
		}
		if errAny != nil {
			return nil, fmt.Errorf("failed to query active session fallback: %w", errAny)
		}
		log.Printf("[SESSION] WARNING: site-filtered active session not found for site_id=%s, using fallback session_id=%s site_id=%s",
			s.SiteUUID, session.ID.String(), session.SiteID.String())
	} else if err != nil {
		return nil, fmt.Errorf("failed to query active session: %w", err)
	}

	if endedAt.Valid {
		session.EndedAt = &endedAt.Time
	}

	// Note: Session completion is managed via Hasura/Frontend
	// No auto-complete logic here

	return &session, nil
}

func (s *SessionService) logNoActiveSessionDiagnostics() {
	// Best-effort diagnostics: avoid breaking runtime if diagnostics query fails.
	const sqlText = `
		SELECT
			current_database() AS db_name,
			current_user AS db_user,
			(SELECT COUNT(*) FROM transact_wim_session WHERE status = 'IN_PROGRESS' AND is_active = true AND is_deleted = false) AS total_active_rows,
			(SELECT COUNT(*) FROM transact_wim_session WHERE site_id = $1) AS site_rows,
			(SELECT COUNT(*) FROM transact_wim_session WHERE site_id = $1 AND status = 'IN_PROGRESS') AS site_in_progress_rows,
			(SELECT COUNT(*) FROM transact_wim_session WHERE site_id = $1 AND status = 'IN_PROGRESS' AND is_active = true AND is_deleted = false) AS site_effective_rows
	`

	var (
		dbName         string
		dbUser         string
		totalActive    int
		siteRows       int
		siteInProgress int
		siteEffective  int
	)
	if err := s.DB.QueryRow(sqlText, s.SiteUUID).Scan(&dbName, &dbUser, &totalActive, &siteRows, &siteInProgress, &siteEffective); err != nil {
		log.Printf("[SESSION] No active session for site_id=%s (diagnostics failed: %v)", s.SiteUUID, err)
		return
	}

	log.Printf(
		"[SESSION] No active IN_PROGRESS session for site_id=%s | db=%s user=%s total_active_rows=%d site_rows=%d site_in_progress_rows=%d site_effective_rows=%d",
		s.SiteUUID, dbName, dbUser, totalActive, siteRows, siteInProgress, siteEffective,
	)
}

// GetWindowBoundaries returns the start and end time of the session window
// Used for filtering files based on captured_at timestamp
func (s *SessionService) GetWindowBoundaries(session *ActiveSession) (start time.Time, end time.Time) {
	start = session.StartedAt
	end = session.StartedAt.Add(time.Duration(s.SessionWindowSeconds) * time.Second)
	return
}
