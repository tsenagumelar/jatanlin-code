package anpr

import (
	"context"
	"database/sql"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"
	"wim-service/internal/dimension"
	"wim-service/internal/ingest"
	"wim-service/internal/session"
	"wim-service/internal/source"

	"github.com/google/uuid"
	"github.com/jlaffaye/ftp"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type ANPRMetadata struct {
	Plate      string
	FrameTime  string
	Location   string
	CameraID   string
	Confidence string
	ID         string
}

type dummyANPRSample struct {
	MinioFullObject sql.NullString
}

// Sesuaikan dengan struktur XML dari kamera
type xmlResult struct {
	Location struct {
		Value string `xml:"value,attr"`
	} `xml:"location"`

	CameraID struct {
		Value string `xml:"value,attr"`
	} `xml:"cameraid"`

	ID struct {
		Value string `xml:"value,attr"`
	} `xml:"ID"`

	Capture struct {
		FrameTime struct {
			Value string `xml:"value,attr"`
		} `xml:"frametime"`
	} `xml:"capture"`

	ANPR struct {
		Text struct {
			Value string `xml:"value,attr"`
		} `xml:"text"`
		Confidence struct {
			Value string `xml:"value,attr"`
		} `xml:"confidence"`
	} `xml:"anpr"`
}

type FileProcessor struct {
	DB               *sql.DB
	SiteUUID         string // Site UUID from master_site.id
	RemoteDir        string
	Minio            *minio.Client
	Bucket           string
	DimensionHandler *dimension.DimensionHandler // Optional: for vehicle dimension detection
	SessionService   *session.SessionService     // Session management
	InsertQueue      *ANPRInsertQueue
}

// SetDimensionHandler sets the dimension handler for processing vehicle dimensions
func (p *FileProcessor) SetDimensionHandler(handler *dimension.DimensionHandler) {
	p.DimensionHandler = handler
}

// SetSessionService sets the session service for session management
func (p *FileProcessor) SetSessionService(service *session.SessionService) {
	p.SessionService = service
}

// SetInsertQueue initializes the ANPR insert queue backed by NATS JetStream.
func (p *FileProcessor) SetInsertQueue(natsURL string) error {
	q, err := NewANPRInsertQueue(natsURL, p.DB, p.SiteUUID)
	if err != nil {
		return err
	}
	p.InsertQueue = q
	return nil
}

func (p *FileProcessor) enqueueANPRInsert(meta *ANPRMetadata, sessionID *uuid.UUID, dateFolder, xmlObj, fullObj, plateObj string) error {
	if p.InsertQueue == nil {
		return fmt.Errorf("insert queue not initialized")
	}
	return p.InsertQueue.Enqueue(meta, p.Bucket, sessionID, dateFolder, xmlObj, fullObj, plateObj)
}

func NewFileProcessor(db *sql.DB, siteUUID, remoteDir, endpoint, accessKey, secretKey, bucket string, useSSL bool) (*FileProcessor, error) {
	mc, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, err
	}

	return &FileProcessor{
		DB:        db,
		SiteUUID:  siteUUID,
		RemoteDir: remoteDir,
		Minio:     mc,
		Bucket:    bucket,
	}, nil
}

// HandleNewFile dipanggil setiap ada file di FTP.
// 1) Validasi syarat listen: hanya proses jika ada session IN_PROGRESS (kalau tidak, skip).
// 2) Jika memenuhi, lanjut ke batch processing untuk window session.
// Kita hanya proses XML; JPG akan dicari berdasarkan nama XML-nya.
// IMPORTANT: Sekarang menggunakan session-based processing
func (p *FileProcessor) HandleNewFile(ctx context.Context, c *ftp.ServerConn, name string) bool {
	// hanya proses XML
	if !strings.HasSuffix(strings.ToLower(name), ".xml") {
		return true
	}

	log.Printf("[ANPR] File detected: %s", name)

	// Check if session service is configured
	if p.SessionService == nil {
		return p.processFileWithoutSession(ctx, c, name)
	}

	// Check for active session
	session, err := p.SessionService.GetActiveSession()
	if err != nil {
		log.Printf("[ANPR] Active session check failed: %v", err)
		return false
	}

	if session == nil {
		log.Println("[ANPR] No active IN_PROGRESS session found")
		return true // Skip file but don't error
	}
	mode, err := p.SessionService.GetSourceMode(ctx, session.ID, "ANPR")
	if err != nil {
		log.Printf("[ANPR] Source mode unavailable for session %s: %v", session.Code, err)
		return false
	}
	if mode != source.ModeReal {
		log.Printf("[ANPR] Source mode is %s for session %s, skipping FTP ingest", mode, session.Code)
		return true
	}
	log.Printf("[ANPR] Active session found: %s", session.Code)

	// Process batch of files while session is still active.
	return p.processBatchInSession(ctx, c, session)
}

