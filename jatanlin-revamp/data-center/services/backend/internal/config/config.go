package config

import (
	"os"
	"strings"
)

type Config struct {
	AppPort     string
	DatabaseURL string
	JWTSecret   string
	CORSOrigins []string
}

func Load() Config {
	return Config{
		AppPort:     env("APP_PORT", "28001"),
		DatabaseURL: env("DATABASE_URL", "postgres://jatanlin_dc:jatanlin_dc_password@127.0.0.1:25432/jatanlin_data_center?sslmode=disable"),
		JWTSecret:   env("JWT_SECRET", "jatanlin-data-center-secret-2026"),
		CORSOrigins: splitCSV(env("CORS_ORIGINS", "http://localhost:3001")),
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
