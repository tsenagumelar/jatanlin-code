package orchestrator

import "testing"

func TestValidVerificationResult(t *testing.T) {
	valid := []string{"Normal", "Over Dimension", "Over Loading", "Over Dimension & Over Loading"}
	for _, value := range valid {
		value := value
		if !validVerificationResult(&value) {
			t.Fatalf("expected %q to be valid", value)
		}
	}

	invalid := []string{"", "Pending", "Terverifikasi", "normal"}
	for _, value := range invalid {
		value := value
		if validVerificationResult(&value) {
			t.Fatalf("expected %q to be invalid", value)
		}
	}
	if validVerificationResult(nil) {
		t.Fatal("expected nil result to be invalid")
	}
}
