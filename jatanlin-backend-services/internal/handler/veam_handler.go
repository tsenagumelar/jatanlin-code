package handler

import (
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"wim-service/internal/license"

	"github.com/gofiber/fiber/v2"
)

// VeamHandler handles VEAM license operations.
type VeamHandler struct {
	LicenseService *license.Service
}

// NewVeamHandler creates a new VeamHandler.
func NewVeamHandler(licenseService *license.Service) *VeamHandler {
	return &VeamHandler{LicenseService: licenseService}
}

// veamFoundFile holds the result of a USB scan.
type veamFoundFile struct {
	Path    string
	Content string
}

// usbScanRoots returns all root directories to scan for USB drives.
func usbScanRoots() []string {
	switch runtime.GOOS {
	case "darwin":
		// macOS: /Volumes/<name> — semua volume kecuali Macintosh HD
		entries, err := os.ReadDir("/Volumes")
		if err != nil {
			return nil
		}
		var paths []string
		for _, e := range entries {
			if e.IsDir() && e.Name() != "Macintosh HD" {
				paths = append(paths, filepath.Join("/Volumes", e.Name()))
			}
		}
		return paths

	default:
		// Linux: /media/<user>/*, /run/media/<user>/*, /mnt/*
		var paths []string

		for _, base := range []string{"/media", "/run/media"} {
			users, _ := os.ReadDir(base)
			for _, user := range users {
				if !user.IsDir() {
					continue
				}
				vols, _ := os.ReadDir(filepath.Join(base, user.Name()))
				for _, vol := range vols {
					if vol.IsDir() {
						paths = append(paths, filepath.Join(base, user.Name(), vol.Name()))
					}
				}
			}
		}

		// /mnt/*
		mntEntries, _ := os.ReadDir("/mnt")
		for _, e := range mntEntries {
			if e.IsDir() {
				paths = append(paths, filepath.Join("/mnt", e.Name()))
			}
		}

		return paths
	}
}

// findVeamFile walks root (max 1 level deep) looking for the first *.veam file.
func findVeamFile(root string) *veamFoundFile {
	var result *veamFoundFile

	_ = filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil // skip unreadable entries
		}

		// Limit depth to root + 1 level — don't recurse deeply into USB
		rel, _ := filepath.Rel(root, path)
		parts := strings.Split(rel, string(os.PathSeparator))
		if d.IsDir() && len(parts) > 1 {
			return filepath.SkipDir
		}

		if !d.IsDir() && strings.HasSuffix(strings.ToLower(d.Name()), ".veam") {
			content, readErr := os.ReadFile(path)
			if readErr != nil {
				log.Printf("[VEAM] Cannot read %s: %v", path, readErr)
				return nil
			}
			result = &veamFoundFile{
				Path:    path,
				Content: strings.TrimSpace(string(content)),
			}
			return filepath.SkipAll // stop — first match wins
		}
		return nil
	})

	return result
}

// ScanLicense scans all mounted USB drives for a .veam license file.
//
// GET /veam/scan-license
//
// Response 200 (found):
//
//	{ "found": true, "path": "/Volumes/USB/license.veam", "content": "<aes-hex>" }
//
// Response 200 (not found):
//
//	{ "found": false, "scanned": ["/Volumes/USB1"], "message": "..." }
func (h *VeamHandler) ScanLicense(c *fiber.Ctx) error {
	roots := usbScanRoots()
	log.Printf("[VEAM] scan-license: checking %d USB root(s): %v", len(roots), roots)

	var scanned []string
	for _, root := range roots {
		scanned = append(scanned, root)
		found := findVeamFile(root)
		if found != nil {
			log.Printf("[VEAM] Found license: %s", found.Path)
			return c.JSON(fiber.Map{
				"found":   true,
				"path":    found.Path,
				"content": found.Content,
			})
		}
	}

	log.Printf("[VEAM] No .veam file found. Scanned: %v", scanned)
	return c.JSON(fiber.Map{
		"found":   false,
		"scanned": scanned,
		"message": "Tidak ada file .veam ditemukan di USB drive yang terpasang",
	})
}

// Status returns the current stored license status.
//
// GET /veam/status
func (h *VeamHandler) Status(c *fiber.Ctx) error {
	return c.JSON(h.LicenseService.Status())
}

type activateLicenseRequest struct {
	Content string `json:"content"`
	Source  string `json:"source"`
}

// Activate validates and stores a license supplied by upload/manual input.
//
// POST /veam/activate
//
//	{ "content": "VEAM2....", "source": "upload" }
func (h *VeamHandler) Activate(c *fiber.Ctx) error {
	var req activateLicenseRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Payload aktivasi tidak valid")
	}
	if strings.TrimSpace(req.Content) == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Content lisensi wajib diisi")
	}
	if req.Source == "" {
		req.Source = "manual"
	}

	result := h.LicenseService.Activate(req.Content, req.Source)
	if !result.Valid {
		return c.Status(fiber.StatusBadRequest).JSON(result)
	}
	return c.JSON(result)
}

// ActivateFromUSB scans USB roots and stores the first valid license.
//
// POST /veam/activate-usb
func (h *VeamHandler) ActivateFromUSB(c *fiber.Ctx) error {
	roots := usbScanRoots()
	log.Printf("[VEAM] activate-usb: checking %d USB root(s): %v", len(roots), roots)

	var scanned []string
	for _, root := range roots {
		scanned = append(scanned, root)
		found := findVeamFile(root)
		if found == nil {
			continue
		}

		result := h.LicenseService.Activate(found.Content, found.Path)
		if result.Valid {
			return c.JSON(result)
		}
		return c.Status(fiber.StatusBadRequest).JSON(result)
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
		"status":  license.StatusMissing,
		"valid":   false,
		"scanned": scanned,
		"message": "Tidak ada file .veam ditemukan di USB drive yang terpasang",
	})
}

// Revoke removes the stored active license.
//
// DELETE /veam/license
func (h *VeamHandler) Revoke(c *fiber.Ctx) error {
	if err := h.LicenseService.Revoke(); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"status":  license.StatusMissing,
		"valid":   false,
		"message": "Lisensi telah dihapus",
	})
}
