package etlenas

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"jatanlin-data-center-backend/internal/config"
)

type Violation struct {
	DeviceName          string
	LocationName        string
	LocationDescription string
	Latitude            string
	Longitude           string
	Plate               string
	PlateImageURL       string
	VehicleType         string
	VehicleImageURL     string
	CaptureTime         time.Time
}

type Result struct {
	HTTPStatus int
	StatusCode *int
	Body       []byte
	Payload    []byte
}

type Client struct {
	config config.ETLENASConfig
	http   interface {
		Do(*http.Request) (*http.Response, error)
	}
	mu        sync.Mutex
	token     string
	expiresAt time.Time
}

func NewClient(cfg config.ETLENASConfig) *Client {
	return &Client{config: cfg, http: &http.Client{Timeout: cfg.Timeout}}
}

func (c *Client) Validate() error {
	missing := make([]string, 0, 4)
	if c.config.UserToken == "" {
		missing = append(missing, "ETLENAS_USER_TOKEN")
	}
	if c.config.PassToken == "" {
		missing = append(missing, "ETLENAS_PASS_TOKEN")
	}
	if c.config.ClientSecret == "" {
		missing = append(missing, "ETLENAS_CLIENT_SECRET")
	}
	if c.config.Satwil == "" {
		missing = append(missing, "ETLENAS_SATWIL")
	}
	if c.config.ViolationCode == "" {
		missing = append(missing, "ETLENAS_VIOLATION_CODE")
	}
	if c.config.ViolationName == "" {
		missing = append(missing, "ETLENAS_VIOLATION_NAME")
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing configuration: %s", strings.Join(missing, ", "))
	}
	return nil
}

func (c *Client) Send(ctx context.Context, input Violation) (Result, error) {
	payload := map[string]any{
		"deviceName": input.DeviceName, "locationName": input.LocationName,
		"locationDescription": input.LocationDescription, "lat": input.Latitude,
		"lon": input.Longitude, "NRP": c.config.NRP, "satwil": c.config.Satwil,
		"plate": strings.ToUpper(strings.TrimSpace(input.Plate)), "plateColor": "Unknown",
		"plateImageUrl": fallback(input.PlateImageURL, "-"), "vehicleType": fallback(input.VehicleType, "-"),
		"vehicleColor": "-", "vehicleImageUrl": fallback(input.VehicleImageURL, "-"),
		"videoUrl": "not available", "violationCode": c.config.ViolationCode,
		"violationName": c.config.ViolationName, "captureTime": input.CaptureTime.UnixMilli(),
	}
	body, err := json.Marshal(map[string]any{"datas": []any{payload}})
	if err != nil {
		return Result{}, err
	}

	token, err := c.accessToken(ctx, false)
	if err != nil {
		return Result{Payload: body}, err
	}
	result, err := c.post(ctx, token, body)
	if result.HTTPStatus == http.StatusUnauthorized || result.HTTPStatus == http.StatusForbidden {
		token, err = c.accessToken(ctx, true)
		if err != nil {
			return result, err
		}
		return c.post(ctx, token, body)
	}
	return result, err
}

func (c *Client) accessToken(ctx context.Context, force bool) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if !force && c.token != "" && time.Now().Before(c.expiresAt) {
		return c.token, nil
	}
	body, _ := json.Marshal(map[string]string{
		"usertoken": c.config.UserToken, "passtoken": c.config.PassToken,
		"client_secret": c.config.ClientSecret, "client_id": c.config.ClientID,
	})
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, c.config.BaseURL+"/user/login", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	request.Header.Set("Content-Type", "application/json")
	response, err := c.http.Do(request)
	if err != nil {
		return "", fmt.Errorf("ETLENAS login: %w", err)
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		return "", err
	}
	var decoded struct {
		AccessToken string `json:"access_token"`
	}
	if response.StatusCode != http.StatusOK || json.Unmarshal(responseBody, &decoded) != nil || decoded.AccessToken == "" {
		return "", fmt.Errorf("ETLENAS login failed (HTTP %d): %s", response.StatusCode, trimBody(responseBody))
	}
	c.token = decoded.AccessToken
	c.expiresAt = tokenExpiry(decoded.AccessToken, time.Now())
	return c.token, nil
}

func tokenExpiry(token string, now time.Time) time.Time {
	const fallbackTTL = 30 * time.Minute
	const refreshSkew = time.Minute
	parts := strings.Split(token, ".")
	if len(parts) < 2 {
		return now.Add(fallbackTTL - refreshSkew)
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return now.Add(fallbackTTL - refreshSkew)
	}
	var claims struct {
		ExpiresAt int64 `json:"exp"`
	}
	if json.Unmarshal(payload, &claims) != nil || claims.ExpiresAt <= 0 {
		return now.Add(fallbackTTL - refreshSkew)
	}
	expiresAt := time.Unix(claims.ExpiresAt, 0).Add(-refreshSkew)
	if !expiresAt.After(now) {
		return now
	}
	return expiresAt
}

func (c *Client) post(ctx context.Context, token string, payload []byte) (Result, error) {
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, c.config.BaseURL+"/violation/insert", bytes.NewReader(payload))
	if err != nil {
		return Result{Payload: payload}, err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+token)
	response, err := c.http.Do(request)
	if err != nil {
		return Result{Payload: payload}, fmt.Errorf("ETLENAS send: %w", err)
	}
	defer response.Body.Close()
	body, readErr := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	result := Result{HTTPStatus: response.StatusCode, Body: body, Payload: payload}
	var decoded struct {
		Status *int `json:"status"`
	}
	if json.Unmarshal(body, &decoded) == nil {
		result.StatusCode = decoded.Status
	}
	if readErr != nil {
		return result, readErr
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return result, fmt.Errorf("ETLENAS send failed (HTTP %d): %s", response.StatusCode, trimBody(body))
	}
	return result, nil
}

func fallback(value, replacement string) string {
	if strings.TrimSpace(value) == "" {
		return replacement
	}
	return value
}

func trimBody(body []byte) string {
	value := strings.TrimSpace(string(body))
	if len(value) > 500 {
		return value[:500]
	}
	return value
}
