package config

import (
	"os"
	"strings"
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
}

func Load() Config {
	return Config{
		AppPort:             env("APP_PORT", "28001"),
		DatabaseURL:         env("DATABASE_URL", "postgres://jatanlin_dc:jatanlin_dc_password@127.0.0.1:25432/jatanlin_data_center?sslmode=disable"),
		JWTSecret:           env("JWT_SECRET", "jatanlin-data-center-secret-2026"),
		SiteSyncKey:         env("SITE_SYNC_KEY", "jatanlin-site-sync-key-2026"),
		MinIOEndpoint:       env("MINIO_ENDPOINT", "127.0.0.1:29000"),
		MinIOPublicEndpoint: env("MINIO_PUBLIC_ENDPOINT", "localhost:29000"),
		MinIOAccessKey:      env("MINIO_ACCESS_KEY", "jatanlin_dc_minio"),
		MinIOSecretKey:      env("MINIO_SECRET_KEY", "jatanlin_dc_minio_password"),
		MinIOBucket:         env("MINIO_BUCKET", "jatanlin-data-center-attachments"),
		MinIOUseSSL:         env("MINIO_USE_SSL", "false") == "true",
		CORSOrigins:         splitCSV(env("CORS_ORIGINS", "http://localhost:3001")),
	}
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
