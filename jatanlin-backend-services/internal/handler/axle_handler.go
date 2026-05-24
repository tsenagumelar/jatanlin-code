package handler

import (
	"context"
	"database/sql"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jlaffaye/ftp"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// ===== Metadata axle yg kita ambil =====

type AxleMetadata struct {
	Plate     string
	FrameTime string
	CameraID  string
	ID        string

	Length   int // mm
	NWheels  int
	NAxles   int
	Category string
	BodyType string
}

type dummyAxleSample struct {
	MinioImageObj sql.NullString
}

func parseFrameTime(value string) (time.Time, error) {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		loc = time.Local
	}
	return time.ParseInLocation("2006.01.02 15:04:05.000", value, loc)
}

// Struktur XML untuk parsing axle
type axleXML struct {
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
	} `xml:"anpr"`

	VAC struct {
		Vehicle0 struct {
			Length struct {
				Value string `xml:"value,attr"`
			} `xml:"length"`
			NWheels struct {
				Value string `xml:"value,attr"`
			} `xml:"nwheels"`
			NAxles struct {
				Value string `xml:"value,attr"`
			} `xml:"naxles"`
			Category struct {
				Value string `xml:"value,attr"`
			} `xml:"category"`
			BodyType struct {
				Value string `xml:"value,attr"`
			} `xml:"body_type"`
		} `xml:"vehicle0"`
	} `xml:"vac"`
}

// ===== Processor untuk folder AXLE =====

type AxleProcessor struct {
	DB             *sql.DB
	SiteUUID       string // Site UUID from master_site.id
	RemoteDir      string
	Minio          *minio.Client
	Bucket         string
	SessionService *SessionService // Session management
	InsertQueue    *AxleInsertQueue
}

func NewAxleProcessor(db *sql.DB, siteUUID, remoteDir, endpoint, accessKey, secretKey, bucket string, useSSL bool) (*AxleProcessor, error) {
	mc, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, err
	}

	return &AxleProcessor{
		DB:        db,
		SiteUUID:  siteUUID,
		RemoteDir: remoteDir,
		Minio:     mc,
		Bucket:    bucket,
	}, nil
}

// SetSessionService sets the session service for session management
func (p *AxleProcessor) SetSessionService(service *SessionService) {
	p.SessionService = service
}

// SetInsertQueue initializes the AXLE insert queue backed by NATS JetStream.
func (p *AxleProcessor) SetInsertQueue(natsURL string) error {
	q, err := NewAxleInsertQueue(natsURL, p.DB, p.SiteUUID)
	if err != nil {
		return err
	}
	p.InsertQueue = q
	return nil
}

func (p *AxleProcessor) enqueueAxleInsert(meta *AxleMetadata, sessionID *uuid.UUID, dateFolder, xmlObj, imgObj string) error {
	if p.InsertQueue == nil {
		return fmt.Errorf("insert queue not initialized")
	}
	return p.InsertQueue.Enqueue(meta, p.Bucket, sessionID, dateFolder, xmlObj, imgObj)
}

// Dipanggil watcher tiap kali ada file di folder AXLE
// 1) Validasi syarat listen: hanya proses jika ada session IN_PROGRESS (kalau tidak, skip).
// 2) Jika memenuhi, lanjut ke batch processing untuk window session.
// Kita hanya proses file .xml
func (p *AxleProcessor) HandleNewFileAXLE(ctx context.Context, c *ftp.ServerConn, name string) bool {
	if !strings.HasSuffix(strings.ToLower(name), ".xml") {
		return true
	}

	// Check if session service is configured
	if p.SessionService == nil {
		log.Println("[AXLE] WARNING: No session service configured, processing without session")
		return p.processFileWithoutSession(ctx, c, name)
	}

	// Check for active session
	session, err := p.SessionService.GetActiveSession()
	if err != nil {
		log.Printf("[AXLE] Error checking active session: %v", err)
		return false
	}

	if session == nil {
		log.Println("[AXLE] No active IN_PROGRESS session found, skipping file:", name)
		return true
	}
	if session.IsDummy {
		log.Printf("[AXLE] Active session %s is in dummy mode, skipping FTP ingest", session.Code)
		return true
	}

	log.Printf("[AXLE] Active session found: %s (Window: %ds)", session.Code, p.SessionService.SessionWindowSeconds)

	// Process files while session is still active.
	return p.processBatchInSession(ctx, c, session)
}

