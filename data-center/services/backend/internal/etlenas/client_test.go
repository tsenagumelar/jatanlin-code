package etlenas

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"testing"
	"time"

	"jatanlin-data-center-backend/internal/config"
)

func TestSendBuildsETLENASContract(t *testing.T) {
	var loginCalls, sendCalls int
	handler := roundTripFunc(func(r *http.Request) (*http.Response, error) {
		switch r.URL.Path {
		case "/user/login":
			loginCalls++
			return response(http.StatusOK, `{"access_token":"token"}`), nil
		case "/violation/insert":
			sendCalls++
			if got := r.Header.Get("Authorization"); got != "Bearer token" {
				t.Fatalf("Authorization = %q", got)
			}
			var body struct {
				Datas []map[string]any `json:"datas"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatal(err)
			}
			if len(body.Datas) != 1 {
				t.Fatalf("datas length = %d", len(body.Datas))
			}
			if got := body.Datas[0]["plate"]; got != "B1234ABC" {
				t.Fatalf("plate = %v", got)
			}
			if got := body.Datas[0]["captureTime"]; got != float64(1727748214000) {
				t.Fatalf("captureTime = %v", got)
			}
			return response(http.StatusCreated, `{"status":1112}`), nil
		default:
			return response(http.StatusNotFound, "not found"), nil
		}
	})

	client := NewClient(config.ETLENASConfig{
		BaseURL: "https://etlenas.test", UserToken: "user", PassToken: "pass", ClientSecret: "secret",
		ClientID: "integrasi", Timeout: time.Second, ViolationCode: "TM",
		ViolationName: "Melanggar Tata Cara Muatan", Satwil: "Korlantas",
	})
	client.http = handler
	capturedAt := time.UnixMilli(1727748214000)
	result, err := client.Send(context.Background(), Violation{
		DeviceName: "Jatanlin1", Plate: "b1234abc", CaptureTime: capturedAt,
	})
	if err != nil {
		t.Fatal(err)
	}
	if result.HTTPStatus != http.StatusCreated || result.StatusCode == nil || *result.StatusCode != 1112 {
		t.Fatalf("unexpected result: %+v", result)
	}
	if loginCalls != 1 || sendCalls != 1 {
		t.Fatalf("calls login=%d send=%d", loginCalls, sendCalls)
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) Do(request *http.Request) (*http.Response, error) { return f(request) }

func response(status int, body string) *http.Response {
	return &http.Response{StatusCode: status, Body: io.NopCloser(bytes.NewBufferString(body)), Header: make(http.Header)}
}

func TestValidateRequiresCredentials(t *testing.T) {
	err := NewClient(config.ETLENASConfig{}).Validate()
	if err == nil {
		t.Fatal("expected missing configuration error")
	}
}

func TestTokenExpiryUsesJWTExpWithSkew(t *testing.T) {
	now := time.Unix(1_700_000_000, 0)
	token := "header.eyJleHAiOjE3MDAwMDA3MjB9.signature"
	want := time.Unix(1_700_000_660, 0)
	if got := tokenExpiry(token, now); !got.Equal(want) {
		t.Fatalf("tokenExpiry() = %s, want %s", got, want)
	}
}

func TestSendRefreshesRejectedTokenOnce(t *testing.T) {
	loginCalls, sendCalls := 0, 0
	client := NewClient(config.ETLENASConfig{
		BaseURL: "https://etlenas.test", UserToken: "user", PassToken: "pass",
		ClientSecret: "secret", ClientID: "integrasi", Timeout: time.Second,
		ViolationCode: "TM", ViolationName: "Violation", Satwil: "Korlantas",
	})
	client.http = roundTripFunc(func(r *http.Request) (*http.Response, error) {
		if r.URL.Path == "/user/login" {
			loginCalls++
			return response(http.StatusOK, `{"access_token":"token"}`), nil
		}
		sendCalls++
		if sendCalls == 1 {
			return response(http.StatusUnauthorized, `{"error":"expired"}`), nil
		}
		return response(http.StatusOK, `{"status":200}`), nil
	})
	_, err := client.Send(context.Background(), Violation{Plate: "B1", CaptureTime: time.Now()})
	if err != nil {
		t.Fatal(err)
	}
	if loginCalls != 2 || sendCalls != 2 {
		t.Fatalf("calls login=%d send=%d", loginCalls, sendCalls)
	}
}
