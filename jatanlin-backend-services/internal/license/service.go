package license

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type Status string

const (
	StatusActive        Status = "active"
	StatusMissing       Status = "missing"
	StatusExpired       Status = "expired"
	StatusInvalid       Status = "invalid"
	StatusInvalidSite   Status = "invalid_site"
	StatusInvalidDevice Status = "invalid_device"
)

type License struct {
	Version    string   `json:"version"`
	LicenseID  string   `json:"license_id"`
	SiteID     string   `json:"site_id"`
	IssuedTo   string   `json:"issued_to"`
	IssuedBy   string   `json:"issued_by"`
	IssuedAt   string   `json:"issued_at"`
	ExpiresAt  string   `json:"expires_at"`
	Modules    []string `json:"modules"`
	MaxDevices int      `json:"max_devices"`
	HardwareID string   `json:"hardware_id,omitempty"`
	Signature  string   `json:"signature"`
}

type CheckResult struct {
	Status    Status   `json:"status"`
	Valid     bool     `json:"valid"`
	Message   string   `json:"message"`
	License   *License `json:"license,omitempty"`
	Source    string   `json:"source,omitempty"`
	CheckedAt string   `json:"checked_at"`
}

type Service struct {
	StorePath  string
	PublicKey  ed25519.PublicKey
	SiteID     string
	HardwareID string
}

func NewService(storePath, publicKeyB64, siteID, hardwareID string) (*Service, error) {
	if storePath == "" {
		storePath = "./data/license.veam"
	}

	var publicKey ed25519.PublicKey
	if publicKeyB64 != "" {
		key, err := base64.StdEncoding.DecodeString(publicKeyB64)
		if err != nil {
			return nil, fmt.Errorf("decode VEAM_PUBLIC_KEY_B64: %w", err)
		}
		if len(key) != ed25519.PublicKeySize {
			return nil, fmt.Errorf("VEAM_PUBLIC_KEY_B64 must decode to %d bytes", ed25519.PublicKeySize)
		}
		publicKey = ed25519.PublicKey(key)
	}

	return &Service{
		StorePath:  storePath,
		PublicKey:  publicKey,
		SiteID:     strings.TrimSpace(siteID),
		HardwareID: strings.TrimSpace(hardwareID),
	}, nil
}

func (s *Service) Status() CheckResult {
	raw, err := os.ReadFile(s.StorePath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return s.result(StatusMissing, "Lisensi belum diaktifkan", nil, "stored")
		}
		return s.result(StatusInvalid, fmt.Sprintf("Gagal membaca lisensi: %v", err), nil, "stored")
	}

	return s.Validate(string(raw), "stored")
}

func (s *Service) Activate(raw, source string) CheckResult {
	result := s.Validate(raw, source)
	if !result.Valid {
		return result
	}

	if err := os.MkdirAll(filepath.Dir(s.StorePath), 0o755); err != nil {
		return s.result(StatusInvalid, fmt.Sprintf("Gagal menyiapkan direktori lisensi: %v", err), result.License, source)
	}
	if err := os.WriteFile(s.StorePath, []byte(strings.TrimSpace(raw)), 0o600); err != nil {
		return s.result(StatusInvalid, fmt.Sprintf("Gagal menyimpan lisensi: %v", err), result.License, source)
	}

	result.Message = "Lisensi aktif dan tersimpan"
	return result
}

func (s *Service) Revoke() error {
	if err := os.Remove(s.StorePath); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	return nil
}

