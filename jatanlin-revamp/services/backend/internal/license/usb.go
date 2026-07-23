package license

import (
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

type USBLicenseFile struct {
	Path    string
	Content string
}

func USBScanRoots() []string {
	if override := strings.TrimSpace(os.Getenv("VEAM_USB_SCAN_PATHS")); override != "" {
		var roots []string
		for _, path := range strings.Split(override, ",") {
			if clean := strings.TrimSpace(path); clean != "" {
				roots = append(roots, clean)
			}
		}
		return roots
	}

	switch runtime.GOOS {
	case "darwin":
		entries, err := os.ReadDir("/Volumes")
		if err != nil {
			return nil
		}
		var paths []string
		for _, entry := range entries {
			if entry.IsDir() && entry.Name() != "Macintosh HD" {
				paths = append(paths, filepath.Join("/Volumes", entry.Name()))
			}
		}
		return paths
	default:
		var paths []string
		for _, base := range []string{"/media", "/run/media"} {
			users, _ := os.ReadDir(base)
			for _, user := range users {
				if !user.IsDir() {
					continue
				}
				volumes, _ := os.ReadDir(filepath.Join(base, user.Name()))
				for _, volume := range volumes {
					if volume.IsDir() {
						paths = append(paths, filepath.Join(base, user.Name(), volume.Name()))
					}
				}
			}
		}

		mntEntries, _ := os.ReadDir("/mnt")
		for _, entry := range mntEntries {
			if entry.IsDir() {
				paths = append(paths, filepath.Join("/mnt", entry.Name()))
			}
		}
		return paths
	}
}

func FindUSBLicenseFile(root string) *USBLicenseFile {
	var result *USBLicenseFile

	_ = filepath.WalkDir(root, func(path string, entry os.DirEntry, err error) error {
		if err != nil {
			return nil
		}

		rel, _ := filepath.Rel(root, path)
		parts := strings.Split(rel, string(os.PathSeparator))
		if entry.IsDir() && len(parts) > 1 {
			return filepath.SkipDir
		}

		if !entry.IsDir() && strings.HasSuffix(strings.ToLower(entry.Name()), ".veam") {
			content, readErr := os.ReadFile(path)
			if readErr != nil {
				log.Printf("[VEAM] Cannot read %s: %v", path, readErr)
				return nil
			}
			result = &USBLicenseFile{
				Path:    path,
				Content: strings.TrimSpace(string(content)),
			}
			return filepath.SkipAll
		}
		return nil
	})

	return result
}

func ScanUSBLicenseFile() (*USBLicenseFile, []string) {
	roots := USBScanRoots()
	var scanned []string
	for _, root := range roots {
		scanned = append(scanned, root)
		found := FindUSBLicenseFile(root)
		if found != nil {
			return found, scanned
		}
	}
	return nil, scanned
}
