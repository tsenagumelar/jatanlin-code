package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

type Config struct {
	// Site Identification (Multi-Site Support)
	SiteCode     string // Site code from master_site.code (e.g., "SITE001", "JKT-TOLL-01")
	SiteUUID     string // UUID from master_site.id (looked up from database)
	SiteName     string // Human-readable site name (e.g., "Jakarta Toll Gate 1")
	SiteLocation string // Location description (e.g., "Jakarta", "Surabaya")
	SiteRegion   string // Region/Area (e.g., "JABODETABEK", "JATIM")

	// Database
	DatabaseURL string
	DB          *sql.DB

	// Central Database (for data synchronization to HQ)
	CentralDatabaseURL string // Central HQ database URL (optional)
	CentralDB          *sql.DB
	SyncEnabled        bool // Enable sync to central database

	// API Config
	APIPort     string
	JWTSecret   string
	AuthEnabled bool // Toggle auth header enforcement (temporary for FE readiness)

	// VEAM License
	VEAMLicensePath  string
	VEAMPublicKeyB64 string
	VEAMHardwareID   string

	// ANPR FTP Config
	ANPRFTPHost      string
	ANPRFTPUser      string
	ANPRFTPPass      string
	ANPRFTPDir       string
	ANPRFTPInterval  time.Duration
	ANPRDummyEnabled bool

	// AXLE FTP Config
	AxleFTPHost      string
	AxleFTPUser      string
	AxleFTPPass      string
	AxleFTPDir       string
	AxleFTPInterval  time.Duration
	AxleDummyEnabled bool

	// MinIO Config for ANPR
	ANPRMinIOEndpoint string
	ANPRMinIOAccess   string
	ANPRMinIOSecret   string
	ANPRMinIOBucket   string
	ANPRMinIOUseSSL   bool

	// MinIO Config for AXLE
	AxleMinIOEndpoint string
	AxleMinIOAccess   string
	AxleMinIOSecret   string
	AxleMinIOBucket   string
	AxleMinIOUseSSL   bool

	// MinIO Config for ATTACHMENT
	AttachmentMinIOEndpoint string
	AttachmentMinIOAccess   string
	AttachmentMinIOSecret   string
	AttachmentMinIOBucket   string
	AttachmentMinIOUseSSL   bool

	// Vehicle Dimension Detection Config
	DimensionEnabled              bool    // Enable dimension detection
	DimensionDummyEnabled         bool    // Enable dummy dimension output
	DimensionModelPath            string  // Path to detection model (if using ML model)
	DimensionThreshold            float64 // Detection confidence threshold
	DimensionProfileName          string
	DimensionLengthScale          float64
	DimensionWidthScale           float64
	DimensionHeightScale          float64
	DimensionLengthOffset         float64
	DimensionWidthOffset          float64
	DimensionHeightOffset         float64
	DimensionMinConfidence        float64
	DimensionEnablePoseFilter     bool
	DimensionToleranceDistancePct float64
	DimensionToleranceTiltPct     float64
	DimensionToleranceHeightPct   float64

	// Camera Calibration Parameters
	CameraFocalLength    float64 // Focal length in pixels
	CameraImageWidth     int     // Image width in pixels
	CameraImageHeight    int     // Image height in pixels
	CameraHeight         float64 // Camera height from ground in meters
	CameraTiltAngle      float64 // Camera tilt angle in degrees
	CameraRefPixelLength int     // Reference object length in pixels
	CameraRefRealLength  float64 // Reference object length in meters
	CameraRefDistance    float64 // Distance to reference object in meters

	// WIM Session Configuration
	SessionWindowSeconds int // Session time window in seconds for data collection

	// NATS (Queue)
	NATSURL string

	// Weighing Trigger (external service)
	WeighingTriggerURL        string
	WeighingTriggerDirection  string
	WeighingTriggerTimeoutSec int
	WeighingTriggerSave       bool
	WeighingTriggerDummy      bool

	// CCTV Trigger (external service)
	CCTVTriggerEnabled bool
	CCTVTriggerURL     string
	CCTVTriggerSeconds int
	CCTVTriggerDummy   bool
}