// ProcessDummySession inserts one deterministic dummy AXLE row per active session.
func (p *AxleProcessor) ProcessDummySession(ctx context.Context) error {
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
		log.Println("[AXLE_DUMMY] No active IN_PROGRESS session found")
		return nil
	}
	if !session.IsDummy {
		return nil
	}

	sample, err := p.getRandomDummyAxleSample(ctx, session.SiteID)
	if err != nil {
		return fmt.Errorf("pick random AXLE sample failed: %w", err)
	}

	externalID := fmt.Sprintf("dummy-axle-%s", session.ID.String())
	plate := buildDummyPlate(uuid.New())
	cameraID := fmt.Sprintf("DUMMY-CAM-AXLE-%d", time.Now().Unix()%100)
	length := 8000 + int(time.Now().UnixNano()%12000)
	nAxles := 2 + int(time.Now().UnixNano()%4)
	nWheels := nAxles * 2
	category := fmt.Sprintf("CAT-%d", 1+time.Now().Unix()%5)
	bodyType := fmt.Sprintf("BODY-%d", 1+time.Now().Unix()%5)
	imgObj := ""

	if sample != nil {
		if sample.MinioImageObj.Valid {
			imgObj = strings.TrimSpace(sample.MinioImageObj.String)
		}
	}

	meta := &AxleMetadata{
		Plate:     plate,
		FrameTime: session.StartedAt.Format("2006.01.02 15:04:05.000"),
		CameraID:  cameraID,
		ID:        externalID,
		Length:    length,
		NWheels:   nWheels,
		NAxles:    nAxles,
		Category:  category,
		BodyType:  bodyType,
	}

	if err := p.enqueueAxleInsert(meta, &session.ID, "", "", imgObj); err != nil {
		return fmt.Errorf("enqueue dummy AXLE failed: %w", err)
	}

	log.Printf("[AXLE_DUMMY] Enqueued dummy AXLE for session=%s external_id=%s", session.ID, externalID)
	return nil
}

