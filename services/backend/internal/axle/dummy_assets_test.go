package axle

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/google/uuid"
)

func TestDummyAxleAssetPathUsesSessionVariant(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "axle-1.xml.jpg"), []byte("sample"), 0o600); err != nil {
		t.Fatal(err)
	}
	t.Setenv("DEMO_SAMPLE_DIR", dir)
	sessionID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	imagePath, ok := dummyAxleAssetPath(sessionID)
	if !ok || filepath.Base(imagePath) != "axle-1.xml.jpg" {
		t.Fatalf("path=%q ok=%v", imagePath, ok)
	}
}
