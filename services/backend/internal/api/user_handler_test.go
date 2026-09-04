package api

import (
	"strings"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestHashPasswordProducesBcryptHash(t *testing.T) {
	hash, err := hashPassword("admin123")
	if err != nil {
		t.Fatalf("hashPassword returned error: %v", err)
	}
	if hash == "admin123" {
		t.Fatal("password was stored as plain text")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte("admin123")); err != nil {
		t.Fatalf("generated hash cannot be verified: %v", err)
	}
}

func TestAuthenticatedActorID(t *testing.T) {
	tests := []struct {
		name    string
		actorID string
		wantErr string
	}{
		{name: "missing", wantErr: "required"},
		{name: "nil uuid", actorID: "00000000-0000-0000-0000-000000000000", wantErr: "required"},
		{name: "invalid uuid", actorID: "not-a-uuid", wantErr: "invalid"},
		{name: "valid", actorID: "11111111-1111-4111-8111-111111111111"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := validateActorID(test.actorID)
			if test.wantErr == "" {
				if err != nil || got != test.actorID {
					t.Fatalf("got (%q, %v), want (%q, nil)", got, err, test.actorID)
				}
				return
			}
			if err == nil || !strings.Contains(strings.ToLower(err.Error()), test.wantErr) {
				t.Fatalf("got error %v, want containing %q", err, test.wantErr)
			}
		})
	}
}