func (p *AxleProcessor) getRandomDummyAxleSample(ctx context.Context, siteID uuid.UUID) (*dummyAxleSample, error) {
	const query = `
		SELECT
			a.minio_image_object
		FROM public.transact_vehicle_actual va
		JOIN public.transact_axle_capture a ON a.id = va.axle_id
		WHERE va.site_id = $1
		  AND va.is_deleted = false
		  AND COALESCE(a.minio_image_object, '') <> ''
		ORDER BY random()
		LIMIT 1
	`

	row := p.DB.QueryRowContext(ctx, query, siteID)
	var sample dummyAxleSample
	err := row.Scan(
		&sample.MinioImageObj,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &sample, nil
}

// processBatchInSession collects all files that belong to the active session.
// 2) Capture semua file dari waktu session dimulai sampai session masih aktif.
// 3) Pilih 1 data terbaru dengan total_axles > 0.
// 4) Insert data ke DB (insertAxleRecord).
func (p *AxleProcessor) processBatchInSession(ctx context.Context, c *ftp.ServerConn, session *ActiveSession) bool {
	sessionStart := session.StartedAt
	log.Printf("[AXLE_BATCH] Collecting files from active session start: %s",
		sessionStart.Format(time.RFC3339))

	entries, err := c.List(p.RemoteDir)
	if err != nil {
		log.Printf("[AXLE_BATCH] Failed to list FTP directory: %v", err)
		return false
	}

	type axleFileData struct {
		xmlName   string
		metadata  *AxleMetadata
		imgName   string
		frameTime time.Time
	}

	var filesInWindow []axleFileData

	for _, e := range entries {
		if e.Type != ftp.EntryTypeFile {
			continue
		}
		if !strings.HasSuffix(strings.ToLower(e.Name), ".xml") {
			continue
		}

		meta, err := p.parseAxleXML(ctx, c, e.Name)
		if err != nil {
			log.Printf("[AXLE_BATCH] Failed to parse %s: %v", e.Name, err)
			continue
		}

		frameTime, err := parseFrameTime(meta.FrameTime)
		if err != nil {
			log.Printf("[AXLE_BATCH] Failed to parse frame time for %s: %v", e.Name, err)
			continue
		}

		if frameTime.Before(sessionStart) {
			continue
		}
		if meta.NAxles <= 0 {
			log.Printf("[AXLE_BATCH] Skipping %s (total_axles=%d)", e.Name, meta.NAxles)
			continue
		}

		imgName, err := p.findImageForAxleXML(c, e.Name)
		if err != nil {
			log.Printf("[AXLE_BATCH] Image not ready for %s: %v", e.Name, err)
		}

		filesInWindow = append(filesInWindow, axleFileData{
			xmlName:   e.Name,
			metadata:  meta,
			imgName:   imgName,
			frameTime: frameTime,
		})

		log.Printf("[AXLE_BATCH] Collected: %s (axles=%d session=%s)", e.Name, meta.NAxles, session.ID)
	}

	log.Printf("[AXLE_BATCH] Total files collected in window: %d", len(filesInWindow))

	if len(filesInWindow) == 0 {
		log.Println("[AXLE_BATCH] No files found in session window")
		return true
	}

	// Pick latest by frame time
	latest := filesInWindow[0]
	for i := 1; i < len(filesInWindow); i++ {
		if filesInWindow[i].frameTime.After(latest.frameTime) {
			latest = filesInWindow[i]
		}
	}

	var filesToDelete []string

	datePrefix := time.Now().Format("02012006")

	file := latest
	log.Printf("[AXLE_BATCH] Processing latest file: %s (axles=%d)", file.xmlName, file.metadata.NAxles)

	xmlObj := fmt.Sprintf("%s/%s", datePrefix, file.xmlName)
	imgObj := ""
	if file.imgName != "" {
		imgObj = fmt.Sprintf("%s/%s", datePrefix, file.imgName)
	}

	if err := p.uploadXML(ctx, c, file.xmlName, xmlObj); err != nil {
		log.Printf("[AXLE_BATCH] Failed to upload XML for %s: %v", file.xmlName, err)
		return true
	}
	if file.imgName != "" {
		if err := p.uploadImage(ctx, c, file.imgName, imgObj); err != nil {
			log.Printf("[AXLE_BATCH] Failed to upload image for %s: %v", file.xmlName, err)
			imgObj = ""
		}
	}
	if err := p.enqueueAxleInsert(file.metadata, &session.ID, datePrefix, xmlObj, imgObj); err != nil {
		log.Printf("[AXLE_BATCH] Failed to enqueue DB for %s: %v", file.xmlName, err)
		return true
	}

	filesToDelete = append(filesToDelete, file.xmlName)
	if file.imgName != "" {
		filesToDelete = append(filesToDelete, file.imgName)
	}

	if len(filesToDelete) > 0 {
		if err := p.deleteFTP(c, filesToDelete); err != nil {
			log.Printf("[AXLE_BATCH] Warning: Failed to delete some files from FTP: %v", err)
		}
	}

	log.Printf("[AXLE_BATCH] Session %s: Processed latest file %s", session.Code, file.xmlName)
	return true
}

// processFileWithoutSession processes single file (legacy behavior)
// 4) Simpan data AXLE ke DB tanpa session_id.
func (p *AxleProcessor) processFileWithoutSession(ctx context.Context, c *ftp.ServerConn, name string) bool {
	log.Println("[AXLE] processing xml:", name)

	meta, err := p.parseAxleXML(ctx, c, name)
	if err != nil {
		log.Println("[AXLE] parse xml error:", err)
		// xml rusak → tandai selesai saja (tidak retry terus)
		return true
	}

	log.Printf("[AXLE] ID=%s Plate=%s Time=%s Cam=%s Length=%dmm Axles=%d Wheels=%d Cat=%s Body=%s\n",
		meta.ID, meta.Plate, meta.FrameTime, meta.CameraID,
		meta.Length, meta.NAxles, meta.NWheels, meta.Category, meta.BodyType)

	// Folder tanggal hari ini, misal: 03122025
	datePrefix := time.Now().Format("02012006")

	// cari 1 file jpg yg prefix-nya sama dengan nama xml
	imgName, err := p.findImageForAxleXML(c, name)
	if err != nil {
		log.Println("[AXLE] find image error:", err)
		// jpg belum ada → biarkan watcher retry di polling berikutnya
		return false
	}

	xmlObj := fmt.Sprintf("%s/%s", datePrefix, name)
	imgObj := fmt.Sprintf("%s/%s", datePrefix, imgName)

	if err := p.uploadXML(ctx, c, name, xmlObj); err != nil {
		log.Println("[AXLE] upload xml error:", err)
		return false
	}
	if err := p.uploadImage(ctx, c, imgName, imgObj); err != nil {
		log.Println("[AXLE] upload image error:", err)
		return false
	}

	if err := p.enqueueAxleInsert(meta, nil, datePrefix, xmlObj, imgObj); err != nil {
		log.Println("[AXLE] enqueue DB error:", err)
		return false
	}

	// semua sudah ke-upload → hapus dari FTP
	if err := p.deleteFTP(c, []string{name, imgName}); err != nil {
		log.Println("[AXLE] delete ftp error:", err)
		// file sudah aman di MinIO, jadi anggap selesai
		return true
	}

	log.Println("[AXLE] done ID:", meta.ID)
	return true
}

func (p *AxleProcessor) parseAxleXML(ctx context.Context, c *ftp.ServerConn, name string) (*AxleMetadata, error) {
	r, err := c.Retr(path.Join(p.RemoteDir, name))
	if err != nil {
		return nil, fmt.Errorf("ftp retr xml: %w", err)
	}
	defer r.Close()

	b, err := io.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("read xml: %w", err)
	}

	var x axleXML
	if err := xml.Unmarshal(b, &x); err != nil {
		return nil, fmt.Errorf("unmarshal xml: %w", err)
	}

	meta := &AxleMetadata{
		Plate:     x.ANPR.Text.Value,
		FrameTime: x.Capture.FrameTime.Value,
		CameraID:  x.CameraID.Value,
		ID:        x.ID.Value,
		Category:  x.VAC.Vehicle0.Category.Value,
		BodyType:  x.VAC.Vehicle0.BodyType.Value,
	}

	fmt.Sscanf(x.VAC.Vehicle0.Length.Value, "%d", &meta.Length)
	fmt.Sscanf(x.VAC.Vehicle0.NWheels.Value, "%d", &meta.NWheels)
	fmt.Sscanf(x.VAC.Vehicle0.NAxles.Value, "%d", &meta.NAxles)

	return meta, nil
}

