package veam

import (
	"log"
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
	roots := license.USBScanRoots()
	log.Printf("[VEAM] scan-license: checking %d USB root(s): %v", len(roots), roots)

	var scanned []string
	for _, root := range roots {
		scanned = append(scanned, root)
		found := license.FindUSBLicenseFile(root)
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
	roots := license.USBScanRoots()
	log.Printf("[VEAM] activate-usb: checking %d USB root(s): %v", len(roots), roots)

	var scanned []string
	for _, root := range roots {
		scanned = append(scanned, root)
		found := license.FindUSBLicenseFile(root)
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