// ProcessDummySession inserts one deterministic dummy ANPR row per active session.
// It is intended for development/testing when FTP source is disabled.
func (p *FileProcessor) ProcessDummySession(ctx context.Context) error {
	if p.SessionService == nil {
		return fmt.Errorf("session service not configured")
	}
	if p.InsertQueue == nil {
		return fmt.Errorf("insert queue not initialized")
	}

	session, err := p.SessionService.GetActiveSession()
	if err != nil {
		return fmt.Errorf("active session check failed: %w", err)
	}
	if session == nil {
		log.Println("[ANPR_DUMMY] No active IN_PROGRESS session found")
		return nil
	}
	mode, err := p.SessionService.GetSourceMode(ctx, session.ID, "ANPR")
	if err != nil {
		return fmt.Errorf("ANPR source mode unavailable: %w", err)
	}
	if mode != source.ModeDummy {
		return nil
	}

	sample, err := p.getRandomDummyANPRSample(ctx, session.SiteID)
	if err != nil {
		return fmt.Errorf("pick random ANPR sample failed: %w", err)
	}

	externalID := fmt.Sprintf("dummy-anpr-%s", session.ID.String())
	plate := ingest.BuildDummyPlate(uuid.New())
	location := "DUMMY-ANPR"
	cameraID := fmt.Sprintf("DUMMY-CAM-ANPR-%d", time.Now().Unix()%100)
	confidence := fmt.Sprintf("%.1f", 80+float64(time.Now().UnixNano()%190)/10.0)
	fullObject := ""
	plateObject := ""

	if sampleFull, samplePlate, ok := dummyANPRAssetPaths(session.ID); ok {
		fullObject = fmt.Sprintf("demo/%s/%s", session.ID, filepath.Base(sampleFull))
		plateObject = fmt.Sprintf("demo/%s/%s", session.ID, filepath.Base(samplePlate))
		if err := p.uploadLocalDummyImage(ctx, sampleFull, fullObject); err != nil {
			return fmt.Errorf("upload dummy ANPR full image: %w", err)
		}
		if err := p.uploadLocalDummyImage(ctx, samplePlate, plateObject); err != nil {
			return fmt.Errorf("upload dummy ANPR plate image: %w", err)
		}
	}

	if fullObject == "" && sample != nil {
		if sample.MinioFullObject.Valid {
			fullObject = strings.TrimSpace(sample.MinioFullObject.String)
		}
	}

	meta := &ANPRMetadata{
		Plate:      plate,
		FrameTime:  session.StartedAt.Format("2006.01.02 15:04:05.000"),
		Location:   location,
		CameraID:   cameraID,
		Confidence: confidence,
		ID:         externalID,
	}

	if err := p.enqueueANPRInsert(meta, &session.ID, "", "", fullObject, plateObject); err != nil {
		return fmt.Errorf("enqueue dummy ANPR failed: %w", err)
	}

	if p.DimensionHandler != nil {
		dimensionMode, modeErr := p.SessionService.GetSourceMode(ctx, session.ID, "DIMENSION")
		if modeErr != nil {
			log.Printf("[ANPR_DUMMY] Dimension source mode unavailable for session=%s: %v", session.ID, modeErr)
		} else if dimensionMode != source.ModeDisabled {
			if _, err := p.DimensionHandler.ProcessANPRImageWithSessionMode("", meta.Plate, meta.ID, &session.ID, dimensionMode == source.ModeDummy); err != nil {
				log.Printf("[ANPR_DUMMY] Dummy dimension failed for session=%s external_id=%s: %v", session.ID, meta.ID, err)
			}
		}
	}

	log.Printf("[ANPR_DUMMY] Enqueued dummy ANPR for session=%s external_id=%s plate=%s", session.ID, externalID, meta.Plate)
	return nil
}

