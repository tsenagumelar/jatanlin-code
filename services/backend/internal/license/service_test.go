package license

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"os"
	"path/filepath"
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

func TestUSBScanRootsUsesExistingOverridePaths(t *testing.T) {
	first := t.TempDir()
	second := t.TempDir()
	missing := filepath.Join(t.TempDir(), "missing")

	t.Setenv("VEAM_USB_SCAN_PATHS", " "+first+" , "+missing+" , "+second+" ")

	roots := USBScanRoots()
	if len(roots) != 2 {
		t.Fatalf("expected 2 existing roots, got %d: %#v", len(roots), roots)
	}
	if roots[0] != first || roots[1] != second {
		t.Fatalf("unexpected roots: %#v", roots)
	}
}

func TestFindUSBLicenseFileScansOnlyRootFiles(t *testing.T) {
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "license.veam"), []byte(" VEAM2.test "), 0o600); err != nil {
		t.Fatal(err)
	}
	nested := filepath.Join(root, "nested")
	if err := os.Mkdir(nested, 0o700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(nested, "nested.veam"), []byte("ignored"), 0o600); err != nil {
		t.Fatal(err)
	}

	found := FindUSBLicenseFile(root)
	if found == nil {
		t.Fatal("expected root license file")
	}
	if found.Content != "VEAM2.test" {
		t.Fatalf("unexpected content: %q", found.Content)
	}
	if filepath.Base(found.Path) != "license.veam" {
		t.Fatalf("unexpected file path: %s", found.Path)
	}
}
