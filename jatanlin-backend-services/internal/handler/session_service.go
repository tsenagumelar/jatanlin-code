package handler

import (
	"database/sql"
	"fmt"
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
}

// GetActiveSession returns the currently active session for the site
// Active session is one with status IN_PROGRESS (managed via Hasura)
func (s *SessionService) GetActiveSession() (*ActiveSession, error) {
	var session ActiveSession
	var endedAt sql.NullTime

	query := `
		SELECT id, code, site_id, started_at, ended_at, status
		FROM transact_wim_session
		WHERE site_id = $1
			AND status = 'IN_PROGRESS'
			AND is_active = true
			AND is_deleted = false
		ORDER BY started_at DESC
		LIMIT 1
	`

	err := s.DB.QueryRow(query, s.SiteUUID).Scan(
		&session.ID,
		&session.Code,
		&session.SiteID,
		&session.StartedAt,
		&endedAt,
		&session.Status,
	)

	if err == sql.ErrNoRows {
		return nil, nil // No active session
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

// GetWindowBoundaries returns the start and end time of the session window
// Used for filtering files based on captured_at timestamp
func (s *SessionService) GetWindowBoundaries(session *ActiveSession) (start time.Time, end time.Time) {
	start = session.StartedAt
	end = session.StartedAt.Add(time.Duration(s.SessionWindowSeconds) * time.Second)
	return
}
