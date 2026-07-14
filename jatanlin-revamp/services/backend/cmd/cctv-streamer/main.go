package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	onvif "github.com/0x524a/onvif-go"
	gortsplib "github.com/bluenviron/gortsplib/v4"
	"github.com/bluenviron/gortsplib/v4/pkg/base"
	"github.com/bluenviron/gortsplib/v4/pkg/description"
	"github.com/bluenviron/gortsplib/v4/pkg/format"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/nats-io/nats.go"
	"github.com/pion/rtp"

	"wim-service/internal/config"
	"wim-service/internal/session"
)

type rtspState struct {
	mu  sync.RWMutex
	url string
}

func (s *rtspState) Set(url string) {
	s.mu.Lock()
	s.url = strings.TrimSpace(url)
	s.mu.Unlock()
}

func (s *rtspState) Get() string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.url
}

type cctvService struct {
	db           *sql.DB
	minioClient  *minio.Client
	bucket       string
	siteUUID     string
	uploadPrefix string
	queue        *CCTVInsertQueue
	sessionMu    sync.Mutex
	recording    bool
}

const (
	cctvStreamName  = "CCTV_INSERT"
	cctvSubjectName = "cctv.insert"
	cctvConsumer    = "cctv-insert-worker"
)

type cctvInsertPayload struct {
	Filename  string `json:"filename"`
	Filepath  string `json:"filepath"`
	SiteID    string `json:"site_id,omitempty"`
	SessionID string `json:"session_id,omitempty"`
}

type CCTVInsertQueue struct {
	js       nats.JetStreamContext
	nc       *nats.Conn
	db       *sql.DB
	siteUUID string
}

func main() {
	log.Println("========================================")
	log.Println("  WIM CCTV STREAMER")
	log.Println("========================================")

	if err := godotenv.Load(); err != nil {
		log.Println("[CCTV] .env not found, using system environment")
	} else {
		log.Println("[CCTV] .env loaded")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatal("[CCTV] Failed to load config:", err)
	}
	defer cfg.DB.Close()

	service, err := newCCTVService(cfg)
	if err != nil {
		log.Fatal("[CCTV] Failed to init service:", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sessionService := session.NewSessionService(cfg.DB, cfg.SiteUUID, cfg.SessionWindowSeconds)
	var rtsp rtspState
	rtsp.Set("")

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, signalSet()...)
	go func() {
		for sig := range sigChan {
			if isManualRecordSignal(sig) {
				// Trigger recording on demand (unix: kill -USR1 <pid>)
				go func() {
					if _, err := service.recordUploadInsert(ctx, rtsp.Get(), 0, "", ""); err != nil {
						log.Printf("[CCTV] Record failed: %v", err)
					}
				}()
				continue
			}

			log.Println("")
			log.Println("[CCTV] Shutting down...")
			cancel()
			return
		}
	}()

	if getEnvBool("RECORD_ON_START", false) {
		go func() {
			if _, err := service.recordUploadInsert(ctx, rtsp.Get(), 0, "", ""); err != nil {
				log.Printf("[CCTV] Record failed: %v", err)
			}
		}()
	}

	if getEnvBool("CCTV_HTTP_ENABLED", true) {
		go func() {
			if err := startHTTPServer(ctx, rtsp.Get, service); err != nil && !errors.Is(err, http.ErrServerClosed) {
				log.Printf("[CCTV] HTTP server error: %v", err)
				cancel()
			}
		}()
	}

	go func() {
		interval := time.Duration(getEnvInt("CCTV_DUMMY_INTERVAL_SEC", 5)) * time.Second
		if interval <= 0 {
			interval = 5 * time.Second
		}
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		if err := service.processDummySession(ctx, sessionService); err != nil {
			log.Printf("[CCTV] Initial dummy session processing failed: %v", err)
		}

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if err := service.processDummySession(ctx, sessionService); err != nil {
					log.Printf("[CCTV] Dummy session processing failed: %v", err)
				}
			}
		}
	}()

	go func() {
		interval := time.Duration(getEnvInt("CCTV_SESSION_INTERVAL_SEC", 5)) * time.Second
		if interval <= 0 {
			interval = 5 * time.Second
		}
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		if err := service.processLiveSession(ctx, sessionService, rtsp.Get()); err != nil {
			log.Printf("[CCTV] Initial live session processing failed: %v", err)
		}

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if err := service.processLiveSession(ctx, sessionService, rtsp.Get()); err != nil {
					log.Printf("[CCTV] Live session processing failed: %v", err)
				}
			}
		}
	}()

	go maintainRTSPConnection(ctx, &rtsp)
	<-ctx.Done()

	log.Println("[CCTV] Shutdown complete. Goodbye!")
}

