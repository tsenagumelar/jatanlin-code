package main

import (
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"wim-service/internal/vision"
)

func main() {
	log.Println("========================================")
	log.Println("  WIM DIMENSION SAMPLE")
	log.Println("========================================")

	imagePaths := os.Args[1:]
	if len(imagePaths) == 0 {
		var err error
		imagePaths, err = findSampleImages(".")
		if err != nil {
			log.Fatal("[DIMENSION_SAMPLE] Failed to find images:", err)
		}
	}
	if len(imagePaths) == 0 {
		log.Fatal("[DIMENSION_SAMPLE] No *_car.(jpg|jpeg|png) images found in repo root")
	}

	modelPath := getEnv("DIMENSION_MODEL_PATH", "")
	threshold := getEnvFloat("DIMENSION_THRESHOLD", 0.5)

	service := vision.NewDimensionService(modelPath, threshold)
	calibration := vision.NewCameraCalibration()
	calibration.LoadFromConfig(
		getEnvFloat("CAMERA_FOCAL_LENGTH", 1000.0),
		getEnvInt("CAMERA_IMAGE_WIDTH", 2432),
		getEnvInt("CAMERA_IMAGE_HEIGHT", 2080),
		getEnvFloat("CAMERA_HEIGHT_METERS", 5.0),
		getEnvFloat("CAMERA_TILT_ANGLE", 25.0),
		getEnvInt("CAMERA_REF_PIXEL_LENGTH", 200),
		getEnvFloat("CAMERA_REF_REAL_LENGTH", 5.0),
		getEnvFloat("CAMERA_REF_DISTANCE", 25.0),
	)
	calibration.ConfigureEmpiricalProfile(
		getEnv("DIMENSION_PROFILE_NAME", "anpr-empirical-profile"),
		getEnvFloat("DIMENSION_LENGTH_SCALE_M_PER_PX", 0.009535),
		getEnvFloat("DIMENSION_WIDTH_SCALE_M_PER_PX", 0.003522),
		getEnvFloat("DIMENSION_HEIGHT_SCALE_M_PER_PX", 0.003603),
		getEnvFloat("DIMENSION_LENGTH_OFFSET_M", 0.0),
		getEnvFloat("DIMENSION_WIDTH_OFFSET_M", 0.0),
		getEnvFloat("DIMENSION_HEIGHT_OFFSET_M", 0.0),
		getEnvFloat("DIMENSION_MIN_CONFIDENCE", 0.45),
		getEnvBool("DIMENSION_ENABLE_POSE_FILTER", true),
	)
	if err := service.SetCalibration(calibration); err != nil {
		log.Fatal("[DIMENSION_SAMPLE] Invalid calibration:", err)
	}

	for _, imagePath := range imagePaths {
		log.Println("")
		log.Printf("[DIMENSION_SAMPLE] Processing: %s", imagePath)
		dims, err := service.ProcessImage(imagePath)
		if err != nil {
			log.Printf("[DIMENSION_SAMPLE] Error: %v", err)
			continue
		}
		if len(dims) == 0 {
			log.Println("[DIMENSION_SAMPLE] No vehicles detected")
			continue
		}
		for i, d := range dims {
			log.Printf("[DIMENSION_SAMPLE] Vehicle %d: L=%.2fm W=%.2fm H=%.2fm (distance=%.2fm, confidence=%.2f)",
				i+1, d.LengthMeters, d.WidthMeters, d.HeightMeters, d.DistanceMeters, d.Confidence)
		}
	}
}

func findSampleImages(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var matches []string
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		lower := strings.ToLower(name)
		if !strings.Contains(lower, "_car") {
			continue
		}
		ext := strings.ToLower(filepath.Ext(name))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			continue
		}
		matches = append(matches, filepath.Join(dir, name))
	}

	return matches, nil
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvFloat(key string, def float64) float64 {
	if v := os.Getenv(key); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			return f
		}
		log.Printf("[DIMENSION_SAMPLE] Invalid float for %s=%q, using default %.2f", key, v, def)
	}
	return def
}

func getEnvInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
		log.Printf("[DIMENSION_SAMPLE] Invalid int for %s=%q, using default %d", key, v, def)
	}
	return def
}

func getEnvBool(key string, def bool) bool {
	if v := os.Getenv(key); v != "" {
		switch strings.ToLower(v) {
		case "1", "true", "yes", "on":
			return true
		case "0", "false", "no", "off":
			return false
		}
		log.Printf("[DIMENSION_SAMPLE] Invalid bool for %s=%q, using default %t", key, v, def)
	}
	return def
}