func dummyANPRAssetPaths(sessionID uuid.UUID) (string, string, bool) {
	index := 1 + int(sessionID[15])%2
	dir := strings.TrimSpace(os.Getenv("DEMO_SAMPLE_DIR"))
	if dir == "" {
		dir = "../../sample-demo"
	}
	full := filepath.Join(dir, fmt.Sprintf("anpr-%d.xml.jpg", index))
	plate := filepath.Join(dir, fmt.Sprintf("anpr-%d.xml.plate.jpg", index))
	if _, err := os.Stat(full); err != nil {
		return "", "", false
	}
	if _, err := os.Stat(plate); err != nil {
		return "", "", false
	}
	return full, plate, true
}

func (p *FileProcessor) uploadLocalDummyImage(ctx context.Context, sourcePath, objectName string) error {
	info, err := os.Stat(sourcePath)
	if err != nil {
		return err
	}
	_, err = p.Minio.FPutObject(ctx, p.Bucket, objectName, sourcePath, minio.PutObjectOptions{
		ContentType: "image/jpeg",
	})
	if err != nil {
		return err
	}
	log.Printf("[ANPR_DUMMY] Uploaded sample %s (%d bytes) to %s/%s", filepath.Base(sourcePath), info.Size(), p.Bucket, objectName)
	return nil
}

