package anpr

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/google/uuid"
)

func TestDummyANPRAssetPathsKeepsFullAndPlatePair(t *testing.T) {
	dir := t.TempDir()
	for _, name := range []string{"anpr-2.xml.jpg", "anpr-2.xml.plate.jpg"} {
		if err := os.WriteFile(filepath.Join(dir, name), []byte("sample"), 0o600); err != nil {
			t.Fatal(err)
		}
	}
	t.Setenv("DEMO_SAMPLE_DIR", dir)
	sessionID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	full, plate, ok := dummyANPRAssetPaths(sessionID)
	if !ok || filepath.Base(full) != "anpr-2.xml.jpg" || filepath.Base(plate) != "anpr-2.xml.plate.jpg" {
		t.Fatalf("paths full=%q plate=%q ok=%v", full, plate, ok)
	}
}
