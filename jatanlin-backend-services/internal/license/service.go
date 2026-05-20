package license

import (
	"strings"
	"time"
)

type Status string

const (
	StatusActive           Status = "ACTIVE"
	StatusGracePeriod      Status = "GRACE_PERIOD"
	StatusExpired          Status = "EXPIRED"
	StatusRevoked          Status = "REVOKED"
	StatusNoDongle         Status = "NO_DONGLE"
	StatusDongleMismatch   Status = "DONGLE_MISMATCH"
	StatusInvalidSignature Status = "INVALID_SIGNATURE"
)

type Service struct {
	enabled bool
	status  Status
}

func NewService(enabled bool, configuredStatus string) *Service {
	status := parseStatus(configuredStatus)
	return &Service{
		enabled: enabled,
		status:  status,
	}
}

func (s *Service) Evaluate() Status {
	if !s.enabled {
		return StatusActive
	}
	return s.status
}

func (s *Service) IsAllowed() bool {
	current := s.Evaluate()
	return current == StatusActive || current == StatusGracePeriod
}

func (s *Service) StatusPayload() map[string]any {
	now := time.Now().UTC().Format(time.RFC3339)
	current := s.Evaluate()
	return map[string]any{
		"enabled":      s.enabled,
		"status":       current,
		"is_allowed":   s.IsAllowed(),
		"evaluated_at": now,
		"mode":         "MOCK",
	}
}

func parseStatus(value string) Status {
	switch strings.ToUpper(strings.TrimSpace(value)) {
	case string(StatusActive):
		return StatusActive
	case string(StatusGracePeriod):
		return StatusGracePeriod
	case string(StatusExpired):
		return StatusExpired
	case string(StatusRevoked):
		return StatusRevoked
	case string(StatusNoDongle):
		return StatusNoDongle
	case string(StatusDongleMismatch):
		return StatusDongleMismatch
	case string(StatusInvalidSignature):
		return StatusInvalidSignature
	default:
		return StatusActive
	}
}
