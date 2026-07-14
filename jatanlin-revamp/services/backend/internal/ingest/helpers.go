package ingest

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

func ParseFrameTime(value string) (time.Time, error) {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		loc = time.Local
	}
	return time.ParseInLocation("2006.01.02 15:04:05.000", value, loc)
}

func NullableTrimmedString(value string) sql.NullString {
	trimmed := strings.TrimSpace(value)
	return sql.NullString{String: trimmed, Valid: trimmed != ""}
}

func PickPreferredString(primary, fallback sql.NullString) sql.NullString {
	if primary.Valid {
		return primary
	}
	return fallback
}

func PickPreferredTime(primary, fallback sql.NullTime) sql.NullTime {
	if primary.Valid {
		return primary
	}
	return fallback
}

func PickPreferredInt32(primary, fallback sql.NullInt32) sql.NullInt32 {
	if primary.Valid {
		return primary
	}
	return fallback
}

func BuildDummyPlate(id uuid.UUID) string {
	shortID := strings.ToUpper(strings.ReplaceAll(id.String()[:8], "-", ""))
	return fmt.Sprintf("B%sDUM", shortID[:4])
}
