package license

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"testing"
	"time"
)

func signedTestLicense(t *testing.T, privateKey ed25519.PrivateKey, siteID string, expiresAt string) string {
	t.Helper()

	lic := License{
		Version:    "2.0",
		LicenseID:  "VEAM2-TEST",
		SiteID:     siteID,
		IssuedTo:   "Test Site",
		IssuedBy:   "Activa Digital",
		IssuedAt:   time.Now().Format("2006-01-02"),
		ExpiresAt:  expiresAt,
		Modules:    []string{"PWS", "DMC"},
		MaxDevices: 2,
	}
	lic.Signature = base64.StdEncoding.EncodeToString(ed25519.Sign(privateKey, []byte(signingMessage(&lic))))

	payload, err := json.Marshal(lic)
	if err != nil {
		t.Fatal(err)
	}

	return "VEAM2." + base64.RawURLEncoding.EncodeToString(payload)
}

func TestValidateActiveVEAM2License(t *testing.T) {
	publicKey, privateKey, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatal(err)
	}

	svc, err := NewService(t.TempDir()+"/license.veam", base64.StdEncoding.EncodeToString(publicKey), "site-1", "")
	if err != nil {
		t.Fatal(err)
	}

	raw := signedTestLicense(t, privateKey, "site-1", time.Now().AddDate(0, 1, 0).Format("2006-01-02"))
	result := svc.Validate(raw, "test")
	if !result.Valid || result.Status != StatusActive {
		t.Fatalf("expected active license, got status=%s message=%s", result.Status, result.Message)
	}
}

func TestValidateRejectsWrongSite(t *testing.T) {
	publicKey, privateKey, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatal(err)
	}

	svc, err := NewService(t.TempDir()+"/license.veam", base64.StdEncoding.EncodeToString(publicKey), "site-2", "")
	if err != nil {
		t.Fatal(err)
	}

	raw := signedTestLicense(t, privateKey, "site-1", time.Now().AddDate(0, 1, 0).Format("2006-01-02"))
	result := svc.Validate(raw, "test")
	if result.Valid || result.Status != StatusInvalidSite {
		t.Fatalf("expected invalid_site, got status=%s message=%s", result.Status, result.Message)
	}
}

func TestValidateRejectsTamperedSignature(t *testing.T) {
	publicKey, privateKey, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatal(err)
	}

	svc, err := NewService(t.TempDir()+"/license.veam", base64.StdEncoding.EncodeToString(publicKey), "site-1", "")
	if err != nil {
		t.Fatal(err)
	}

	raw := signedTestLicense(t, privateKey, "site-1", time.Now().AddDate(0, 1, 0).Format("2006-01-02"))
	lic, err := Parse(raw)
	if err != nil {
		t.Fatal(err)
	}
	lic.MaxDevices = 9
	payload, err := json.Marshal(lic)
	if err != nil {
		t.Fatal(err)
	}

	result := svc.Validate("VEAM2."+base64.RawURLEncoding.EncodeToString(payload), "test")
	if result.Valid || result.Status != StatusInvalid {
		t.Fatalf("expected invalid signature, got status=%s message=%s", result.Status, result.Message)
	}
}
