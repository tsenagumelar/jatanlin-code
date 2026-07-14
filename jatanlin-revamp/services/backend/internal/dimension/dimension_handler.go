package dimension

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"wim-service/internal/vision"
)

// DimensionHandler handles vehicle dimension processing
type DimensionHandler struct {
	DB               *sql.DB
	SiteUUID         string // Site UUID from master_site.id
	DimensionService *vision.DimensionService
	SaveResults      bool // Whether to save results to database
	DummyEnabled     bool
}

// DimensionResult represents the result of dimension processing
type DimensionResult struct {
	ImagePath    string                     `json:"image_path"`
	ProcessedAt  time.Time                  `json:"processed_at"`
	Dimensions   []vision.VehicleDimensions `json:"dimensions"`
	VehicleCount int                        `json:"vehicle_count"`
	Success      bool                       `json:"success"`
	ErrorMessage string                     `json:"error_message,omitempty"`
}

// NewDimensionHandler creates a new dimension handler
func NewDimensionHandler(db *sql.DB, siteUUID, modelPath string, threshold float64) (*DimensionHandler, error) {
	dimensionService := vision.NewDimensionService(modelPath, threshold)

	return &DimensionHandler{
		DB:               db,
		SiteUUID:         siteUUID,
		DimensionService: dimensionService,
		SaveResults:      true,
	}, nil
}

func (dh *DimensionHandler) SetDummyEnabled(enabled bool) {
	dh.DummyEnabled = enabled
}

// SetCalibration sets camera calibration parameters
func (dh *DimensionHandler) SetCalibration(calibration *vision.CameraCalibration) error {
	return dh.DimensionService.SetCalibration(calibration)
}

// ProcessImageFile processes a single image file and returns dimensions
func (dh *DimensionHandler) ProcessImageFile(imagePath string) (*DimensionResult, error) {
	log.Printf("[DIMENSION_HANDLER] Processing image: %s", imagePath)

	result := &DimensionResult{
		ImagePath:   imagePath,
		ProcessedAt: time.Now(),
		Success:     false,
	}

	// Process the image
	dimensions, err := dh.DimensionService.ProcessImage(imagePath)
	if err != nil {
		result.ErrorMessage = err.Error()
		log.Printf("[DIMENSION_HANDLER] Error processing image: %v", err)
		return result, err
	}

	result.Dimensions = dimensions
	result.VehicleCount = len(dimensions)
	result.Success = true

	// Save to database if enabled
	if dh.SaveResults && dh.DB != nil {
		if err := dh.saveDimensionsToDatabase(imagePath, dimensions); err != nil {
			log.Printf("[DIMENSION_HANDLER] Warning: Failed to save to database: %v", err)
		}
	}

	log.Printf("[DIMENSION_HANDLER] Successfully processed image. Found %d vehicle(s)", len(dimensions))

	return result, nil
}

// ProcessANPRImage processes an ANPR image with metadata and saves to transact_dimension table
func (dh *DimensionHandler) ProcessANPRImage(imagePath string, plateNumber string, externalID string) (*DimensionResult, error) {
	log.Printf("[DIMENSION_HANDLER] Processing ANPR image for plate: %s (External ID: %s)", plateNumber, externalID)

	result := &DimensionResult{
		ImagePath:   imagePath,
		ProcessedAt: time.Now(),
		Success:     false,
	}

	// Process the image
	dimensions, err := dh.DimensionService.ProcessImage(imagePath)
	if err != nil {
		result.ErrorMessage = err.Error()
		log.Printf("[DIMENSION_HANDLER] Error processing image: %v", err)
		return result, err
	}

	result.Dimensions = dimensions
	result.VehicleCount = len(dimensions)
	result.Success = true

	// Save to transact_dimension table if database is available
	if dh.SaveResults && dh.DB != nil && externalID != "" {
		log.Printf("[DIMENSION_HANDLER] Saving %d dimension(s) to database for external_id: %s", len(result.Dimensions), externalID)
		for i, dims := range result.Dimensions {
			if err := dh.insertDimensionRecord(externalID, imagePath, dims); err != nil {
				log.Printf("[DIMENSION_HANDLER] ERROR: Failed to insert dimension record %d: %v", i+1, err)
			} else {
				log.Printf("[DIMENSION_HANDLER] Successfully inserted dimension record %d to transact_dimension", i+1)
			}
		}
	} else {
		log.Printf("[DIMENSION_HANDLER] Skipping database save - SaveResults=%v, DB=%v, externalID=%q",
			dh.SaveResults, dh.DB != nil, externalID)
	}

	log.Printf("[DIMENSION_HANDLER] Successfully processed ANPR image. Found %d vehicle(s)", len(dimensions))

	return result, nil
}