func Load() (*Config, error) {
	// Load .env file if exists
	if err := godotenv.Load(); err != nil {
		log.Println("[CONFIG] .env file not found, using system environment")
	} else {
		log.Println("[CONFIG] .env file loaded successfully")
	}

	cfg := &Config{
		// Site Identification
		SiteCode:     getEnv("SITE_CODE", "SITE001"),
		SiteName:     getEnv("SITE_NAME", "Default Site"),
		SiteLocation: getEnv("SITE_LOCATION", "Unknown"),
		SiteRegion:   getEnv("SITE_REGION", "DEFAULT"),

		// Database
		DatabaseURL: getEnv("DATABASE_URL", ""),

		// Central Database
		CentralDatabaseURL: getEnv("CENTRAL_DATABASE_URL", ""),
		SyncEnabled:        getEnvBool("SYNC_ENABLED", false),

		// API Config
		APIPort:     getEnv("API_PORT", "4000"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-this-in-production"),
		AuthEnabled: getEnvBool("AUTH_ENABLED", false),

		// VEAM License
		VEAMLicensePath:  getEnv("VEAM_LICENSE_PATH", "./data/license.veam"),
		VEAMPublicKeyB64: getEnv("VEAM_PUBLIC_KEY_B64", ""),
		VEAMHardwareID:   getEnv("VEAM_HARDWARE_ID", ""),

		// ANPR FTP
		ANPRFTPHost:      getEnv("ANPR_FTP_HOST", "localhost:10021"),
		ANPRFTPUser:      getEnv("ANPR_FTP_USER", "ftpuser"),
		ANPRFTPPass:      getEnv("ANPR_FTP_PASS", ""),
		ANPRFTPDir:       getEnv("ANPR_FTP_DIR", "/"),
		ANPRFTPInterval:  time.Duration(getEnvInt("ANPR_FTP_INTERVAL_SEC", 5)) * time.Second,
		ANPRDummyEnabled: getEnvBool("ANPR_DUMMY_ENABLED", false),

		// AXLE FTP
		AxleFTPHost:      getEnv("AXLE_FTP_HOST", "localhost:10021"),
		AxleFTPUser:      getEnv("AXLE_FTP_USER", "ftpuser"),
		AxleFTPPass:      getEnv("AXLE_FTP_PASS", ""),
		AxleFTPDir:       getEnv("AXLE_FTP_DIR", "/"),
		AxleFTPInterval:  time.Duration(getEnvInt("AXLE_FTP_INTERVAL_SEC", 5)) * time.Second,
		AxleDummyEnabled: getEnvBool("AXLE_DUMMY_ENABLED", false),

		// ANPR MinIO
		ANPRMinIOEndpoint: getEnv("ANPR_MINIO_ENDPOINT", "s3minio.activa.id"),
		ANPRMinIOAccess:   getEnv("ANPR_MINIO_ACCESS_KEY", "admin"),
		ANPRMinIOSecret:   getEnv("ANPR_MINIO_SECRET_KEY", ""),
		ANPRMinIOBucket:   getEnv("ANPR_MINIO_BUCKET", "anpr"),
		ANPRMinIOUseSSL:   getEnvBool("ANPR_MINIO_USE_SSL", true),

		// AXLE MinIO
		AxleMinIOEndpoint: getEnv("AXLE_MINIO_ENDPOINT", "s3minio.activa.id"),
		AxleMinIOAccess:   getEnv("AXLE_MINIO_ACCESS_KEY", "admin"),
		AxleMinIOSecret:   getEnv("AXLE_MINIO_SECRET_KEY", ""),
		AxleMinIOBucket:   getEnv("AXLE_MINIO_BUCKET", "axle"),
		AxleMinIOUseSSL:   getEnvBool("AXLE_MINIO_USE_SSL", true),

		// ATTACHMENT MinIO
		AttachmentMinIOEndpoint: getEnv("ATTACHMENT_MINIO_ENDPOINT", "s3minio.activa.id"),
		AttachmentMinIOAccess:   getEnv("ATTACHMENT_MINIO_ACCESS_KEY", "admin"),
		AttachmentMinIOSecret:   getEnv("ATTACHMENT_MINIO_SECRET_KEY", ""),
		AttachmentMinIOBucket:   getEnv("ATTACHMENT_MINIO_BUCKET", "attachment"),
		AttachmentMinIOUseSSL:   getEnvBool("ATTACHMENT_MINIO_USE_SSL", true),

		// Vehicle Dimension Detection
		DimensionEnabled:              getEnvBool("DIMENSION_ENABLED", false),
		DimensionDummyEnabled:         getEnvBool("DIMENSION_DUMMY_ENABLED", false),
		DimensionModelPath:            getEnv("DIMENSION_MODEL_PATH", ""),
		DimensionThreshold:            getEnvFloat("DIMENSION_THRESHOLD", 0.5),
		DimensionProfileName:          getEnv("DIMENSION_PROFILE_NAME", "anpr-empirical-profile"),
		DimensionLengthScale:          getEnvFloat("DIMENSION_LENGTH_SCALE_M_PER_PX", 0.009535),
		DimensionWidthScale:           getEnvFloat("DIMENSION_WIDTH_SCALE_M_PER_PX", 0.003522),
		DimensionHeightScale:          getEnvFloat("DIMENSION_HEIGHT_SCALE_M_PER_PX", 0.003603),
		DimensionLengthOffset:         getEnvFloat("DIMENSION_LENGTH_OFFSET_M", 0.0),
		DimensionWidthOffset:          getEnvFloat("DIMENSION_WIDTH_OFFSET_M", 0.0),
		DimensionHeightOffset:         getEnvFloat("DIMENSION_HEIGHT_OFFSET_M", 0.0),
		DimensionMinConfidence:        getEnvFloat("DIMENSION_MIN_CONFIDENCE", 0.45),
		DimensionEnablePoseFilter:     getEnvBool("DIMENSION_ENABLE_POSE_FILTER", true),
		DimensionToleranceDistancePct: getEnvFloat("DIMENSION_INSTALL_TOLERANCE_DISTANCE_PCT", 5.0),
		DimensionToleranceTiltPct:     getEnvFloat("DIMENSION_INSTALL_TOLERANCE_TILT_PCT", 2.0),
		DimensionToleranceHeightPct:   getEnvFloat("DIMENSION_INSTALL_TOLERANCE_HEIGHT_PCT", 10.0),

		// Camera Calibration (default values - should be calibrated)
		CameraFocalLength:    getEnvFloat("CAMERA_FOCAL_LENGTH", 1000.0),
		CameraImageWidth:     getEnvInt("CAMERA_IMAGE_WIDTH", 2432),
		CameraImageHeight:    getEnvInt("CAMERA_IMAGE_HEIGHT", 2080),
		CameraHeight:         getEnvFloat("CAMERA_HEIGHT_METERS", 5.0),
		CameraTiltAngle:      getEnvFloat("CAMERA_TILT_ANGLE", 25.0),
		CameraRefPixelLength: getEnvInt("CAMERA_REF_PIXEL_LENGTH", 200),
		CameraRefRealLength:  getEnvFloat("CAMERA_REF_REAL_LENGTH", 5.0),
		CameraRefDistance:    getEnvFloat("CAMERA_REF_DISTANCE", 25.0),

		// WIM Session Configuration
		SessionWindowSeconds: getEnvInt("SESSION_WINDOW_SECONDS", 60),

		// NATS
		NATSURL: getEnv("NATS_URL", "nats://localhost:14222"),

		// Weighing Trigger
		WeighingTriggerURL:        getEnv("WEIGHING_TRIGGER_URL", "http://localhost:5000/ws/wim/anpr-capture"),
		WeighingTriggerDirection:  getEnv("WEIGHING_TRIGGER_DIRECTION", "RIGHT"),
		WeighingTriggerTimeoutSec: getEnvInt("WEIGHING_TRIGGER_TIMEOUT_SECONDS", 25),
		WeighingTriggerSave:       getEnvBool("WEIGHING_TRIGGER_SAVE", true),
		WeighingTriggerDummy:      getEnvBool("WEIGHING_TRIGGER_DUMMY", false),

		// CCTV Trigger
		CCTVTriggerEnabled: getEnvBool("CCTV_TRIGGER_ENABLED", true),
		CCTVTriggerURL:     getEnv("CCTV_TRIGGER_URL", "http://localhost:8090/record"),
		CCTVTriggerSeconds: getEnvInt("CCTV_TRIGGER_SECONDS", 20),
		CCTVTriggerDummy:   getEnvBool("CCTV_TRIGGER_DUMMY", false),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	log.Println("[CONFIG] Connecting to database...")

	// Initialize database connection
	db, err := sql.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	log.Println("[CONFIG] Testing database connection...")

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	cfg.DB = db
	log.Printf("[CONFIG] Database connection established for Site: %s (%s)", cfg.SiteCode, cfg.SiteName)

	if err := cfg.loadRuntimeOverrides(); err != nil {
		log.Printf("[CONFIG] Runtime config override skipped: %v", err)
	}

	// Resolve site UUID:
	// 1) Prefer explicit SITE_ID from env (same UUID style used by web NEXT_PUBLIC_SITE_ID)
	// 2) Fallback to lookup by SITE_CODE from master_site
	explicitSiteID := cfg.SiteUUID
	if explicitSiteID == "" {
		explicitSiteID = getEnv("SITE_ID", "")
	}
	if explicitSiteID == "" {
		explicitSiteID = getEnv("NEXT_PUBLIC_SITE_ID", "")
	}

	if explicitSiteID != "" {
		if _, err := uuid.Parse(explicitSiteID); err != nil {
			return nil, fmt.Errorf("invalid SITE_ID/NEXT_PUBLIC_SITE_ID '%s': %w", explicitSiteID, err)
		}
		cfg.SiteUUID = explicitSiteID
		log.Printf("[CONFIG] Site UUID loaded from env SITE_ID: %s", cfg.SiteUUID)
	} else {
		if err := cfg.loadSiteUUID(); err != nil {
			return nil, fmt.Errorf("failed to resolve site UUID for SITE_CODE='%s': %w", cfg.SiteCode, err)
		}
		log.Printf("[CONFIG] Site UUID loaded from SITE_CODE lookup: %s", cfg.SiteUUID)
	}

	// Initialize central database connection if sync is enabled
	if cfg.SyncEnabled && cfg.CentralDatabaseURL != "" {
		log.Println("[CONFIG] Connecting to central database...")
		centralDB, err := sql.Open("pgx", cfg.CentralDatabaseURL)
		if err != nil {
			log.Printf("[CONFIG] WARNING: Failed to connect to central database: %v", err)
		} else {
			centralDB.SetMaxOpenConns(5)
			centralDB.SetMaxIdleConns(2)
			centralDB.SetConnMaxLifetime(30 * time.Minute)

			if err := centralDB.Ping(); err != nil {
				log.Printf("[CONFIG] WARNING: Failed to ping central database: %v", err)
			} else {
				cfg.CentralDB = centralDB
				log.Println("[CONFIG] Central database connection established")
			}
		}
	}

	return cfg, nil
}

// loadSiteUUID looks up the site UUID from master_site table based on site code
func (cfg *Config) loadSiteUUID() error {
	var siteUUID string
	query := `SELECT id FROM public.master_site WHERE code = $1 AND is_deleted = false LIMIT 1`

	err := cfg.DB.QueryRow(query, cfg.SiteCode).Scan(&siteUUID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("site code '%s' not found in master_site table", cfg.SiteCode)
		}
		return fmt.Errorf("failed to query master_site: %w", err)
	}

	cfg.SiteUUID = siteUUID
	return nil
}

// loadRuntimeOverrides applies values maintained by v3 Configuration & Device.
// DATABASE_URL cannot be overridden here because it is required before this query.
func (cfg *Config) loadRuntimeOverrides() error {
	rows, err := cfg.DB.Query(`
		SELECT config_key, COALESCE(config_value, '')
		FROM public.system_runtime_config
		WHERE is_active = true AND is_deleted = false
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	values := map[string]string{}
	for rows.Next() {
		var key, value string
		if err := rows.Scan(&key, &value); err != nil {
			return err
		}
		values[key] = strings.TrimSpace(value)
	}
	if err := rows.Err(); err != nil {
		return err
	}
	if len(values) == 0 {
		return nil
	}

	cfg.SiteUUID = runtimeString(values, "SITE_ID", cfg.SiteUUID)
	cfg.SiteCode = runtimeString(values, "SITE_CODE", cfg.SiteCode)
	cfg.SiteName = runtimeString(values, "SITE_NAME", cfg.SiteName)
	cfg.SiteLocation = runtimeString(values, "SITE_LOCATION", cfg.SiteLocation)
	cfg.SiteRegion = runtimeString(values, "SITE_REGION", cfg.SiteRegion)

	cfg.APIPort = runtimeString(values, "API_PORT", cfg.APIPort)
	cfg.JWTSecret = runtimeString(values, "JWT_SECRET", cfg.JWTSecret)
	cfg.AuthEnabled = runtimeBool(values, "AUTH_ENABLED", cfg.AuthEnabled)
	cfg.SyncEnabled = runtimeBool(values, "SYNC_ENABLED", cfg.SyncEnabled)
	cfg.NATSURL = runtimeString(values, "NATS_URL", cfg.NATSURL)

	cfg.ANPRFTPHost = runtimeString(values, "ANPR_FTP_HOST", cfg.ANPRFTPHost)
	cfg.ANPRFTPUser = runtimeString(values, "ANPR_FTP_USER", cfg.ANPRFTPUser)
	cfg.ANPRFTPPass = runtimeString(values, "ANPR_FTP_PASS", cfg.ANPRFTPPass)
	cfg.ANPRFTPDir = runtimeString(values, "ANPR_FTP_DIR", cfg.ANPRFTPDir)
	cfg.ANPRFTPInterval = time.Duration(runtimeInt(values, "ANPR_FTP_INTERVAL_SEC", int(cfg.ANPRFTPInterval/time.Second))) * time.Second
	cfg.ANPRDummyEnabled = runtimeBool(values, "ANPR_DUMMY_ENABLED", cfg.ANPRDummyEnabled)

	cfg.AxleFTPHost = runtimeString(values, "AXLE_FTP_HOST", cfg.AxleFTPHost)
	cfg.AxleFTPUser = runtimeString(values, "AXLE_FTP_USER", cfg.AxleFTPUser)
	cfg.AxleFTPPass = runtimeString(values, "AXLE_FTP_PASS", cfg.AxleFTPPass)
	cfg.AxleFTPDir = runtimeString(values, "AXLE_FTP_DIR", cfg.AxleFTPDir)
	cfg.AxleFTPInterval = time.Duration(runtimeInt(values, "AXLE_FTP_INTERVAL_SEC", int(cfg.AxleFTPInterval/time.Second))) * time.Second
	cfg.AxleDummyEnabled = runtimeBool(values, "AXLE_DUMMY_ENABLED", cfg.AxleDummyEnabled)

	cfg.ANPRMinIOEndpoint = runtimeString(values, "ANPR_MINIO_ENDPOINT", cfg.ANPRMinIOEndpoint)
	cfg.ANPRMinIOAccess = runtimeString(values, "ANPR_MINIO_ACCESS_KEY", cfg.ANPRMinIOAccess)
	cfg.ANPRMinIOSecret = runtimeString(values, "ANPR_MINIO_SECRET_KEY", cfg.ANPRMinIOSecret)
	cfg.ANPRMinIOBucket = runtimeString(values, "ANPR_MINIO_BUCKET", cfg.ANPRMinIOBucket)
	cfg.ANPRMinIOUseSSL = runtimeBool(values, "ANPR_MINIO_USE_SSL", cfg.ANPRMinIOUseSSL)
	cfg.AxleMinIOEndpoint = runtimeString(values, "AXLE_MINIO_ENDPOINT", cfg.AxleMinIOEndpoint)
	cfg.AxleMinIOAccess = runtimeString(values, "AXLE_MINIO_ACCESS_KEY", cfg.AxleMinIOAccess)
	cfg.AxleMinIOSecret = runtimeString(values, "AXLE_MINIO_SECRET_KEY", cfg.AxleMinIOSecret)
	cfg.AxleMinIOBucket = runtimeString(values, "AXLE_MINIO_BUCKET", cfg.AxleMinIOBucket)
	cfg.AxleMinIOUseSSL = runtimeBool(values, "AXLE_MINIO_USE_SSL", cfg.AxleMinIOUseSSL)
	cfg.AttachmentMinIOEndpoint = runtimeString(values, "ATTACHMENT_MINIO_ENDPOINT", cfg.AttachmentMinIOEndpoint)
	cfg.AttachmentMinIOAccess = runtimeString(values, "ATTACHMENT_MINIO_ACCESS_KEY", cfg.AttachmentMinIOAccess)
	cfg.AttachmentMinIOSecret = runtimeString(values, "ATTACHMENT_MINIO_SECRET_KEY", cfg.AttachmentMinIOSecret)
	cfg.AttachmentMinIOBucket = runtimeString(values, "ATTACHMENT_MINIO_BUCKET", cfg.AttachmentMinIOBucket)
	cfg.AttachmentMinIOUseSSL = runtimeBool(values, "ATTACHMENT_MINIO_USE_SSL", cfg.AttachmentMinIOUseSSL)

	cfg.CCTVTriggerEnabled = runtimeBool(values, "CCTV_TRIGGER_ENABLED", cfg.CCTVTriggerEnabled)
	cfg.CCTVTriggerURL = runtimeString(values, "CCTV_TRIGGER_URL", cfg.CCTVTriggerURL)
	cfg.CCTVTriggerSeconds = runtimeInt(values, "CCTV_TRIGGER_SECONDS", cfg.CCTVTriggerSeconds)
	cfg.CCTVTriggerDummy = runtimeBool(values, "CCTV_TRIGGER_DUMMY", cfg.CCTVTriggerDummy)

	cfg.DimensionEnabled = runtimeBool(values, "DIMENSION_ENABLED", cfg.DimensionEnabled)
	cfg.DimensionDummyEnabled = runtimeBool(values, "DIMENSION_DUMMY_ENABLED", cfg.DimensionDummyEnabled)
	cfg.DimensionThreshold = runtimeFloat(values, "DIMENSION_THRESHOLD", cfg.DimensionThreshold)
	cfg.DimensionModelPath = runtimeString(values, "DIMENSION_MODEL_PATH", cfg.DimensionModelPath)
	cfg.DimensionProfileName = runtimeString(values, "DIMENSION_PROFILE_NAME", cfg.DimensionProfileName)
	cfg.DimensionLengthScale = runtimeFloat(values, "DIMENSION_LENGTH_SCALE_M_PER_PX", cfg.DimensionLengthScale)
	cfg.DimensionWidthScale = runtimeFloat(values, "DIMENSION_WIDTH_SCALE_M_PER_PX", cfg.DimensionWidthScale)
	cfg.DimensionHeightScale = runtimeFloat(values, "DIMENSION_HEIGHT_SCALE_M_PER_PX", cfg.DimensionHeightScale)
	cfg.DimensionLengthOffset = runtimeFloat(values, "DIMENSION_LENGTH_OFFSET_M", cfg.DimensionLengthOffset)
	cfg.DimensionWidthOffset = runtimeFloat(values, "DIMENSION_WIDTH_OFFSET_M", cfg.DimensionWidthOffset)
	cfg.DimensionHeightOffset = runtimeFloat(values, "DIMENSION_HEIGHT_OFFSET_M", cfg.DimensionHeightOffset)
	cfg.DimensionMinConfidence = runtimeFloat(values, "DIMENSION_MIN_CONFIDENCE", cfg.DimensionMinConfidence)
	cfg.DimensionEnablePoseFilter = runtimeBool(values, "DIMENSION_ENABLE_POSE_FILTER", cfg.DimensionEnablePoseFilter)
	cfg.DimensionToleranceDistancePct = runtimeFloat(values, "DIMENSION_INSTALL_TOLERANCE_DISTANCE_PCT", cfg.DimensionToleranceDistancePct)
	cfg.DimensionToleranceTiltPct = runtimeFloat(values, "DIMENSION_INSTALL_TOLERANCE_TILT_PCT", cfg.DimensionToleranceTiltPct)
	cfg.DimensionToleranceHeightPct = runtimeFloat(values, "DIMENSION_INSTALL_TOLERANCE_HEIGHT_PCT", cfg.DimensionToleranceHeightPct)

	cfg.CameraImageWidth = runtimeInt(values, "CAMERA_IMAGE_WIDTH", cfg.CameraImageWidth)
	cfg.CameraImageHeight = runtimeInt(values, "CAMERA_IMAGE_HEIGHT", cfg.CameraImageHeight)
	cfg.CameraFocalLength = runtimeFloat(values, "CAMERA_FOCAL_LENGTH", cfg.CameraFocalLength)
	cfg.CameraHeight = runtimeFloat(values, "CAMERA_HEIGHT_METERS", cfg.CameraHeight)
	cfg.CameraTiltAngle = runtimeFloat(values, "CAMERA_TILT_ANGLE", cfg.CameraTiltAngle)
	cfg.CameraRefPixelLength = runtimeInt(values, "CAMERA_REF_PIXEL_LENGTH", cfg.CameraRefPixelLength)
	cfg.CameraRefRealLength = runtimeFloat(values, "CAMERA_REF_REAL_LENGTH", cfg.CameraRefRealLength)
	cfg.CameraRefDistance = runtimeFloat(values, "CAMERA_REF_DISTANCE", cfg.CameraRefDistance)
	cfg.SessionWindowSeconds = runtimeInt(values, "SESSION_WINDOW_SECONDS", cfg.SessionWindowSeconds)

	cfg.WeighingTriggerURL = runtimeString(values, "WEIGHING_TRIGGER_URL", cfg.WeighingTriggerURL)
	cfg.WeighingTriggerDirection = runtimeString(values, "WEIGHING_TRIGGER_DIRECTION", cfg.WeighingTriggerDirection)
	cfg.WeighingTriggerTimeoutSec = runtimeInt(values, "WEIGHING_TRIGGER_TIMEOUT_SECONDS", cfg.WeighingTriggerTimeoutSec)
	cfg.WeighingTriggerSave = runtimeBool(values, "WEIGHING_TRIGGER_SAVE", cfg.WeighingTriggerSave)
	cfg.WeighingTriggerDummy = runtimeBool(values, "WEIGHING_TRIGGER_DUMMY", cfg.WeighingTriggerDummy)

	cfg.VEAMLicensePath = runtimeString(values, "VEAM_LICENSE_PATH", cfg.VEAMLicensePath)
	cfg.VEAMPublicKeyB64 = runtimeString(values, "VEAM_PUBLIC_KEY_B64", cfg.VEAMPublicKeyB64)
	cfg.VEAMHardwareID = runtimeString(values, "VEAM_HARDWARE_ID", cfg.VEAMHardwareID)

	log.Printf("[CONFIG] Applied %d runtime config value(s) from system_runtime_config", len(values))
	return nil
}

func runtimeString(values map[string]string, key, def string) string {
	if v, ok := values[key]; ok && v != "" {
		return v
	}
	return def
}

func runtimeInt(values map[string]string, key string, def int) int {
	if v, ok := values[key]; ok && v != "" {
		if parsed, err := strconv.Atoi(v); err == nil {
			return parsed
		}
	}
	return def
}

func runtimeBool(values map[string]string, key string, def bool) bool {
	if v, ok := values[key]; ok && v != "" {
		switch strings.ToLower(v) {
		case "1", "true", "yes", "on":
			return true
		case "0", "false", "no", "off":
			return false
		}
	}
	return def
}

func runtimeFloat(values map[string]string, key string, def float64) float64 {
	if v, ok := values[key]; ok && v != "" {
		if parsed, err := strconv.ParseFloat(v, 64); err == nil {
			return parsed
		}
	}
	return def
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		i, err := strconv.Atoi(v)
		if err == nil {
			return i
		}
	}
	return def
}

func getEnvBool(key string, def bool) bool {
	if v := os.Getenv(key); v != "" {
		switch v {
		case "1", "true", "TRUE":
			return true
		case "0", "false", "FALSE":
			return false
		}
	}
	return def
}

func getEnvFloat(key string, def float64) float64 {
	if v := os.Getenv(key); v != "" {
		f, err := strconv.ParseFloat(v, 64)
		if err == nil {
			return f
		}
	}
	return def
}
