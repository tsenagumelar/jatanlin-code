package source

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

const (
	ModeReal     = "REAL"
	ModeDummy    = "DUMMY"
	ModeDisabled = "DISABLED"
)

// GetMode returns the immutable mode selected for one source in one session.
// Site is part of the lookup to prevent data from a mobile deployment being
// attached to a session owned by another site.
func GetMode(ctx context.Context, db *sql.DB, siteID, sessionID uuid.UUID, sourceType string) (string, error) {
	var mode string
	err := db.QueryRowContext(ctx, `
		SELECT source_mode
		FROM public.transact_session_source
		WHERE site_id=$1 AND session_id=$2 AND source_type=$3
		  AND is_active=true AND is_deleted=false
	`, siteID, sessionID, sourceType).Scan(&mode)
	if err == sql.ErrNoRows {
		return "", fmt.Errorf("source configuration not found: site=%s session=%s source=%s", siteID, sessionID, sourceType)
	}
	if err != nil {
		return "", fmt.Errorf("query source mode: %w", err)
	}
	return mode, nil
}

func MarkReceived(ctx context.Context, db *sql.DB, siteID, sessionID uuid.UUID, sourceType string, recordID uuid.UUID) error {
	result, err := db.ExecContext(ctx, `
		UPDATE public.transact_session_source
		SET source_status='RECEIVED', source_record_id=$4, received_at=COALESCE(received_at, now()),
		    last_attempt_at=now(),
		    attempt_count=CASE WHEN source_status='RECEIVED' THEN attempt_count ELSE attempt_count+1 END,
		    error_code=NULL, error_message=NULL, updated_date=now()
		WHERE site_id=$1 AND session_id=$2 AND source_type=$3
		  AND source_mode<>'DISABLED' AND is_active=true AND is_deleted=false
	`, siteID, sessionID, sourceType, recordID)
	if err != nil {
		return fmt.Errorf("mark source received: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("read source update result: %w", err)
	}
	if rows != 1 {
		return fmt.Errorf("source state not updated: site=%s session=%s source=%s", siteID, sessionID, sourceType)
	}
	return nil
}

func MarkFailed(ctx context.Context, db *sql.DB, siteID, sessionID uuid.UUID, sourceType, code, message string) error {
	_, err := db.ExecContext(ctx, `
		UPDATE public.transact_session_source
		SET source_status='FAILED', last_attempt_at=now(), attempt_count=attempt_count+1,
		    error_code=$4, error_message=$5, updated_date=now()
		WHERE site_id=$1 AND session_id=$2 AND source_type=$3
		  AND source_status<>'RECEIVED' AND source_mode<>'DISABLED'
	`, siteID, sessionID, sourceType, code, message)
	if err != nil {
		return fmt.Errorf("mark source failed: %w", err)
	}
	return nil
}
