package main

import (
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type licenseFile struct {
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

func main() {
	siteID := flag.String("site-id", "e1123daf-a4db-4ee1-88da-ba9bff382f45", "licensed site UUID")
	licenseID := flag.String("license-id", "VEAM2-REVAMP-LOCAL", "license id")
	issuedTo := flag.String("issued-to", "Mampang Revamp Local", "license owner")
	issuedBy := flag.String("issued-by", "Activa Digital", "license issuer")
	issuedAt := flag.String("issued-at", "2026-07-14", "issued date YYYY-MM-DD")
	expiresAt := flag.String("expires-at", "2027-12-31", "expiry date YYYY-MM-DD")
	modulesCSV := flag.String("modules", "PWS,TIIC,DMC", "comma separated modules")
	maxDevices := flag.Int("max-devices", 5, "maximum devices")
	hardwareID := flag.String("hardware-id", "", "optional hardware binding")
	out := flag.String("out", "./data/license.veam", "output license path")
	flag.Parse()

	publicKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		log.Fatal(err)
	}

	lic := licenseFile{
		Version:    "2.0",
		LicenseID:  strings.TrimSpace(*licenseID),
		SiteID:     strings.TrimSpace(*siteID),
		IssuedTo:   strings.TrimSpace(*issuedTo),
		IssuedBy:   strings.TrimSpace(*issuedBy),
		IssuedAt:   strings.TrimSpace(*issuedAt),
		ExpiresAt:  strings.TrimSpace(*expiresAt),
		Modules:    splitCSV(*modulesCSV),
		MaxDevices: *maxDevices,
		HardwareID: strings.TrimSpace(*hardwareID),
	}
	lic.Signature = base64.StdEncoding.EncodeToString(ed25519.Sign(privateKey, []byte(signingMessage(&lic))))

	payload, err := json.Marshal(lic)
	if err != nil {
		log.Fatal(err)
	}
	raw := "VEAM2." + base64.RawURLEncoding.EncodeToString(payload)

	if err := os.MkdirAll(filepath.Dir(*out), 0o755); err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile(*out, []byte(raw+"\n"), 0o600); err != nil {
		log.Fatal(err)
	}

	fmt.Printf("license_path=%s\n", *out)
	fmt.Printf("public_key_b64=%s\n", base64.StdEncoding.EncodeToString(publicKey))
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}

func signingMessage(lic *licenseFile) string {
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