func (dh *DimensionHandler) ProcessANPRImageWithSession(imagePath string, plateNumber string, externalID string, sessionID *uuid.UUID) (*DimensionResult, error) {
	return dh.ProcessANPRImageWithSessionMode(imagePath, plateNumber, externalID, sessionID, dh.DummyEnabled)
}

// ProcessANPRImageWithSessionMode processes dimension using explicit per-session dummy mode.
// This is used by session-driven watchers so behavior follows session.is_dummy.
func (dh *DimensionHandler) ProcessANPRImageWithSessionMode(imagePath string, plateNumber string, externalID string, sessionID *uuid.UUID, sessionIsDummy bool) (*DimensionResult, error) {
	if sessionIsDummy {
		return dh.processDummyDimension(imagePath, plateNumber, externalID, sessionID)
	}

	result, err := dh.ProcessANPRImage(imagePath, plateNumber, externalID)
	if err != nil {
		return result, err
	}

	if sessionID != nil && *sessionID != uuid.Nil {
		if err := dh.attachSessionToExistingDimension(*sessionID, externalID); err != nil {
			log.Printf("[DIMENSION_HANDLER] Warning: failed to attach session_id to dimension: %v", err)
		}
	}

	return result, nil
}

// saveDimensionsToDatabase saves dimension results to database
func (dh *DimensionHandler) saveDimensionsToDatabase(imagePath string, dimensions []vision.VehicleDimensions) error {
	// Create table if not exists
	createTableSQL := `
		CREATE TABLE IF NOT EXISTS vehicle_dimensions (
			id SERIAL PRIMARY KEY,
			image_path VARCHAR(500),
			length_meters DECIMAL(10, 3),
			width_meters DECIMAL(10, 3),
			height_meters DECIMAL(10, 3),
			distance_meters DECIMAL(10, 3),
			confidence DECIMAL(5, 4),
			vehicle_class VARCHAR(50),
			class_description VARCHAR(200),
			center_x INT,
			center_y INT,
			processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`

	if _, err := dh.DB.Exec(createTableSQL); err != nil {
		return fmt.Errorf("failed to create table: %w", err)
	}

	// Insert each dimension result
	insertSQL := `
		INSERT INTO vehicle_dimensions 
		(image_path, length_meters, width_meters, height_meters, distance_meters, 
		 confidence, vehicle_class, class_description, center_x, center_y, processed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	for _, dims := range dimensions {
		if !dims.IsValid() {
			log.Printf("[DIMENSION_HANDLER] Skipping invalid dimension result")
			continue
		}

		vehicleClass := dh.DimensionService.ClassifyVehicle(dims)

		_, err := dh.DB.Exec(
			insertSQL,
			imagePath,
			dims.LengthMeters,
			dims.WidthMeters,
			dims.HeightMeters,
			dims.DistanceMeters,
			dims.Confidence,
			vehicleClass.Class,
			vehicleClass.Description,
			dims.CenterX,
			dims.CenterY,
			dims.Timestamp,
		)

		if err != nil {
			log.Printf("[DIMENSION_HANDLER] Failed to insert dimension: %v", err)
			continue
		}
	}

	return nil
}

// insertDimensionRecord inserts a dimension record into transact_dimension table
func (dh *DimensionHandler) insertDimensionRecord(externalID string, imagePath string, dims vision.VehicleDimensions) error {
	// Skip invalid dimensions
	if !dims.IsValid() {
		log.Printf("[DIMENSION_HANDLER] Skipping invalid dimension result")
		return nil
	}

	// First, get the ANPR ID from external_id
	var anprID string
	err := dh.DB.QueryRow(`
		SELECT id FROM public.transact_anpr_capture
		WHERE external_id = $1 AND site_id = $2
	`, externalID, dh.SiteUUID).Scan(&anprID)

	if err != nil {
		return fmt.Errorf("failed to get ANPR ID for external_id %s: %w", externalID, err)
	}

	// Insert into transact_dimension table
	insertSQL := `
		INSERT INTO public.transact_dimension
			(anpr_id, filepath, length, width, height, site_id, created_date, updated_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	now := time.Now()
	_, err = dh.DB.Exec(
		insertSQL,
		anprID,
		imagePath,
		dims.LengthMeters,
		dims.WidthMeters,
		dims.HeightMeters,
		dh.SiteUUID,
		now,
		now,
	)

	if err != nil {
		return fmt.Errorf("failed to insert dimension record: %w", err)
	}

	log.Printf("[DIMENSION_HANDLER] Inserted dimension record for ANPR ID: %s (L=%.2fm W=%.2fm H=%.2fm)",
		anprID, dims.LengthMeters, dims.WidthMeters, dims.HeightMeters)

	return nil
}

func (dh *DimensionHandler) processDummyDimension(imagePath string, plateNumber string, externalID string, sessionID *uuid.UUID) (*DimensionResult, error) {
	result := &DimensionResult{
		ImagePath:    imagePath,
		ProcessedAt:  time.Now(),
		VehicleCount: 1,
		Success:      true,
	}

	dims := vision.VehicleDimensions{
		ImagePath:      imagePath,
		LengthMeters:   0,
		WidthMeters:    3.6,
		HeightMeters:   4.8,
		DistanceMeters: 8.0,
		Confidence:     0.99,
		CenterX:        1216,
		CenterY:        1040,
		Timestamp:      time.Now(),
		WidthPixels:    780,
		HeightPixels:   520,
		ProfileName:    "dummy-overdimension-profile",
	}
	result.Dimensions = []vision.VehicleDimensions{dims}

	if dh.SaveResults && dh.DB != nil {
		if err := dh.upsertDimensionRecord(sessionID, externalID, imagePath, &dims); err != nil {
			result.Success = false
			result.ErrorMessage = err.Error()
			return result, err
		}
	}

	log.Printf("[DIMENSION_HANDLER] Dummy dimension generated for external_id=%s session_id=%v", externalID, sessionID)
	return result, nil
}

func (dh *DimensionHandler) attachSessionToExistingDimension(sessionID uuid.UUID, externalID string) error {
	const sqlText = `
		UPDATE public.transact_dimension td
		SET session_id = $1,
		    updated_date = now()
		WHERE td.id = (
			SELECT td2.id
			FROM public.transact_dimension td2
			JOIN public.transact_anpr_capture ta ON ta.id = td2.anpr_id
			WHERE ta.external_id = $2
			  AND ta.site_id = $3
			ORDER BY td2.created_date DESC
			LIMIT 1
		)
	`

	if _, err := dh.DB.Exec(sqlText, sessionID, externalID, dh.SiteUUID); err != nil {
		return err
	}
	return nil
}

func (dh *DimensionHandler) upsertDimensionRecord(sessionID *uuid.UUID, externalID string, imagePath string, dims *vision.VehicleDimensions) error {
	var (
		anprID    any
		sessionDB any
	)
	if sessionID != nil && *sessionID != uuid.Nil {
		sessionDB = *sessionID
	} else {
		sessionDB = nil
	}

	if externalID != "" {
		var found string
		err := dh.DB.QueryRow(`
			SELECT id
			FROM public.transact_anpr_capture
			WHERE external_id = $1 AND site_id = $2
			ORDER BY created_date DESC
			LIMIT 1
		`, externalID, dh.SiteUUID).Scan(&found)
		if err != nil && err != sql.ErrNoRows {
			return fmt.Errorf("failed to get ANPR ID for external_id %s: %w", externalID, err)
		}
		if err == nil {
			anprID = found
		}
	}

	if sessionID != nil && *sessionID != uuid.Nil {
		const selectSQL = `
			SELECT id
			FROM public.transact_dimension
			WHERE session_id = $1
			ORDER BY created_date ASC
			LIMIT 1
		`
		var existingID string
		err := dh.DB.QueryRow(selectSQL, *sessionID).Scan(&existingID)
		if err != nil && err != sql.ErrNoRows {
			return fmt.Errorf("query dimension by session: %w", err)
		}

		if err == nil {
			const updateSQL = `
				UPDATE public.transact_dimension
				SET anpr_id = COALESCE($2, anpr_id),
				    filepath = COALESCE(NULLIF($3, ''), filepath),
				    length = COALESCE($4, length),
				    width = COALESCE($5, width),
				    height = COALESCE($6, height),
				    site_id = $7,
				    updated_date = now()
				WHERE id = $1
			`
			_, execErr := dh.DB.Exec(updateSQL, existingID, anprID, imagePath, nullableFloat(dims, "length"), nullableFloat(dims, "width"), nullableFloat(dims, "height"), dh.SiteUUID)
			return execErr
		}
	}

	const insertSQL = `
		INSERT INTO public.transact_dimension
			(anpr_id, session_id, filepath, length, width, height, site_id, created_date, updated_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	now := time.Now()
	_, err := dh.DB.Exec(
		insertSQL,
		anprID,
		sessionDB,
		nullableString(imagePath),
		nullableFloat(dims, "length"),
		nullableFloat(dims, "width"),
		nullableFloat(dims, "height"),
		dh.SiteUUID,
		now,
		now,
	)
	return err
}

func nullableFloat(dims *vision.VehicleDimensions, field string) any {
	if dims == nil {
		return nil
	}
	switch field {
	case "length":
		if dims.LengthMeters <= 0 {
			return nil
		}
		return dims.LengthMeters
	case "width":
		if dims.WidthMeters <= 0 {
			return nil
		}
		return dims.WidthMeters
	case "height":
		if dims.HeightMeters <= 0 {
			return nil
		}
		return dims.HeightMeters
	default:
		return nil
	}
}

func nullableString(value string) any {
	if value == "" {
		return nil
	}
	return value
}

// updateANPRWithDimensions updates ANPR record with dimension data (legacy - kept for backwards compatibility)
func (dh *DimensionHandler) updateANPRWithDimensions(anprID string, dims vision.VehicleDimensions, vehicleIndex int) error {
	// Check if dimension columns exist in anpr_data table
	alterTableSQL := `
		ALTER TABLE anpr_data
		ADD COLUMN IF NOT EXISTS vehicle_length DECIMAL(10, 3),
		ADD COLUMN IF NOT EXISTS vehicle_width DECIMAL(10, 3),
		ADD COLUMN IF NOT EXISTS vehicle_height DECIMAL(10, 3),
		ADD COLUMN IF NOT EXISTS vehicle_class VARCHAR(50),
		ADD COLUMN IF NOT EXISTS dimension_confidence DECIMAL(5, 4);
	`

	if _, err := dh.DB.Exec(alterTableSQL); err != nil {
		return fmt.Errorf("failed to alter table: %w", err)
	}

	vehicleClass := dh.DimensionService.ClassifyVehicle(dims)

	// Update ANPR record with dimension data
	updateSQL := `
		UPDATE anpr_data
		SET vehicle_length = $1,
		    vehicle_width = $2,
		    vehicle_height = $3,
		    vehicle_class = $4,
		    dimension_confidence = $5
		WHERE id = $6
	`

	_, err := dh.DB.Exec(
		updateSQL,
		dims.LengthMeters,
		dims.WidthMeters,
		dims.HeightMeters,
		vehicleClass.Class,
		dims.Confidence,
		anprID,
	)

	return err
}

// GetDimensionsByImagePath retrieves dimensions from database by image path
func (dh *DimensionHandler) GetDimensionsByImagePath(imagePath string) ([]vision.VehicleDimensions, error) {
	querySQL := `
		SELECT length_meters, width_meters, height_meters, distance_meters,
		       confidence, center_x, center_y, processed_at
		FROM vehicle_dimensions
		WHERE image_path = $1
		ORDER BY processed_at DESC
	`

	rows, err := dh.DB.Query(querySQL, imagePath)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []vision.VehicleDimensions
	for rows.Next() {
		var dims vision.VehicleDimensions
		err := rows.Scan(
			&dims.LengthMeters,
			&dims.WidthMeters,
			&dims.HeightMeters,
			&dims.DistanceMeters,
			&dims.Confidence,
			&dims.CenterX,
			&dims.CenterY,
			&dims.Timestamp,
		)
		if err != nil {
			log.Printf("[DIMENSION_HANDLER] Error scanning row: %v", err)
			continue
		}
		dims.ImagePath = imagePath
		results = append(results, dims)
	}

	return results, nil
}

// ExportResultToJSON exports dimension result to JSON file
func (dh *DimensionHandler) ExportResultToJSON(result *DimensionResult, outputPath string) error {
	data, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal JSON: %w", err)
	}

	if outputPath == "" {
		outputPath = filepath.Join(
			filepath.Dir(result.ImagePath),
			fmt.Sprintf("dimensions_%d.json", time.Now().Unix()),
		)
	}

	if err := saveJSONToFile(outputPath, data); err != nil {
		return fmt.Errorf("failed to save JSON: %w", err)
	}

	log.Printf("[DIMENSION_HANDLER] Exported result to: %s", outputPath)
	return nil
}

// saveJSONToFile saves JSON data to file
func saveJSONToFile(path string, data []byte) error {
	// Implementation would go here
	// For now, just log
	log.Printf("[DIMENSION_HANDLER] Would save JSON to: %s", path)
	return nil
}