func maintainRTSPConnection(ctx context.Context, state *rtspState) {
	retryDelay := time.Duration(getEnvInt("CCTV_RTSP_RETRY_SEC", 5)) * time.Second
	if retryDelay <= 0 {
		retryDelay = 5 * time.Second
	}

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		resolvedURL, err := resolveRTSPURL(ctx)
		if err != nil {
			state.Set("")
			log.Printf("[CCTV] RTSP resolve failed, will retry in %v: %v", retryDelay, err)
			select {
			case <-ctx.Done():
				return
			case <-time.After(retryDelay):
			}
			continue
		}

		state.Set(resolvedURL)
		log.Printf("[CCTV] Stream URL ready: %s", redactRTSP(resolvedURL))

		if err := runRTSP(ctx, resolvedURL); err != nil && !errors.Is(err, context.Canceled) {
			state.Set("")
			log.Printf("[CCTV] Stream disconnected, retry in %v: %v", retryDelay, err)
			select {
			case <-ctx.Done():
				return
			case <-time.After(retryDelay):
			}
			continue
		}
		return
	}
}

func resolveRTSPURL(ctx context.Context) (string, error) {
	mode := strings.ToLower(getEnv("CCTV_MODE", "rtsp"))
	switch mode {
	case "rtsp":
		url := getEnv("RTSP_URL", getEnv("CCTV_RTSP_URL", ""))
		if url == "" {
			return "", errors.New("RTSP_URL (or CCTV_RTSP_URL) is required for mode=rtsp")
		}
		return url, nil
	case "onvif":
		endpoint := getEnv("ONVIF_ENDPOINT", "")
		if endpoint == "" {
			return "", errors.New("ONVIF_ENDPOINT is required for mode=onvif")
		}
		username := getEnv("ONVIF_USERNAME", "")
		password := getEnv("ONVIF_PASSWORD", "")
		timeout := time.Duration(getEnvInt("ONVIF_TIMEOUT_SECONDS", 15)) * time.Second

		client, err := onvif.NewClient(
			endpoint,
			onvif.WithCredentials(username, password),
			onvif.WithTimeout(timeout),
		)
		if err != nil {
			return "", err
		}

		profiles, err := client.GetProfiles(ctx)
		if err != nil {
			return "", err
		}
		if len(profiles) == 0 {
			return "", errors.New("no ONVIF profiles found")
		}

		profileToken := getEnv("ONVIF_PROFILE_TOKEN", "")
		if profileToken == "" {
			profileToken = profiles[0].Token
		}

		streamURI, err := client.GetStreamURI(ctx, profileToken)
		if err != nil {
			return "", err
		}
		if streamURI == nil || streamURI.URI == "" {
			return "", errors.New("ONVIF GetStreamURI returned empty URI")
		}
		return streamURI.URI, nil
	default:
		return "", errors.New("CCTV_MODE must be 'rtsp' or 'onvif'")
	}
}

