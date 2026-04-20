package handler

import (
	"context"
	"database/sql"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path"
	"strconv"
	"strings"
	"sync"
	"time"

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
	DimensionHandler *DimensionHandler // Optional: for vehicle dimension detection
	SessionService   *SessionService   // Session management
	InsertQueue      *ANPRInsertQueue
	WeighingTrigger  *WeighingTriggerConfig
	CCTVTrigger      *CCTVTriggerConfig

	triggerMu                  sync.Mutex
	lastTriggeredSessionID     uuid.UUID
	lastTriggeredAt            time.Time
	cctvTriggerMu              sync.Mutex
	lastCCTVTriggeredSessionID uuid.UUID
}

// WeighingTriggerConfig configures external weighing capture trigger.
type WeighingTriggerConfig struct {
	URL        string
	Direction  string
	TimeoutSec int
	Save       bool
	Dummy      bool
}

// CCTVTriggerConfig configures external CCTV recording trigger.
type CCTVTriggerConfig struct {
	Enabled bool
	URL     string
	Seconds int
	Dummy   bool
}

// SetDimensionHandler sets the dimension handler for processing vehicle dimensions
func (p *FileProcessor) SetDimensionHandler(handler *DimensionHandler) {
	p.DimensionHandler = handler
}

// SetSessionService sets the session service for session management
func (p *FileProcessor) SetSessionService(service *SessionService) {
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

// SetWeighingTriggerConfig sets trigger configuration for external weighing capture.
func (p *FileProcessor) SetWeighingTriggerConfig(cfg *WeighingTriggerConfig) {
	p.WeighingTrigger = cfg
}

// SetCCTVTriggerConfig sets trigger configuration for CCTV recording.
func (p *FileProcessor) SetCCTVTriggerConfig(cfg *CCTVTriggerConfig) {
	p.CCTVTrigger = cfg
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
	log.Printf("[ANPR] Active session found: %s", session.Code)

	// Process batch of files within session window
	return p.processBatchInSession(ctx, c, session)
}

func (p *FileProcessor) triggerWeighingIfNeeded(ctx context.Context, session *ActiveSession) {
	if p.WeighingTrigger == nil || p.WeighingTrigger.URL == "" {
		return
	}

	p.triggerMu.Lock()
	if session != nil {
		if p.lastTriggeredSessionID == session.ID {
			p.triggerMu.Unlock()
			return
		}
		p.lastTriggeredSessionID = session.ID
	} else {
		// Avoid spamming triggers when no session is active.
		if time.Since(p.lastTriggeredAt) < 2*time.Second {
			p.triggerMu.Unlock()
			return
		}
		p.lastTriggeredAt = time.Now()
	}
	p.triggerMu.Unlock()

	triggerURL, err := buildTriggerURL(
		p.WeighingTrigger.URL,
		p.WeighingTrigger.Direction,
		p.WeighingTrigger.TimeoutSec,
		p.WeighingTrigger.Save,
		p.WeighingTrigger.Dummy,
	)
	if err != nil {
		return
	}

	log.Printf("[ANPR] WIM trigger: %s", triggerURL)

	go func() {
		req, err := http.NewRequestWithContext(context.Background(), http.MethodPost, triggerURL, nil)
		if err != nil {
			return
		}

		// Allow enough time for CCTV recording duration to finish.
		client := &http.Client{Timeout: 25 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			return
		}

		log.Printf("[ANPR] WIM trigger success: %s", resp.Status)
	}()
}

func (p *FileProcessor) triggerCCTVIfNeeded(ctx context.Context, session *ActiveSession) {
	if p.CCTVTrigger == nil || !p.CCTVTrigger.Enabled || p.CCTVTrigger.URL == "" {
		return
	}

	p.cctvTriggerMu.Lock()
	if p.lastCCTVTriggeredSessionID == session.ID {
		p.cctvTriggerMu.Unlock()
		return
	}
	p.lastCCTVTriggeredSessionID = session.ID
	p.cctvTriggerMu.Unlock()

	triggerURL, err := buildCCTVTriggerURL(p.CCTVTrigger.URL, p.CCTVTrigger.Seconds, session.SiteID, session.ID, p.CCTVTrigger.Dummy)
	if err != nil {
		return
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, triggerURL, nil)
	if err != nil {
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return
	}
}

func buildTriggerURL(raw, direction string, timeoutSeconds int, save, dummy bool) (string, error) {
	u, err := url.Parse(raw)
	if err != nil {
		return "", err
	}
	if u.Path == "" || u.Path == "/capture" {
		u.Path = "/ws/wim/anpr-capture"
	}
	q := u.Query()
	if direction != "" {
		q.Set("direction", direction)
	}
	if timeoutSeconds > 0 {
		q.Set("timeoutSeconds", strconv.Itoa(timeoutSeconds))
	}
	q.Set("save", strconv.FormatBool(save))
	q.Set("dummy", strconv.FormatBool(dummy))
	u.RawQuery = q.Encode()
	return u.String(), nil
}

func buildCCTVTriggerURL(raw string, seconds int, siteID, sessionID uuid.UUID, dummy bool) (string, error) {
	u, err := url.Parse(raw)
	if err != nil {
		return "", err
	}
	q := u.Query()
	if seconds > 0 {
		q.Set("seconds", strconv.Itoa(seconds))
	}
	if siteID != uuid.Nil {
		q.Set("site_id", siteID.String())
	}
	if sessionID != uuid.Nil {
		q.Set("session_id", sessionID.String())
	}
	q.Set("dummy", strconv.FormatBool(dummy))
	u.RawQuery = q.Encode()
	return u.String(), nil
}

// processBatchInSession collects all files in session window and processes them
// 2) Capture semua file dalam timeframe session (window start/end).
// 3) Pilih 1 data per plate dengan confidence paling tinggi (dedup).
// 4) Insert data terpilih ke DB (insertANPRRecordWithSession).
func (p *FileProcessor) processBatchInSession(ctx context.Context, c *ftp.ServerConn, session *ActiveSession) bool {
	// Get session window boundaries
	windowStart, windowEnd := p.SessionService.GetWindowBoundaries(session)
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
		frameTime, err := parseFrameTime(meta.FrameTime)
		if err != nil {
			continue
		}

		// Check if file is within session window
		if frameTime.After(windowStart) && frameTime.Before(windowEnd) {
			// Trigger WIM/CCTV as soon as we see any file in the window,
			// even if plate data/images are missing.
			p.triggerWeighingIfNeeded(ctx, session)
			p.triggerCCTVIfNeeded(ctx, session)

			// Find associated images (may be missing when plate is not detected)
			fullImg, plateImg, err := p.findImagesForXML(c, e.Name)
			if err != nil {
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
			log.Printf("[ANPR] Processing file: %s (plate=%s)", e.Name, meta.Plate)
		}
	}

	if len(filesInWindow) == 0 {
		return true
	}

	// Deduplicate by plate number - keep highest confidence
	// 3) Ambil 1 data per plate dengan confidence tertinggi.
	plateMap := make(map[string]*anprFileData)

	for i := range filesInWindow {
		file := &filesInWindow[i]
		plateNo := file.metadata.Plate

		existing, exists := plateMap[plateNo]
		if !exists || file.confidence > existing.confidence {
			plateMap[plateNo] = file
		}
	}

	// Process each unique plate
	processedCount := 0
	var filesToDelete []string

	datePrefix := time.Now().Format("02012006")

	for plateNo, file := range plateMap {
		// Upload files to MinIO
		xmlObj := fmt.Sprintf("%s/%s", datePrefix, file.xmlName)
		fullObj := fmt.Sprintf("%s/%s", datePrefix, file.fullImg)
		plateObj := fmt.Sprintf("%s/%s", datePrefix, file.plateImg)

		// Upload XML
		if err := p.uploadXML(ctx, c, file.xmlName, xmlObj); err != nil {
			continue
		}

		// Upload images
		fullImgUploaded := false
		if err := p.uploadImage(ctx, c, file.fullImg, fullObj); err != nil {
			fullObj = ""
		} else {
			fullImgUploaded = true
		}

		if err := p.uploadImage(ctx, c, file.plateImg, plateObj); err != nil {
			plateObj = ""
		}

		// Insert to database with session_id
		// 4) Simpan data ANPR ke DB dengan session_id.
		if err := p.enqueueANPRInsert(file.metadata, &session.ID, datePrefix, xmlObj, fullObj, plateObj); err != nil {
			log.Printf("[ANPR] Enqueue failed: plate=%s id=%s err=%v", plateNo, file.metadata.ID, err)
			continue
		}
		log.Printf("[ANPR] Enqueued insert: plate=%s id=%s", plateNo, file.metadata.ID)

		// Process dimensions if enabled
		// DIMENSION: perhitungan dimensi kendaraan dari gambar full (via processDimensionsFromFTP).
		if p.DimensionHandler != nil {
			if err := p.processDimensionsFromFTP(ctx, c, file.metadata, file.fullImg, fullImgUploaded, fullObj); err != nil {
				_ = err
			}
		}

		// Mark files for deletion
		filesToDelete = append(filesToDelete, file.xmlName, file.fullImg, file.plateImg)
		processedCount++
	}

	// Delete all processed files from FTP
	if len(filesToDelete) > 0 {
		if err := p.deleteFTP(c, filesToDelete); err != nil {
			_ = err
		}
	}
	return true
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
	fullObj := fmt.Sprintf("%s/%s", datePrefix, fullImg)
	plateObj := fmt.Sprintf("%s/%s", datePrefix, plateImg)

	// upload XML
	if err := p.uploadXML(ctx, c, name, xmlObj); err != nil {
		return false
	}

	// upload 2 image - track success for each
	fullImgUploaded := false

	if err := p.uploadImage(ctx, c, fullImg, fullObj); err != nil {
		fullObj = "" // Set to empty if upload failed
	} else {
		fullImgUploaded = true
	}

	if err := p.uploadImage(ctx, c, plateImg, plateObj); err != nil {
		plateObj = "" // Set to empty if upload failed
	}

	// insert ke database (even if image upload failed, save what we have)
	if err := p.enqueueANPRInsert(meta, nil, datePrefix, xmlObj, fullObj, plateObj); err != nil {
		log.Printf("[ANPR] Enqueue failed: plate=%s id=%s err=%v", meta.Plate, meta.ID, err)
		return false
	}
	log.Printf("[ANPR] Enqueued insert: plate=%s id=%s", meta.Plate, meta.ID)
	p.triggerWeighingIfNeeded(ctx, nil)

	// Process vehicle dimensions if handler is set
	// DIMENSION: perhitungan dimensi kendaraan dari gambar full (via processDimensionsFromFTP).
	if p.DimensionHandler != nil {
		if err := p.processDimensionsFromFTP(ctx, c, meta, fullImg, fullImgUploaded, fullObj); err != nil {
			_ = err
		}
	}

	// semua sukses -> hapus dari FTP
	if err := p.deleteFTP(c, []string{name, fullImg, plateImg}); err != nil {
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

	if fullImg == "" || plateImg == "" {
		return "", "", fmt.Errorf("images not ready yet (full=%q plate=%q)", fullImg, plateImg)
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
		if t, err := parseFrameTime(meta.FrameTime); err == nil {
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
		meta.ID,
		meta.Plate,
		conf,
		capturedAt,
		meta.Location,
		meta.CameraID,
		p.Bucket,
		dateFolder,
		xmlObj,
		fullObj,
		plateObj,
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
		if t, err := parseFrameTime(meta.FrameTime); err == nil {
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
		meta.ID,
		meta.Plate,
		conf,
		capturedAt,
		meta.Location,
		meta.CameraID,
		p.Bucket,
		dateFolder,
		xmlObj,
		fullObj,
		plateObj,
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
func (p *FileProcessor) processDimensionsFromFTP(ctx context.Context, c *ftp.ServerConn, meta *ANPRMetadata, fullImgName string, uploaded bool, minioObject string) error {
	tmpFile := fmt.Sprintf("/tmp/anpr_%s.jpg", meta.ID)
	defer os.Remove(tmpFile)

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
	_, err := p.DimensionHandler.ProcessANPRImage(tmpFile, meta.Plate, meta.ID)
	if err != nil {
		return fmt.Errorf("process dimensions: %w", err)
	}

	return nil
}