func (p *AxleProcessor) findImageForAxleXML(c *ftp.ServerConn, xmlName string) (string, error) {
	entries, err := c.List(p.RemoteDir)
	if err != nil {
		return "", fmt.Errorf("list dir: %w", err)
	}

	prefix := xmlName // contoh: 1764570627075.xml
	var candidate string

	for _, e := range entries {
		if e.Type != ftp.EntryTypeFile {
			continue
		}
		if !strings.HasPrefix(e.Name, prefix) {
			continue
		}
		lower := strings.ToLower(e.Name)
		if strings.HasSuffix(lower, ".jpg") || strings.HasSuffix(lower, ".jpeg") {
			candidate = e.Name
			break
		}
	}

	if candidate == "" {
		return "", fmt.Errorf("image not found for xml %s", xmlName)
	}
	return candidate, nil
}

func (p *AxleProcessor) uploadXML(ctx context.Context, c *ftp.ServerConn, xmlName, objectName string) error {
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
	log.Println("[AXLE] uploaded xml to minio:", objectName)
	return nil
}

func (p *AxleProcessor) uploadImage(ctx context.Context, c *ftp.ServerConn, ftpName, objectName string) error {
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
	log.Println("[AXLE] uploaded image to minio:", objectName)
	return nil
}

func (p *AxleProcessor) deleteFTP(c *ftp.ServerConn, names []string) error {
	for _, n := range names {
		fp := path.Join(p.RemoteDir, n)
		log.Println("[AXLE] delete ftp:", fp)
		if err := c.Delete(fp); err != nil {
			return fmt.Errorf("delete %s: %w", fp, err)
		}
	}
	return nil
}

func (p *AxleProcessor) insertAxleRecord(ctx context.Context, meta *AxleMetadata, dateFolder, xmlObj, imgObj string) error {
	// 4) Insert data AXLE ke database.
	var capturedAt sql.NullTime
	if meta.FrameTime != "" {
		if t, err := parseFrameTime(meta.FrameTime); err == nil {
			capturedAt.Valid = true
			capturedAt.Time = t
		}
	}

	query := `
      INSERT INTO public.transact_axle_capture
      (site_id, external_id, plate_no, captured_at, camera_id,
       length_mm, total_wheels, total_axles, vehicle_category, vehicle_body_type,
       minio_bucket, minio_date_folder, minio_xml_object, minio_image_object)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (external_id) DO UPDATE SET
       site_id = EXCLUDED.site_id,
       plate_no = EXCLUDED.plate_no,
       captured_at = EXCLUDED.captured_at,
       camera_id = EXCLUDED.camera_id,
       length_mm = EXCLUDED.length_mm,
       total_wheels = EXCLUDED.total_wheels,
       total_axles = EXCLUDED.total_axles,
       vehicle_category = EXCLUDED.vehicle_category,
       vehicle_body_type = EXCLUDED.vehicle_body_type,
       minio_bucket = EXCLUDED.minio_bucket,
       minio_date_folder = EXCLUDED.minio_date_folder,
       minio_xml_object = EXCLUDED.minio_xml_object,
       minio_image_object = EXCLUDED.minio_image_object,
       updated_date = now();
      `

	_, err := p.DB.ExecContext(
		ctx,
		query,
		p.SiteUUID, // Site UUID from master_site.id
		meta.ID,
		meta.Plate,
		capturedAt,
		meta.CameraID,
		meta.Length,
		meta.NWheels,
		meta.NAxles,
		meta.Category,
		meta.BodyType,
		p.Bucket,
		dateFolder,
		xmlObj,
		imgObj,
	)
	if err != nil {
		return fmt.Errorf("exec insert: %w", err)
	}
	return nil
}