func runRTSP(ctx context.Context, rtspURL string) error {
	parsed, err := base.ParseURL(rtspURL)
	if err != nil {
		return err
	}

	c := &gortsplib.Client{}
	defer c.Close()

	if err := c.Start(parsed.Scheme, parsed.Host); err != nil {
		return err
	}

	desc, _, err := c.Describe(parsed)
	if err != nil {
		return err
	}

	if err := c.SetupAll(desc.BaseURL, desc.Medias); err != nil {
		return err
	}

	var packetCount uint64
	var byteCount uint64

	c.OnPacketRTPAny(func(medi *description.Media, forma format.Format, pkt *rtp.Packet) {
		atomic.AddUint64(&packetCount, 1)
		atomic.AddUint64(&byteCount, uint64(len(pkt.Payload)))
	})

	if _, err := c.Play(nil); err != nil {
		return err
	}

	log.Println("[CCTV] Streaming... Press Ctrl+C to stop.")

	errCh := make(chan error, 1)
	go func() {
		errCh <- c.Wait()
	}()

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	var lastPackets uint64
	var lastBytes uint64

	for {
		select {
		case <-ctx.Done():
			c.Close()
			return context.Canceled
		case err := <-errCh:
			return err
		case <-ticker.C:
			p := atomic.LoadUint64(&packetCount)
			b := atomic.LoadUint64(&byteCount)
			log.Printf("[CCTV] Packets: %d (+%d), Bytes: %d (+%d)",
				p, p-lastPackets, b, b-lastBytes)
			lastPackets = p
			lastBytes = b
		}
	}
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
		switch strings.ToLower(v) {
		case "1", "true", "yes", "y":
			return true
		case "0", "false", "no", "n":
			return false
		}
	}
	return def
}

func startHTTPServer(ctx context.Context, getRTSPURL func() string, service *cctvService) error {
	port := getEnv("CCTV_HTTP_PORT", "8090")
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok","service":"cctv-streamer"}`))
	})

	mux.HandleFunc("/record", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		seconds := 0
		if v := r.URL.Query().Get("seconds"); v != "" {
			n, err := strconv.Atoi(v)
			if err != nil || n <= 0 {
				http.Error(w, "invalid seconds", http.StatusBadRequest)
				return
			}
			seconds = n
		}

		sessionID := r.URL.Query().Get("session_id")
		siteID := r.URL.Query().Get("site_id")
		dummy := parseBoolParam(r.URL.Query().Get("dummy"), false)

		w.Header().Set("Content-Type", "application/json")

		// Run recording asynchronously to avoid client timeouts.
		go func(seconds int, sessionID, siteID string, dummy bool) {
			timeout := time.Duration(seconds+30) * time.Second
			if timeout <= 0 {
				timeout = 50 * time.Second
			}
			bgCtx, cancel := context.WithTimeout(context.Background(), timeout)
			defer cancel()

			var result *recordResult
			var err error
			if dummy {
				filename := getEnv("CCTV_TRIGGER_FILENAME", "e41ee755-20d4-4d51-885a-f3d4e8a6cf13-20260127_194341.mp4")
				filePath := getEnv("CCTV_TRIGGER_FILEPATH", "attachment/e41ee755-20d4-4d51-885a-f3d4e8a6cf13-20260127_194341.mp4")
				if filename == "" && filePath != "" {
					filename = filepath.Base(filePath)
				}
				result, err = service.insertDummyRecord(bgCtx, filename, filePath, sessionID, siteID)
			} else {
				rtspURL := getRTSPURL()
				result, err = service.recordUploadInsert(bgCtx, rtspURL, seconds, sessionID, siteID)
			}
			if err != nil {
				log.Printf("[CCTV] async record failed: %v", err)
				return
			}
			log.Printf("[CCTV] async record success: id=%s file=%s", result.ID, result.FileName)
		}(seconds, sessionID, siteID, dummy)

		w.WriteHeader(http.StatusAccepted)
		_ = json.NewEncoder(w).Encode(recordResponse{
			Status:    "accepted",
			SessionID: sessionID,
			SiteID:    siteID,
		})
	})

	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	go func() {
		<-ctx.Done()
		_ = server.Close()
	}()

	log.Printf("[CCTV] HTTP server listening on :%s", port)
	return server.ListenAndServe()
}

func parseBoolParam(raw string, def bool) bool {
	if raw == "" {
		return def
	}
	switch strings.ToLower(raw) {
	case "1", "true", "yes", "y":
		return true
	case "0", "false", "no", "n":
		return false
	default:
		return def
	}
}

func redactRTSP(raw string) string {
	u, err := url.Parse(raw)
	if err != nil || u.User == nil {
		return raw
	}
	username := u.User.Username()
	u.User = url.UserPassword(username, "****")
	return u.String()
}

