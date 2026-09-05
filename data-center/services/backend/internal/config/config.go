package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppPort             string
	DatabaseURL         string
	JWTSecret           string
	SiteSyncKey         string
	MinIOEndpoint       string
	MinIOPublicEndpoint string
	MinIOAccessKey      string
	MinIOSecretKey      string
	MinIOBucket         string
	MinIOUseSSL         bool
	CORSOrigins         []string
	ETLENAS             ETLENASConfig
}

type ETLENASConfig struct {
	Enabled       bool
	BaseURL       string
	UserToken     string
	PassToken     string
	ClientSecret  string
	ClientID      string
	Interval      time.Duration
	Timeout       time.Duration
	ViolationCode string
	ViolationName string
	NRP           string
	Satwil        string
}

func Load() Config {
	return Config{
		AppPort:             env("APP_PORT", "28001"),
		DatabaseURL:         env("DATABASE_URL", "postgres://jatanlin_dc:jatanlin_dc_password@127.0.0.1:25432/jatanlin_data_center?sslmode=disable"),
		JWTSecret:           env("JWT_SECRET", "jatanlin-data-center-secret-2026"),
		SiteSyncKey:         env("SITE_SYNC_KEY", "jatanlin-site-sync-key-2026"),
		MinIOEndpoint:       env("MINIO_ENDPOINT", "127.0.0.1:29000"),
		MinIOPublicEndpoint: env("MINIO_PUBLIC_ENDPOINT", "https://minio.jatanlinkorlantas.id"),
		MinIOAccessKey:      env("MINIO_ACCESS_KEY", "jatanlin_dc_minio"),
		MinIOSecretKey:      env("MINIO_SECRET_KEY", "jatanlin_dc_minio_password"),
		MinIOBucket:         env("MINIO_BUCKET", "jatanlin-data-center-attachments"),
		MinIOUseSSL:         env("MINIO_USE_SSL", "false") == "true",
		CORSOrigins:         splitCSV(env("CORS_ORIGINS", "https://jatanlinkorlantas.id,https://www.jatanlinkorlantas.id,http://localhost:3001,http://127.0.0.1:3001")),
		ETLENAS: ETLENASConfig{
			Enabled:       env("ETLENAS_ENABLED", "false") == "true",
			BaseURL:       strings.TrimRight(env("ETLENAS_BASE_URL", "https://api-etle.polri.go.id"), "/"),
			UserToken:     env("ETLENAS_USER_TOKEN", ""),
			PassToken:     env("ETLENAS_PASS_TOKEN", ""),
			ClientSecret:  env("ETLENAS_CLIENT_SECRET", ""),
			ClientID:      env("ETLENAS_CLIENT_ID", "integrasi"),
			Interval:      seconds("ETLENAS_INTERVAL_SEC", 30),
			Timeout:       seconds("ETLENAS_HTTP_TIMEOUT_SEC", 20),
			ViolationCode: env("ETLENAS_VIOLATION_CODE", "TM"),
			ViolationName: env("ETLENAS_VIOLATION_NAME", "Melanggar Tata Cara Muatan"),
			NRP:           env("ETLENAS_NRP", ""),
			Satwil:        env("ETLENAS_SATWIL", "Korlantas"),
		},
	}
}

func seconds(key string, fallback int) time.Duration {
	value, err := strconv.Atoi(env(key, strconv.Itoa(fallback)))
	if err != nil || value <= 0 {
		value = fallback
	}
	return time.Duration(value) * time.Second
}

func env(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}
	return result
}