func (p *FileProcessor) getRandomDummyANPRSample(ctx context.Context, siteID uuid.UUID) (*dummyANPRSample, error) {
	const query = `
		SELECT
			a.minio_full_image_object
		FROM public.transact_vehicle_actual va
		JOIN public.transact_anpr_capture a ON a.id = va.anpr_id
		WHERE va.site_id = $1
		  AND va.is_deleted = false
		  AND COALESCE(a.minio_full_image_object, '') <> ''
		ORDER BY random()
		LIMIT 1
	`

	row := p.DB.QueryRowContext(ctx, query, siteID)
	var sample dummyANPRSample
	err := row.Scan(
		&sample.MinioFullObject,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &sample, nil
}

// processBatchInSession collects all files that belong to the currently active session.
// 2) Capture semua file dari waktu session dimulai sampai session masih aktif.
// 3) Pilih 1 data per plate dengan confidence paling tinggi (dedup).
// 4) Insert data terpilih ke DB (insertANPRRecordWithSession).
func (p *FileProcessor) processBatchInSession(ctx context.Context, c *ftp.ServerConn, session *session.ActiveSession) bool {
	sessionStart := session.StartedAt
	// List all files in FTP
	entries, err := c.List(p.RemoteDir)
	if err != nil {
		return false
	}

	// Collect all XML files within session window
	type anprFileData struct {
		xmlName    string
		metadata   *ANPRMetadata
		fullImg    string
		plateImg   string
		confidence float64
	}

	var filesInWindow []anprFileData

	for _, e := range entries {
		if e.Type != ftp.EntryTypeFile {
			continue
		}

		// Only process XML files
		if !strings.HasSuffix(strings.ToLower(e.Name), ".xml") {
			continue
		}

		// Parse XML to get metadata
		meta, err := p.parseXML(ctx, c, e.Name)
		if err != nil {
			continue
		}

		// Parse frame time to check if within window
		frameTime, err := ingest.ParseFrameTime(meta.FrameTime)
		if err != nil {
			continue
		}

		// Check if file belongs to the active session.
		// The active session itself is the upper bound; once it is completed,
		// new files are no longer associated because GetActiveSession() returns nil.
		if frameTime.Before(sessionStart) {
			continue
		}

		// Find associated images. Missing images should not block ANPR insert;
		// the row can still be stored with nullable image fields.
		fullImg, plateImg, err := p.findImagesForXML(c, e.Name)
		if err != nil {
			log.Printf("[ANPR] image discovery failed for %s: %v", e.Name, err)
			continue
		}

		// Parse confidence
		conf, _ := strconv.ParseFloat(meta.Confidence, 64)

		filesInWindow = append(filesInWindow, anprFileData{
			xmlName:    e.Name,
			metadata:   meta,
			fullImg:    fullImg,
			plateImg:   plateImg,
			confidence: conf,
		})
		log.Printf("[ANPR] Processing file: %s (plate=%s session=%s)", e.Name, meta.Plate, session.ID)
	}

	if len(filesInWindow) == 0 {
		return true
	}

	// Deduplicate by plate number - keep highest confidence
	// 3) Ambil 1 data per plate dengan confidence tertinggi.
	plateMap := make(map[string]*anprFileData)

	for i := range filesInWindow {
		file := &filesInWindow[i]
		plateNo := anprDedupKey(file.metadata)

		existing, exists := plateMap[plateNo]
		if !exists || file.confidence > existing.confidence {
			plateMap[plateNo] = file
		}
	}

	// Process each unique plate
	var filesToDelete []string

	datePrefix := time.Now().Format("02012006")

	for plateNo, file := range plateMap {
		// Upload files to MinIO
		xmlObj := fmt.Sprintf("%s/%s", datePrefix, file.xmlName)
		fullObj := ""
		plateObj := ""
		if file.fullImg != "" {
			fullObj = fmt.Sprintf("%s/%s", datePrefix, file.fullImg)
		}
		if file.plateImg != "" {
			plateObj = fmt.Sprintf("%s/%s", datePrefix, file.plateImg)
		}

		// Upload XML
		if err := p.uploadXML(ctx, c, file.xmlName, xmlObj); err != nil {
			continue
		}

		// Upload images
		fullImgUploaded := false
		if file.fullImg != "" {
			if err := p.uploadImage(ctx, c, file.fullImg, fullObj); err != nil {
				log.Printf("[ANPR] full image upload failed for %s: %v", file.fullImg, err)
				fullObj = ""
			} else {
				fullImgUploaded = true
			}
		}

		if file.plateImg != "" {
			if err := p.uploadImage(ctx, c, file.plateImg, plateObj); err != nil {
				log.Printf("[ANPR] plate image upload failed for %s: %v", file.plateImg, err)
				plateObj = ""
			}
		}

		// Insert to database with session_id.
		if err := p.enqueueANPRInsert(file.metadata, &session.ID, datePrefix, xmlObj, fullObj, plateObj); err != nil {
			log.Printf("[ANPR] Enqueue failed: plate=%s id=%s err=%v", plateNo, file.metadata.ID, err)
			continue
		}
		log.Printf("[ANPR] Enqueued insert: plate=%s id=%s session=%s", plateNo, file.metadata.ID, session.ID)

		// Dimension has its own source mode and may differ from ANPR.
		if p.DimensionHandler != nil {
			dimensionMode, modeErr := p.SessionService.GetSourceMode(ctx, session.ID, "DIMENSION")
			if modeErr != nil {
				log.Printf("[ANPR] Dimension source mode unavailable for session=%s: %v", session.ID, modeErr)
			} else if dimensionMode != source.ModeDisabled && (file.fullImg != "" || dimensionMode == source.ModeDummy) {
				if err := p.processDimensionsFromFTP(ctx, c, file.metadata, &session.ID, file.fullImg, fullImgUploaded, fullObj, dimensionMode == source.ModeDummy); err != nil {
					_ = err
				}
			}
		}

		// Mark files for deletion
		filesToDelete = append(filesToDelete, file.xmlName)
		if file.fullImg != "" {
			filesToDelete = append(filesToDelete, file.fullImg)
		}
		if file.plateImg != "" {
			filesToDelete = append(filesToDelete, file.plateImg)
		}
	}

	// Delete all processed files from FTP
	if len(filesToDelete) > 0 {
		if err := p.deleteFTP(c, filesToDelete); err != nil {
			_ = err
		}
	}
	return true
}

func anprDedupKey(meta *ANPRMetadata) string {
	if meta == nil {
		return ""
	}
	plate := strings.TrimSpace(meta.Plate)
	if plate != "" {
		return strings.ToUpper(plate)
	}
	externalID := strings.TrimSpace(meta.ID)
	if externalID != "" {
		return "external:" + externalID
	}
	return fmt.Sprintf("unknown:%d", time.Now().UnixNano())
}

// processFileWithoutSession processes single file (legacy behavior)
// 4) Simpan data ANPR ke DB tanpa session_id.
func (p *FileProcessor) processFileWithoutSession(ctx context.Context, c *ftp.ServerConn, name string) bool {
	log.Println("[ANPR] Processing file (no session):", name)

	meta, err := p.parseXML(ctx, c, name)
	if err != nil {
		return true
	}

	// Format tanggal hari ini -> 03122025 (ddMMyyyy)
	datePrefix := time.Now().Format("02012006")

	// cari file jpg yang match dengan nama xml
	fullImg, plateImg, err := p.findImagesForXML(c, name)
	if err != nil {
		return false
	}

	// Object name di MinIO: bucket/03122025/original-filename
	xmlObj := fmt.Sprintf("%s/%s", datePrefix, name)
	fullObj := ""
	plateObj := ""
	if fullImg != "" {
		fullObj = fmt.Sprintf("%s/%s", datePrefix, fullImg)
	}
	if plateImg != "" {
		plateObj = fmt.Sprintf("%s/%s", datePrefix, plateImg)
	}

	// upload XML
	if err := p.uploadXML(ctx, c, name, xmlObj); err != nil {
		return false
	}

	// upload image - track success for dimension
	fullImgUploaded := false

	if fullImg != "" {
		if err := p.uploadImage(ctx, c, fullImg, fullObj); err != nil {
			fullObj = "" // Set to empty if upload failed
		} else {
			fullImgUploaded = true
		}
	}

	if plateImg != "" {
		if err := p.uploadImage(ctx, c, plateImg, plateObj); err != nil {
			plateObj = "" // Set to empty if upload failed
		}
	}

	// insert ke database (even if image upload failed, save what we have)
	if err := p.enqueueANPRInsert(meta, nil, datePrefix, xmlObj, fullObj, plateObj); err != nil {
		log.Printf("[ANPR] Enqueue failed: plate=%s id=%s err=%v", meta.Plate, meta.ID, err)
		return false
	}
	log.Printf("[ANPR] Enqueued insert: plate=%s id=%s", meta.Plate, meta.ID)

	// Process vehicle dimensions if handler is set.
	if p.DimensionHandler != nil && (fullImg != "" || p.DimensionHandler.DummyEnabled) {
		if err := p.processDimensionsFromFTP(ctx, c, meta, nil, fullImg, fullImgUploaded, fullObj, p.DimensionHandler.DummyEnabled); err != nil {
			_ = err
		}
	}

	// semua sukses -> hapus dari FTP
	toDelete := []string{name}
	if fullImg != "" {
		toDelete = append(toDelete, fullImg)
	}
	if plateImg != "" {
		toDelete = append(toDelete, plateImg)
	}
	if err := p.deleteFTP(c, toDelete); err != nil {
		return true
	}
	return true
}

func (p *FileProcessor) parseXML(ctx context.Context, c *ftp.ServerConn, name string) (*ANPRMetadata, error) {
	r, err := c.Retr(path.Join(p.RemoteDir, name))
	if err != nil {
		return nil, fmt.Errorf("ftp retr xml: %w", err)
	}
	defer r.Close()

	b, err := io.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("read xml: %w", err)
	}

	var x xmlResult
	if err := xml.Unmarshal(b, &x); err != nil {
		return nil, fmt.Errorf("unmarshal xml: %w", err)
	}

	return &ANPRMetadata{
		Plate:      x.ANPR.Text.Value,
		FrameTime:  x.Capture.FrameTime.Value,
		Location:   x.Location.Value,
		CameraID:   x.CameraID.Value,
		Confidence: x.ANPR.Confidence.Value,
		ID:         x.ID.Value,
	}, nil
}