// recordFromRTSP records a short clip using ffmpeg.
// Trigger with: kill -USR1 <pid> (duration default 20s)
func recordFromRTSP(ctx context.Context, rtspURL string, secondsOverride int) (string, error) {
	seconds := getEnvInt("RECORD_SECONDS", 20)
	if secondsOverride > 0 {
		seconds = secondsOverride
	}
	outDir := getEnv("RECORD_DIR", "./recordings")
	filename := time.Now().Format("20060102_150405") + ".mp4"
	outPath := filepath.Join(outDir, filename)

	if err := os.MkdirAll(outDir, 0o755); err != nil {
		return "", err
	}

	// Example: ffmpeg -y -rtsp_transport tcp -i <url> -t 20 -c copy <out>
	args := []string{
		"-y",
		"-rtsp_transport", "tcp",
		"-i", rtspURL,
		"-t", strconv.Itoa(seconds),
		"-c", "copy",
		outPath,
	}

	log.Printf("[CCTV] Recording %ds to %s", seconds, outPath)

	cmd := exec.CommandContext(ctx, "ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return "", err
	}
	return outPath, nil
}

type recordResult struct {
	ID        uuid.UUID
	FilePath  string
	FileName  string
	SessionID string
	SiteID    string
}

type recordResponse struct {
	Status    string `json:"status"`
	Message   string `json:"message,omitempty"`
	ID        string `json:"id,omitempty"`
	FilePath  string `json:"file_path,omitempty"`
	FileName  string `json:"filename,omitempty"`
	SessionID string `json:"session_id,omitempty"`
	SiteID    string `json:"site_id,omitempty"`
}

func newCCTVService(cfg *config.Config) (*cctvService, error) {
	mc, err := minio.New(cfg.AttachmentMinIOEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AttachmentMinIOAccess, cfg.AttachmentMinIOSecret, ""),
		Secure: cfg.AttachmentMinIOUseSSL,
	})
	if err != nil {
		return nil, err
	}

	q, err := NewCCTVInsertQueue(cfg.NATSURL, cfg.DB, cfg.SiteUUID)
	if err != nil {
		return nil, err
	}

	return &cctvService{
		db:           cfg.DB,
		minioClient:  mc,
		bucket:       cfg.AttachmentMinIOBucket,
		siteUUID:     cfg.SiteUUID,
		uploadPrefix: getEnv("CCTV_UPLOAD_PREFIX", "cctv"),
		queue:        q,
	}, nil
}

func NewCCTVInsertQueue(natsURL string, db *sql.DB, siteUUID string) (*CCTVInsertQueue, error) {
	nc, err := nats.Connect(natsURL)
	if err != nil {
		return nil, err
	}
	js, err := nc.JetStream()
	if err != nil {
		return nil, err
	}

	_, err = js.StreamInfo(cctvStreamName)
	if err == nats.ErrStreamNotFound {
		_, err = js.AddStream(&nats.StreamConfig{
			Name:     cctvStreamName,
			Subjects: []string{cctvSubjectName},
			Storage:  nats.FileStorage,
		})
	}
	if err != nil {
		return nil, err
	}

	q := &CCTVInsertQueue{
		js:       js,
		nc:       nc,
		db:       db,
		siteUUID: siteUUID,
	}
	go q.consumeLoop()
	return q, nil
}

func (q *CCTVInsertQueue) Enqueue(filename, filepath string, siteID uuid.UUID, sessionID *uuid.UUID) error {
	payload := cctvInsertPayload{
		Filename: filename,
		Filepath: filepath,
		SiteID:   siteID.String(),
	}
	if sessionID != nil {
		payload.SessionID = sessionID.String()
	}

	b, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	msg := nats.NewMsg(cctvSubjectName)
	msg.Data = b
	if filepath != "" {
		msg.Header.Set(nats.MsgIdHdr, filepath)
	} else if filename != "" {
		msg.Header.Set(nats.MsgIdHdr, filename)
	}

	_, err = q.js.PublishMsg(msg)
	return err
}

