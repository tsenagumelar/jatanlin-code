package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadCursorStateKeepsLegacyFormat(t *testing.T) {
	cursorFile := filepath.Join(t.TempDir(), "cursor.json")
	if err := os.WriteFile(cursorFile, []byte(`{"tables":{"transact_vehicle_actual":"2026-09-04T00:00:00Z"}}`), 0o600); err != nil {
		t.Fatal(err)
	}

	agent := syncAgent{cfg: syncConfig{CursorFile: cursorFile}}
	if err := agent.loadCursorState(); err != nil {
		t.Fatal(err)
	}
	if got := agent.cursor("transact_vehicle_actual"); got != "2026-09-04T00:00:00Z" {
		t.Fatalf("legacy cursor changed: %s", got)
	}
	if agent.state.Streams == nil {
		t.Fatal("stream state was not initialized")
	}
}

func TestAttachmentCursorWaitsForEveryObject(t *testing.T) {
	tests := []struct {
		name     string
		batch    bool
		skipped  int
		expected bool
	}{
		{name: "complete batch", batch: true, expected: true},
		{name: "missing object", batch: true, skipped: 1, expected: false},
		{name: "lookback replay", batch: false, expected: false},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := canAdvanceAttachmentCursor(test.batch, test.skipped); got != test.expected {
				t.Fatalf("got %t, want %t", got, test.expected)
			}
		})
	}
}