// Cari 2 file JPG yang prefix-nya sama dengan nama XML
// contoh:
//
//	xml:     1764569194214.xml
//	full:    1764569194214.xml.jpeg
//	plate:   1764569194214.xml.plate.jpg
func (p *FileProcessor) findImagesForXML(c *ftp.ServerConn, xmlName string) (fullImg, plateImg string, err error) {
	entries, err := c.List(p.RemoteDir)
	if err != nil {
		return "", "", fmt.Errorf("list dir: %w", err)
	}

	prefix := xmlName

	for _, e := range entries {
		if e.Type != ftp.EntryTypeFile {
			continue
		}
		if !strings.HasPrefix(e.Name, prefix) {
			continue
		}

		lower := strings.ToLower(e.Name)
		if strings.Contains(lower, "plate") &&
			(strings.HasSuffix(lower, ".jpg") || strings.HasSuffix(lower, ".jpeg")) {
			plateImg = e.Name
		} else if strings.HasSuffix(lower, ".jpg") || strings.HasSuffix(lower, ".jpeg") {
			// diasumsikan jpg lain adalah full image
			fullImg = e.Name
		}
	}

	return fullImg, plateImg, nil
}

func (p *FileProcessor) uploadXML(ctx context.Context, c *ftp.ServerConn, xmlName, objectName string) error {
	r, err := c.Retr(path.Join(p.RemoteDir, xmlName))
	if err != nil {
		return fmt.Errorf("ftp retr xml: %w", err)
	}
	defer r.Close()

	_, err = p.Minio.PutObject(ctx, p.Bucket, objectName, r, -1, minio.PutObjectOptions{
		ContentType: "application/xml",
	})
	if err != nil {
		return fmt.Errorf("minio put xml: %w", err)
	}
	return nil
}