func (q *CCTVInsertQueue) consumeLoop() {
	sub, err := q.js.PullSubscribe(cctvSubjectName, cctvConsumer, nats.ManualAck())
	if err != nil {
		return
	}

	for {
		msgs, err := sub.Fetch(1, nats.MaxWait(2*time.Second))
		if err != nil {
			if err == nats.ErrTimeout {
				continue
			}
			time.Sleep(2 * time.Second)
			continue
		}

		for _, msg := range msgs {
			if err := q.handleMsg(msg); err != nil {
				_ = msg.Nak()
				continue
			}
			_ = msg.Ack()
		}
	}
}

func (q *CCTVInsertQueue) handleMsg(msg *nats.Msg) error {
	var p cctvInsertPayload
	if err := json.Unmarshal(msg.Data, &p); err != nil {
		return err
	}

	siteID := q.siteUUID
	if p.SiteID != "" {
		siteID = p.SiteID
	}

	var sessionID *uuid.UUID
	if p.SessionID != "" {
		parsed, err := uuid.Parse(p.SessionID)
		if err != nil {
			return err
		}
		sessionID = &parsed
	}

	siteUUID, err := uuid.Parse(siteID)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := insertCCTVRecord(ctx, q.db, p.Filename, p.Filepath, siteUUID, sessionID); err != nil {
		return err
	}
	log.Printf("[CCTV_QUEUE] Insert success: filename=%s session_id=%s", p.Filename, p.SessionID)
	return nil
}

func insertCCTVRecord(ctx context.Context, db *sql.DB, filename, filepath string, siteID uuid.UUID, sessionID *uuid.UUID) error {
	if sessionID != nil && *sessionID != uuid.Nil {
		return insertOrUpdateCCTVRecordBySession(ctx, db, filename, filepath, siteID, *sessionID)
	}

	query := `
		INSERT INTO public.transact_cctv (filename, filepath, site_id, session_id)
		VALUES ($1,$2,$3,$4)
		RETURNING id
	`

	var id uuid.UUID
	err := db.QueryRowContext(ctx, query, filename, filepath, siteID, sessionID).Scan(&id)
	if err != nil {
		return fmt.Errorf("exec insert cctv: %w", err)
	}
	return nil
}

func insertOrUpdateCCTVRecordBySession(ctx context.Context, db *sql.DB, filename, filepath string, siteID, sessionID uuid.UUID) error {
	const selectSQL = `
		SELECT id
		FROM public.transact_cctv
		WHERE session_id = $1
		ORDER BY created_date ASC
		LIMIT 1
	`

	var existingID uuid.UUID
	err := db.QueryRowContext(ctx, selectSQL, sessionID).Scan(&existingID)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("query cctv by session: %w", err)
	}

	if err == sql.ErrNoRows {
		const insertSQL = `
			INSERT INTO public.transact_cctv (filename, filepath, site_id, session_id)
			VALUES ($1,$2,$3,$4)
		`
		if _, execErr := db.ExecContext(ctx, insertSQL, nullableString(filename), nullableString(filepath), siteID, sessionID); execErr != nil {
			return fmt.Errorf("insert cctv by session: %w", execErr)
		}
		return nil
	}

	const updateSQL = `
		UPDATE public.transact_cctv
		SET filename = COALESCE(NULLIF($2, ''), filename),
		    filepath = COALESCE(NULLIF($3, ''), filepath),
		    site_id = $4,
		    session_id = $5,
		    updated_date = now()
		WHERE id = $1
	`

	if _, execErr := db.ExecContext(ctx, updateSQL, existingID, filename, filepath, siteID, sessionID); execErr != nil {
		return fmt.Errorf("update cctv by session: %w", execErr)
	}
	return nil
}