func (s *Service) Validate(raw, source string) CheckResult {
	lic, err := Parse(raw)
	if err != nil {
		return s.result(StatusInvalid, err.Error(), nil, source)
	}

	if err := lic.validateRequired(); err != nil {
		return s.result(StatusInvalid, err.Error(), lic, source)
	}

	if len(s.PublicKey) == 0 {
		return s.result(StatusInvalid, "Public key lisensi belum dikonfigurasi di backend", lic, source)
	}

	if !s.verify(lic) {
		return s.result(StatusInvalid, "Signature lisensi tidak valid", lic, source)
	}

	if s.SiteID != "" && lic.SiteID != s.SiteID {
		return s.result(StatusInvalidSite, "Lisensi bukan untuk site ini", lic, source)
	}

	if lic.HardwareID != "" && s.HardwareID != "" && lic.HardwareID != s.HardwareID {
		return s.result(StatusInvalidDevice, "Lisensi bukan untuk hardware ini", lic, source)
	}

	expiresAt, err := time.Parse("2006-01-02", lic.ExpiresAt)
	if err != nil {
		return s.result(StatusInvalid, "Tanggal kadaluarsa lisensi tidak valid", lic, source)
	}
	if time.Now().After(expiresAt.Add(24*time.Hour - time.Nanosecond)) {
		return s.result(StatusExpired, "Lisensi sudah kadaluarsa", lic, source)
	}

	return s.result(StatusActive, "Lisensi aktif", lic, source)
}

func Parse(raw string) (*License, error) {
	clean := strings.TrimSpace(raw)
	if clean == "" {
		return nil, errors.New("File lisensi kosong")
	}

	if strings.HasPrefix(clean, "VEAM2.") {
		payloadB64 := strings.TrimPrefix(clean, "VEAM2.")
		payload, err := base64.RawURLEncoding.DecodeString(payloadB64)
		if err != nil {
			return nil, errors.New("Format VEAM2 tidak valid")
		}
		clean = string(payload)
	}

	var lic License
	if err := json.Unmarshal([]byte(clean), &lic); err != nil {
		return nil, errors.New("File lisensi bukan JSON VEAM2 yang valid")
	}
	return &lic, nil
}

func (s *Service) verify(lic *License) bool {
	signature, err := base64.StdEncoding.DecodeString(lic.Signature)
	if err != nil {
		return false
	}
	return ed25519.Verify(s.PublicKey, []byte(signingMessage(lic)), signature)
}

func signingMessage(lic *License) string {
	modules := append([]string(nil), lic.Modules...)
	sort.Strings(modules)

	parts := []string{
		"VEAM2",
		lic.Version,
		lic.LicenseID,
		lic.SiteID,
		lic.IssuedTo,
		lic.IssuedBy,
		lic.IssuedAt,
		lic.ExpiresAt,
		strings.Join(modules, ","),
		fmt.Sprintf("%d", lic.MaxDevices),
		lic.HardwareID,
	}

	sum := sha256.Sum256([]byte(strings.Join(parts, "\n")))
	return base64.StdEncoding.EncodeToString(sum[:])
}

func (lic *License) validateRequired() error {
	if lic.Version != "2.0" {
		return errors.New("Versi lisensi tidak didukung")
	}
	required := map[string]string{
		"license_id": lic.LicenseID,
		"site_id":    lic.SiteID,
		"issued_to":  lic.IssuedTo,
		"issued_by":  lic.IssuedBy,
		"issued_at":  lic.IssuedAt,
		"expires_at": lic.ExpiresAt,
		"signature":  lic.Signature,
	}
	for field, value := range required {
		if strings.TrimSpace(value) == "" {
			return fmt.Errorf("Field lisensi wajib kosong: %s", field)
		}
	}
	if len(lic.Modules) == 0 {
		return errors.New("Lisensi tidak memiliki modul aktif")
	}
	if lic.MaxDevices < 1 {
		return errors.New("Max devices lisensi tidak valid")
	}
	if _, err := time.Parse("2006-01-02", lic.IssuedAt); err != nil {
		return errors.New("Tanggal terbit lisensi tidak valid")
	}
	if _, err := time.Parse("2006-01-02", lic.ExpiresAt); err != nil {
		return errors.New("Tanggal kadaluarsa lisensi tidak valid")
	}
	return nil
}

func (s *Service) result(status Status, message string, lic *License, source string) CheckResult {
	return CheckResult{
		Status:    status,
		Valid:     status == StatusActive,
		Message:   message,
		License:   lic,
		Source:    source,
		CheckedAt: time.Now().Format(time.RFC3339),
	}
}