func (p *FileProcessor) uploadImage(ctx context.Context, c *ftp.ServerConn, ftpName, objectName string) error {
	r, err := c.Retr(path.Join(p.RemoteDir, ftpName))
	if err != nil {
		return fmt.Errorf("ftp retr image: %w", err)
	}
	defer r.Close()

	_, err = p.Minio.PutObject(ctx, p.Bucket, objectName, r, -1, minio.PutObjectOptions{
		ContentType: "image/jpeg",
	})
	if err != nil {
		return fmt.Errorf("minio put image: %w", err)
	}
	return nil
}

func (p *FileProcessor) deleteFTP(c *ftp.ServerConn, names []string) error {
	for _, n := range names {
		fp := path.Join(p.RemoteDir, n)
		if err := c.Delete(fp); err != nil {
			return fmt.Errorf("delete %s: %w", fp, err)
		}
	}
	return nil
}

func (p *FileProcessor) insertANPRRecord(ctx context.Context, meta *ANPRMetadata, dateFolder, xmlObj, fullObj, plateObj string) error {

	// parse confidence (string -> float)
	var conf sql.NullFloat64
	if meta.Confidence != "" {
		if f, err := strconv.ParseFloat(meta.Confidence, 64); err == nil {
			conf.Valid = true
			conf.Float64 = f
		}
	}

	// parse frametime ke timestamptz (layout sesuai XML: 2025.12.01 14:06:27.946)
	var capturedAt sql.NullTime
	if meta.FrameTime != "" {
		if t, err := ingest.ParseFrameTime(meta.FrameTime); err == nil {
			capturedAt.Valid = true
			capturedAt.Time = t
		}
	}

	query := `
	INSERT INTO public.transact_anpr_capture
		(site_id, external_id, plate_no, confidence, captured_at,
		 location_code, camera_id,
		 minio_bucket, minio_date_folder,
		 minio_xml_object, minio_full_image_object, minio_plate_image_object)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
	ON CONFLICT (external_id) DO NOTHING
	`

	_, err := p.DB.ExecContext(
		ctx,
		query,
		p.SiteUUID, // Site UUID from master_site.id
		ingest.NullableTrimmedString(meta.ID),
		ingest.NullableTrimmedString(meta.Plate),
		conf,
		capturedAt,
		ingest.NullableTrimmedString(meta.Location),
		ingest.NullableTrimmedString(meta.CameraID),
		ingest.NullableTrimmedString(p.Bucket),
		ingest.NullableTrimmedString(dateFolder),
		ingest.NullableTrimmedString(xmlObj),
		ingest.NullableTrimmedString(fullObj),
		ingest.NullableTrimmedString(plateObj),
	)
	if err != nil {
		return fmt.Errorf("exec insert: %w", err)
	}

	return nil
}

// insertANPRRecordWithSession inserts ANPR record with session_id
// 4) Insert data ANPR ke database (dengan session).
func (p *FileProcessor) insertANPRRecordWithSession(ctx context.Context, meta *ANPRMetadata, sessionID uuid.UUID, dateFolder, xmlObj, fullObj, plateObj string) error {

	// parse confidence (string -> float)
	var conf sql.NullFloat64
	if meta.Confidence != "" {
		if f, err := strconv.ParseFloat(meta.Confidence, 64); err == nil {
			conf.Valid = true
			conf.Float64 = f
		}
	}

	// parse frametime ke timestamptz (layout sesuai XML: 2025.12.01 14:06:27.946)
	var capturedAt sql.NullTime
	if meta.FrameTime != "" {
		if t, err := ingest.ParseFrameTime(meta.FrameTime); err == nil {
			capturedAt.Valid = true
			capturedAt.Time = t
		}
	}

	query := `
	INSERT INTO public.transact_anpr_capture
		(site_id, session_id, external_id, plate_no, confidence, captured_at,
		 location_code, camera_id,
		 minio_bucket, minio_date_folder,
		 minio_xml_object, minio_full_image_object, minio_plate_image_object)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
	ON CONFLICT (external_id) DO NOTHING
	`

	_, err := p.DB.ExecContext(
		ctx,
		query,
		p.SiteUUID, // Site UUID from master_site.id
		sessionID,  // Session ID
		ingest.NullableTrimmedString(meta.ID),
		ingest.NullableTrimmedString(meta.Plate),
		conf,
		capturedAt,
		ingest.NullableTrimmedString(meta.Location),
		ingest.NullableTrimmedString(meta.CameraID),
		ingest.NullableTrimmedString(p.Bucket),
		ingest.NullableTrimmedString(dateFolder),
		ingest.NullableTrimmedString(xmlObj),
		ingest.NullableTrimmedString(fullObj),
		ingest.NullableTrimmedString(plateObj),
	)
	if err != nil {
		return fmt.Errorf("exec insert with session: %w", err)
	}

	return nil
}