func (s *cctvService) processDummySession(ctx context.Context, sessionService *session.SessionService) error {
	if sessionService == nil {
		return fmt.Errorf("session service not configured")
	}

	session, err := sessionService.GetActiveSession()
	if err != nil {
		return fmt.Errorf("active session check failed: %w", err)
	}
	if session == nil {
		log.Println("[CCTV_DUMMY] No active IN_PROGRESS session found")
		return nil
	}
	if !session.IsDummy {
		return nil
	}

	filename := fmt.Sprintf("dummy-cctv-%s.mp4", session.ID.String())
	filepath := fmt.Sprintf("dummy-cctv/%s.mp4", session.ID.String())

	sampleFilename, sampleFilepath, err := s.getRandomDummyCCTVSample(ctx, session.SiteID)
	if err != nil {
		return fmt.Errorf("pick random CCTV sample failed: %w", err)
	}
	if strings.TrimSpace(sampleFilepath) != "" {
		filepath = strings.TrimSpace(sampleFilepath)
		if strings.TrimSpace(sampleFilename) != "" {
			filename = strings.TrimSpace(sampleFilename)
		} else {
			filename = path.Base(filepath)
		}
	}

	if _, err := s.insertDummyRecord(ctx, filename, filepath, session.ID.String(), session.SiteID.String()); err != nil {
		return fmt.Errorf("insert dummy cctv failed: %w", err)
	}

	log.Printf("[CCTV_DUMMY] Ensured dummy CCTV for session=%s filename=%s", session.ID, filename)
	return nil
}

func (s *cctvService) getRandomDummyCCTVSample(ctx context.Context, siteID uuid.UUID) (string, string, error) {
	const query = `
		SELECT c.filename, c.filepath
		FROM public.transact_vehicle_actual va
		JOIN public.transact_cctv c ON c.id = va.transact_cctv_id
		WHERE va.site_id = $1
		  AND va.is_deleted = false
		  AND COALESCE(c.filepath, '') <> ''
		ORDER BY random()
		LIMIT 1
	`

	var filename sql.NullString
	var filepath sql.NullString
	err := s.db.QueryRowContext(ctx, query, siteID).Scan(&filename, &filepath)
	if err == sql.ErrNoRows {
		return "", "", nil
	}
	if err != nil {
		return "", "", err
	}

	return filename.String, filepath.String, nil
}

func (s *cctvService) processLiveSession(ctx context.Context, sessionService *session.SessionService, rtspURL string) error {
	if sessionService == nil {
		return fmt.Errorf("session service not configured")
	}
	if strings.TrimSpace(rtspURL) == "" {
		return nil
	}

	session, err := sessionService.GetActiveSession()
	if err != nil {
		return fmt.Errorf("active session check failed: %w", err)
	}
	if session == nil {
		return nil
	}
	if session.IsDummy {
		return nil
	}

	exists, err := s.sessionRecordExists(ctx, session.ID)
	if err != nil {
		return fmt.Errorf("check cctv session row failed: %w", err)
	}
	if exists {
		return nil
	}

	if !s.beginSessionRecording() {
		return nil
	}

	go func(sessionID, siteID string) {
		defer s.finishSessionRecording()

		seconds := getEnvInt("CCTV_SESSION_RECORD_SECONDS", getEnvInt("RECORD_SECONDS", 20))
		timeout := time.Duration(seconds+30) * time.Second
		if timeout <= 0 {
			timeout = 50 * time.Second
		}

		recordCtx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()

		result, err := s.recordUploadInsert(recordCtx, rtspURL, seconds, sessionID, siteID)
		if err != nil {
			log.Printf("[CCTV] session record failed: session=%s err=%v", sessionID, err)
			return
		}

		log.Printf("[CCTV] session record success: session=%s file=%s", sessionID, result.FileName)
	}(session.ID.String(), session.SiteID.String())

	return nil
}

func (s *cctvService) beginSessionRecording() bool {
	s.sessionMu.Lock()
	defer s.sessionMu.Unlock()
	if s.recording {
		return false
	}
	s.recording = true
	return true
}

func (s *cctvService) finishSessionRecording() {
	s.sessionMu.Lock()
	s.recording = false
	s.sessionMu.Unlock()
}

func (s *cctvService) sessionRecordExists(ctx context.Context, sessionID uuid.UUID) (bool, error) {
	const sqlText = `
		SELECT EXISTS (
			SELECT 1
			FROM public.transact_cctv
			WHERE session_id = $1
		)
	`

	var exists bool
	if err := s.db.QueryRowContext(ctx, sqlText, sessionID).Scan(&exists); err != nil {
		return false, err
	}
	return exists, nil
}

