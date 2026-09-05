package main

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/google/uuid"
)

func TestDummyCCTVAssetPathUsesSessionVariant(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "cctv-2.mp4"), []byte("sample"), 0o600); err != nil {
		t.Fatal(err)
	}
	t.Setenv("DEMO_SAMPLE_DIR", dir)
	sessionID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	videoPath, ok := dummyCCTVAssetPath(sessionID)
	if !ok || filepath.Base(videoPath) != "cctv-2.mp4" {
		t.Fatalf("path=%q ok=%v", videoPath, ok)
	}
}