// processDimensions downloads the image from MinIO and processes vehicle dimensions
func (p *FileProcessor) processDimensions(ctx context.Context, meta *ANPRMetadata, objectName string) error {
	// Download image from MinIO to temporary file
	tmpFile := fmt.Sprintf("/tmp/anpr_%s.jpg", meta.ID)

	obj, err := p.Minio.GetObject(ctx, p.Bucket, objectName, minio.GetObjectOptions{})
	if err != nil {
		return fmt.Errorf("get object from minio: %w", err)
	}
	defer obj.Close()

	// Save to temporary file
	outFile, err := os.Create(tmpFile)
	if err != nil {
		return fmt.Errorf("create temp file: %w", err)
	}
	defer outFile.Close()

	if _, err := io.Copy(outFile, obj); err != nil {
		return fmt.Errorf("copy to temp file: %w", err)
	}

	// Process dimensions
	_, err = p.DimensionHandler.ProcessANPRImage(tmpFile, meta.Plate, meta.ID)
	if err != nil {
		return fmt.Errorf("process dimensions: %w", err)
	}

	// Clean up temp file
	os.Remove(tmpFile)

	return nil
}

// processDimensionsFromFTP processes dimensions directly from FTP or MinIO
func (p *FileProcessor) processDimensionsFromFTP(ctx context.Context, c *ftp.ServerConn, meta *ANPRMetadata, sessionID *uuid.UUID, fullImgName string, uploaded bool, minioObject string, sessionIsDummy bool) error {
	tmpFile := fmt.Sprintf("/tmp/anpr_%s.jpg", meta.ID)
	defer os.Remove(tmpFile)

	if sessionIsDummy {
		_, err := p.DimensionHandler.ProcessANPRImageWithSessionMode("", meta.Plate, meta.ID, sessionID, true)
		if err != nil {
			return fmt.Errorf("process dummy dimensions: %w", err)
		}
		return nil
	}

	// If image was uploaded to MinIO, download from there
	if uploaded && minioObject != "" {
		obj, err := p.Minio.GetObject(ctx, p.Bucket, minioObject, minio.GetObjectOptions{})
		if err != nil {
			return fmt.Errorf("get object from minio: %w", err)
		}
		defer obj.Close()

		outFile, err := os.Create(tmpFile)
		if err != nil {
			return fmt.Errorf("create temp file: %w", err)
		}
		defer outFile.Close()

		if _, err := io.Copy(outFile, obj); err != nil {
			return fmt.Errorf("copy from minio to temp file: %w", err)
		}
	} else {
		// Image not uploaded to MinIO, download directly from FTP
		r, err := c.Retr(path.Join(p.RemoteDir, fullImgName))
		if err != nil {
			return fmt.Errorf("ftp retr image: %w", err)
		}
		defer r.Close()

		outFile, err := os.Create(tmpFile)
		if err != nil {
			return fmt.Errorf("create temp file: %w", err)
		}
		defer outFile.Close()

		if _, err := io.Copy(outFile, r); err != nil {
			return fmt.Errorf("copy from ftp to temp file: %w", err)
		}
	}

	// Process dimensions
	_, err := p.DimensionHandler.ProcessANPRImageWithSessionMode(tmpFile, meta.Plate, meta.ID, sessionID, false)
	if err != nil {
		return fmt.Errorf("process dimensions: %w", err)
	}

	return nil
}