func nullableString(value string) any {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return trimmed
}

func (s *cctvService) recordUploadInsert(ctx context.Context, rtspURL string, seconds int, sessionIDRaw, siteIDRaw string) (*recordResult, error) {
	outPath, err := recordFromRTSP(ctx, rtspURL, seconds)
	if err != nil {
		return nil, err
	}

	_, filePath, err := s.uploadRecording(ctx, outPath)
	if err != nil {
		return nil, err
	}

	fileName := filepath.Base(outPath)

	siteID, sessionID, err := s.resolveIDs(siteIDRaw, sessionIDRaw)
	if err != nil {
		return nil, err
	}

	if err := s.queue.Enqueue(fileName, filePath, siteID, sessionID); err != nil {
		return nil, err
	}

	return &recordResult{
		ID:        uuid.Nil,
		FilePath:  filePath,
		FileName:  fileName,
		SessionID: sessionIDRaw,
		SiteID:    siteID.String(),
	}, nil
}

func (s *cctvService) insertDummyRecord(ctx context.Context, filename, filepath string, sessionIDRaw, siteIDRaw string) (*recordResult, error) {
	siteID, sessionID, err := s.resolveIDs(siteIDRaw, sessionIDRaw)
	if err != nil {
		return nil, err
	}

	if err := s.queue.Enqueue(filename, filepath, siteID, sessionID); err != nil {
		return nil, err
	}

	return &recordResult{
		ID:        uuid.Nil,
		FilePath:  filepath,
		FileName:  filename,
		SessionID: sessionIDRaw,
		SiteID:    siteID.String(),
	}, nil
}

func (s *cctvService) resolveIDs(siteIDRaw, sessionIDRaw string) (uuid.UUID, *uuid.UUID, error) {
	var (
		siteID    uuid.UUID
		sessionID *uuid.UUID
	)

	if siteIDRaw != "" {
		parsed, err := uuid.Parse(siteIDRaw)
		if err != nil {
			return uuid.Nil, nil, fmt.Errorf("invalid site_id")
		}
		siteID = parsed
	} else {
		if s.siteUUID == "" {
			return uuid.Nil, nil, fmt.Errorf("site_id is required")
		}
		parsed, err := uuid.Parse(s.siteUUID)
		if err != nil {
			return uuid.Nil, nil, fmt.Errorf("invalid site_id in config")
		}
		siteID = parsed
	}

	if sessionIDRaw != "" {
		parsed, err := uuid.Parse(sessionIDRaw)
		if err != nil {
			return uuid.Nil, nil, fmt.Errorf("invalid session_id")
		}
		sessionID = &parsed
	}

	return siteID, sessionID, nil
}

func (s *cctvService) uploadRecording(ctx context.Context, path string) (string, string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", "", err
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		return "", "", err
	}

	ext := strings.ToLower(filepath.Ext(path))
	contentType := "application/octet-stream"
	switch ext {
	case ".mp4":
		contentType = "video/mp4"
	case ".mkv":
		contentType = "video/x-matroska"
	case ".ts":
		contentType = "video/mp2t"
	}

	baseName := filepath.Base(path)
	objectName := fmt.Sprintf("%s/%s-%s", s.uploadPrefix, uuid.New().String(), baseName)

	_, err = s.minioClient.PutObject(ctx, s.bucket, objectName, file, info.Size(), minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", "", err
	}

	return objectName, fmt.Sprintf("%s/%s", s.bucket, objectName), nil
}

func (s *cctvService) insertRecord(ctx context.Context, filename, filepath string, siteID uuid.UUID, sessionID *uuid.UUID) (uuid.UUID, error) {
	query := `
		INSERT INTO public.transact_cctv (filename, filepath, site_id, session_id)
		VALUES ($1,$2,$3,$4)
		RETURNING id
	`

	var id uuid.UUID
	err := s.db.QueryRowContext(ctx, query, filename, filepath, siteID, sessionID).Scan(&id)
	if err != nil {
		return uuid.Nil, err
	}
	return id, nil
}
