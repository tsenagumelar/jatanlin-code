package handler

import (
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// VeamHandler handles VEAM license operations.
type VeamHandler struct{}

// NewVeamHandler creates a new VeamHandler.
func NewVeamHandler() *VeamHandler {
	return &VeamHandler{}
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
