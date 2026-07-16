package main

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"wim-service/internal/config"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type syncConfig struct {
	Enabled                  bool
	APIBaseURL               string
	SyncKey                  string
	Interval                 time.Duration
	BatchSize                int
	CursorFile               string
	HTTPTimeout              time.Duration
	Once                     bool
	AttachmentSyncEnabled    bool
	DataCenterMinIOEndpoint  string
	DataCenterMinIOAccessKey string
	DataCenterMinIOSecretKey string
	DataCenterMinIOBucket    string
	DataCenterMinIOUseSSL    bool
	MirrorTables             []mirrorTable
}

type mirrorTable struct {
	Name       string
	CursorExpr string
}

type cursorState struct {
	Tables map[string]string `json:"tables"`
}

type batchResult struct {
	RecordsSuccess int64  `json:"records_success"`
	RecordsFailed  int64  `json:"records_failed"`
	Status         string `json:"status"`
}

type minioSourceConfig struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Bucket    string
	UseSSL    bool
}

type attachmentCandidate struct {
	SourceTable     string
	SourceID        string
	AttachmentType  string
	SourceBucket    string
	SourceObjectKey string
	MimeType        string
	SourceCreatedAt *time.Time
	SourceUpdatedAt *time.Time
	CursorAt        time.Time
	RawPayload      json.RawMessage
}

type attachmentCompleteRecord struct {
	SiteAttachmentID  string          `json:"site_attachment_id"`
	SiteTransactionID string          `json:"site_transaction_id"`
	AttachmentType    string          `json:"attachment_type"`
	ObjectKey         string          `json:"object_key"`
	FileName          string          `json:"file_name"`
	MimeType          string          `json:"mime_type"`
	FileSize          *int64          `json:"file_size"`
	Checksum          string          `json:"checksum"`
	UploadStatus      string          `json:"upload_status"`
	SourceCreatedAt   *time.Time      `json:"source_created_at"`
	SourceUpdatedAt   *time.Time      `json:"source_updated_at"`
	RawPayload        json.RawMessage `json:"raw_payload"`
	IsDeleted         bool            `json:"is_deleted"`
}

type syncAgent struct {
	db              *sql.DB
	httpClient      *http.Client
	siteID          string
	siteCode        string
	siteName        string
	siteRegion      string
	cfg             syncConfig
	state           cursorState
	sourceMinIO     map[string]*minio.Client
	dataCenterMinIO *minio.Client
}

func main() {
	log.Println("========================================")
	log.Println("  JATANLIN DATA CENTER SYNC AGENT")
	log.Println("========================================")

	cfg, err := config.Load()
	if err != nil {
		log.Fatal("[SYNC] Failed to load config:", err)
	}
	defer cfg.DB.Close()

	syncCfg := loadSyncConfig()
	if !syncCfg.Enabled {
		log.Println("[SYNC] Disabled. Set DATA_CENTER_SYNC_ENABLED=true to enable.")
		return
	}
	if syncCfg.APIBaseURL == "" || syncCfg.SyncKey == "" {
		log.Fatal("[SYNC] DATA_CENTER_API_URL and DATA_CENTER_SYNC_KEY are required")
	}

	agent := &syncAgent{
		db:         cfg.DB,
		siteID:     cfg.SiteUUID,
		siteCode:   cfg.SiteCode,
		siteName:   cfg.SiteName,
		siteRegion: cfg.SiteRegion,
		cfg:        syncCfg,
		httpClient: &http.Client{
			Timeout: syncCfg.HTTPTimeout,
		},
	}
	if err := agent.loadCursorState(); err != nil {
		log.Fatal("[SYNC] Failed to load cursor state:", err)
	}
	if syncCfg.AttachmentSyncEnabled {
		if err := agent.configureMinIO(cfg); err != nil {
			log.Fatal("[SYNC] Failed to configure MinIO sync:", err)
		}
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigChan
		log.Println("[SYNC] Shutdown requested")
		cancel()
	}()

	log.Printf("[SYNC] Site: %s (%s)", agent.siteCode, agent.siteID)
	log.Printf("[SYNC] Data Center: %s", syncCfg.APIBaseURL)
	log.Printf("[SYNC] Interval: %s, Batch Size: %d", syncCfg.Interval, syncCfg.BatchSize)
	log.Printf("[SYNC] Attachment Sync: %t", syncCfg.AttachmentSyncEnabled)

	agent.runOnce(ctx)
	if syncCfg.Once {
		log.Println("[SYNC] One-shot mode complete")
		return
	}
	ticker := time.NewTicker(syncCfg.Interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("[SYNC] Stopped")
			return
		case <-ticker.C:
			agent.runOnce(ctx)
		}
	}
}

func loadSyncConfig() syncConfig {
	return syncConfig{
		Enabled:                  envBool("DATA_CENTER_SYNC_ENABLED", false),
		APIBaseURL:               strings.TrimRight(env("DATA_CENTER_API_URL", "http://localhost:28001"), "/"),
		SyncKey:                  env("DATA_CENTER_SYNC_KEY", "jatanlin-site-sync-key-2026"),
		Interval:                 time.Duration(envInt("DATA_CENTER_SYNC_INTERVAL_SEC", 30)) * time.Second,
		BatchSize:                envInt("DATA_CENTER_SYNC_BATCH_SIZE", 100),
		CursorFile:               env("DATA_CENTER_SYNC_CURSOR_FILE", "./data/sync-agent-cursors.json"),
		HTTPTimeout:              time.Duration(envInt("DATA_CENTER_SYNC_HTTP_TIMEOUT_SEC", 20)) * time.Second,
		Once:                     envBool("DATA_CENTER_SYNC_ONCE", false),
		AttachmentSyncEnabled:    envBool("DATA_CENTER_ATTACHMENT_SYNC_ENABLED", true),
		DataCenterMinIOEndpoint:  env("DATA_CENTER_MINIO_ENDPOINT", "localhost:29000"),
		DataCenterMinIOAccessKey: env("DATA_CENTER_MINIO_ACCESS_KEY", "jatanlin_dc_minio"),
		DataCenterMinIOSecretKey: env("DATA_CENTER_MINIO_SECRET_KEY", "jatanlin_dc_minio_password"),
		DataCenterMinIOBucket:    env("DATA_CENTER_MINIO_BUCKET", "jatanlin-data-center-attachments"),
		DataCenterMinIOUseSSL:    envBool("DATA_CENTER_MINIO_USE_SSL", false),
		MirrorTables: []mirrorTable{
			{Name: "transact_wim_session", CursorExpr: "COALESCE(updated_date, created_date, started_at, now())"},
			{Name: "transact_anpr_capture", CursorExpr: "COALESCE(updated_date, created_date, captured_at, now())"},
			{Name: "transact_axle_capture", CursorExpr: "COALESCE(updated_date, created_date, captured_at, now())"},
			{Name: "transact_cctv", CursorExpr: "COALESCE(updated_date, created_date, now())"},
			{Name: "transact_dimension", CursorExpr: "COALESCE(updated_date, created_date, now())"},
			{Name: "transact_weighing", CursorExpr: "COALESCE(updated_date, created_date, now())"},
			{Name: "transact_vehicle_actual", CursorExpr: "COALESCE(updated_date, created_date, now())"},
			{Name: "transact_vehicle_status", CursorExpr: "COALESCE(updated_date, created_date, now())"},
		},
	}
}

func (a *syncAgent) runOnce(ctx context.Context) {
	if err := a.sendHeartbeat(ctx); err != nil {
		log.Printf("[SYNC] Heartbeat failed: %v", err)
		return
	}

	for _, table := range a.cfg.MirrorTables {
		for {
			hasMore, err := a.syncTableBatch(ctx, table)
			if err != nil {
				log.Printf("[SYNC] Table %s failed: %v", table.Name, err)
				return
			}
			if !hasMore {
				break
			}
		}
	}

	if a.cfg.AttachmentSyncEnabled {
		for {
			hasMore, err := a.syncAttachmentBatch(ctx)
			if err != nil {
				log.Printf("[SYNC] Attachment sync failed: %v", err)
				return
			}
			if !hasMore {
				break
			}
		}
	}
}

func (a *syncAgent) sendHeartbeat(ctx context.Context) error {
	payload := map[string]any{
		"site_code":            a.siteCode,
		"site_name":            a.siteName,
		"city":                 a.siteRegion,
		"province":             a.siteRegion,
		"operational_status":   "online",
		"active_operator_name": "",
		"last_seen_at":         time.Now().Format(time.RFC3339),
		"app_version":          "jatanlin-revamp",
		"service_version":      "sync-agent-0.1.0",
	}

	var site struct {
		SiteAddress        sql.NullString
		City               sql.NullString
		Province           sql.NullString
		ActiveOperatorName sql.NullString
	}
	err := a.db.QueryRowContext(ctx, `
		SELECT
			COALESCE(site_address, ''),
			COALESCE(site_city, ''),
			COALESCE(site_province, ''),
			COALESCE(active_operator_name, '')
		FROM public.master_site
		WHERE id = $1
		LIMIT 1
	`, a.siteID).Scan(&site.SiteAddress, &site.City, &site.Province, &site.ActiveOperatorName)
	if err == nil {
		payload["site_address"] = site.SiteAddress.String
		payload["city"] = site.City.String
		payload["province"] = site.Province.String
		payload["active_operator_name"] = site.ActiveOperatorName.String
	}

	return a.postJSON(ctx, "/api/sync/heartbeat", payload, nil)
}

func (a *syncAgent) syncTableBatch(ctx context.Context, table mirrorTable) (bool, error) {
	cursorValue := a.cursor(table.Name)
	rowsJSON, maxCursor, count, err := a.fetchRows(ctx, table, cursorValue)
	if err != nil {
		return false, err
	}
	if count == 0 {
		return false, nil
	}

	payload := map[string]any{
		"site_code":              a.siteCode,
		"table_name":             table.Name,
		"last_source_updated_at": maxCursor,
		"records":                json.RawMessage(rowsJSON),
	}
	var result batchResult
	if err := a.postJSON(ctx, "/api/sync/mirror/batch", payload, &result); err != nil {
		return false, err
	}
	if result.RecordsFailed > 0 {
		return false, fmt.Errorf("data center accepted partial batch for %s: %d failed", table.Name, result.RecordsFailed)
	}

	a.state.Tables[table.Name] = maxCursor
	if err := a.saveCursorState(); err != nil {
		return false, err
	}

	log.Printf("[SYNC] %s synced %d record(s), cursor=%s", table.Name, count, maxCursor)
	return count >= a.cfg.BatchSize, nil
}

func (a *syncAgent) fetchRows(ctx context.Context, table mirrorTable, cursor string) (string, string, int, error) {
	query := fmt.Sprintf(`
		WITH selected AS (
			SELECT *
			FROM public.%s
			WHERE site_id = $1
			  AND %s > $2::timestamptz
			ORDER BY %s ASC, id ASC
			LIMIT $3
		)
		SELECT
			COALESCE(jsonb_agg(to_jsonb(selected)), '[]'::jsonb)::text,
			COALESCE(max(%s), $2::timestamptz),
			count(*)::int
		FROM selected
	`, table.Name, table.CursorExpr, table.CursorExpr, table.CursorExpr)

	var rowsJSON string
	var maxCursor time.Time
	var count int
	if err := a.db.QueryRowContext(ctx, query, a.siteID, cursor, a.cfg.BatchSize).Scan(&rowsJSON, &maxCursor, &count); err != nil {
		return "", "", 0, err
	}
	return rowsJSON, maxCursor.UTC().Format(time.RFC3339Nano), count, nil
}

func (a *syncAgent) configureMinIO(cfg *config.Config) error {
	a.sourceMinIO = map[string]*minio.Client{}

	sources := []minioSourceConfig{
		{
			Endpoint:  cfg.ANPRMinIOEndpoint,
			AccessKey: cfg.ANPRMinIOAccess,
			SecretKey: cfg.ANPRMinIOSecret,
			Bucket:    cfg.ANPRMinIOBucket,
			UseSSL:    cfg.ANPRMinIOUseSSL,
		},
		{
			Endpoint:  cfg.AxleMinIOEndpoint,
			AccessKey: cfg.AxleMinIOAccess,
			SecretKey: cfg.AxleMinIOSecret,
			Bucket:    cfg.AxleMinIOBucket,
			UseSSL:    cfg.AxleMinIOUseSSL,
		},
		{
			Endpoint:  cfg.AttachmentMinIOEndpoint,
			AccessKey: cfg.AttachmentMinIOAccess,
			SecretKey: cfg.AttachmentMinIOSecret,
			Bucket:    cfg.AttachmentMinIOBucket,
			UseSSL:    cfg.AttachmentMinIOUseSSL,
		},
	}

	for _, source := range sources {
		if strings.TrimSpace(source.Bucket) == "" || strings.TrimSpace(source.Endpoint) == "" {
			continue
		}
		client, err := newMinIOClient(source.Endpoint, source.AccessKey, source.SecretKey, source.UseSSL)
		if err != nil {
			return fmt.Errorf("source bucket %s: %w", source.Bucket, err)
		}
		a.sourceMinIO[source.Bucket] = client
	}

	client, err := newMinIOClient(
		a.cfg.DataCenterMinIOEndpoint,
		a.cfg.DataCenterMinIOAccessKey,
		a.cfg.DataCenterMinIOSecretKey,
		a.cfg.DataCenterMinIOUseSSL,
	)
	if err != nil {
		return fmt.Errorf("data center minio: %w", err)
	}
	a.dataCenterMinIO = client
	return nil
}

func newMinIOClient(endpoint, accessKey, secretKey string, useSSL bool) (*minio.Client, error) {
	endpoint = strings.TrimSpace(endpoint)
	if endpoint == "" {
		return nil, fmt.Errorf("endpoint is required")
	}
	return minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
}

func (a *syncAgent) syncAttachmentBatch(ctx context.Context) (bool, error) {
	cursorValue := a.cursor("attachment:minio")
	candidates, maxCursor, err := a.fetchAttachmentCandidates(ctx, cursorValue)
	if err != nil {
		return false, err
	}
	if len(candidates) == 0 {
		return false, nil
	}

	records := make([]attachmentCompleteRecord, 0, len(candidates))
	for _, candidate := range candidates {
		record, err := a.copyAttachment(ctx, candidate)
		if err != nil {
			return false, err
		}
		records = append(records, record)
	}

	payload := map[string]any{
		"site_code": a.siteCode,
		"records":   records,
	}
	var result batchResult
	if err := a.postJSON(ctx, "/api/sync/attachments/complete", payload, &result); err != nil {
		return false, err
	}
	if result.RecordsFailed > 0 {
		return false, fmt.Errorf("data center accepted partial attachment batch: %d failed", result.RecordsFailed)
	}

	a.state.Tables["attachment:minio"] = maxCursor.UTC().Format(time.RFC3339Nano)
	if err := a.saveCursorState(); err != nil {
		return false, err
	}

	log.Printf("[SYNC] attachments synced %d object(s), cursor=%s", len(records), a.state.Tables["attachment:minio"])
	return len(records) >= a.cfg.BatchSize, nil
}

func (a *syncAgent) fetchAttachmentCandidates(ctx context.Context, cursor string) ([]attachmentCandidate, time.Time, error) {
	const query = `
		WITH candidates AS (
			SELECT
				'transact_anpr_capture'::text AS source_table,
				t.id::text AS source_id,
				attachment.attachment_type,
				COALESCE(NULLIF(t.minio_bucket, ''), 'anpr') AS source_bucket,
				attachment.object_key AS source_object_key,
				attachment.mime_type,
				t.created_date AS source_created_at,
				t.updated_date AS source_updated_at,
				COALESCE(t.updated_date, t.created_date, t.captured_at, now()) AS cursor_at,
				jsonb_build_object(
					'source_table', 'transact_anpr_capture',
					'source_id', t.id,
					'source_object_key', attachment.object_key,
					'plate_no', t.plate_no,
					'external_id', t.external_id
				) AS raw_payload
			FROM public.transact_anpr_capture t
			CROSS JOIN LATERAL (VALUES
				('anpr_xml', t.minio_xml_object, 'application/xml'),
				('anpr_full_image', t.minio_full_image_object, 'image/jpeg'),
				('anpr_plate_image', t.minio_plate_image_object, 'image/jpeg')
			) AS attachment(attachment_type, object_key, mime_type)
			WHERE t.site_id = $1
			  AND t.is_deleted IS NOT TRUE
			  AND NULLIF(btrim(attachment.object_key), '') IS NOT NULL
			  AND COALESCE(t.updated_date, t.created_date, t.captured_at, now()) > $2::timestamptz

			UNION ALL

			SELECT
				'transact_axle_capture'::text AS source_table,
				t.id::text AS source_id,
				attachment.attachment_type,
				COALESCE(NULLIF(t.minio_bucket, ''), 'axle') AS source_bucket,
				attachment.object_key AS source_object_key,
				attachment.mime_type,
				t.created_date AS source_created_at,
				t.updated_date AS source_updated_at,
				COALESCE(t.updated_date, t.created_date, t.captured_at, now()) AS cursor_at,
				jsonb_build_object(
					'source_table', 'transact_axle_capture',
					'source_id', t.id,
					'source_object_key', attachment.object_key,
					'plate_no', t.plate_no,
					'external_id', t.external_id
				) AS raw_payload
			FROM public.transact_axle_capture t
			CROSS JOIN LATERAL (VALUES
				('axle_xml', t.minio_xml_object, 'application/xml'),
				('axle_image', t.minio_image_object, 'image/jpeg')
			) AS attachment(attachment_type, object_key, mime_type)
			WHERE t.site_id = $1
			  AND t.is_deleted IS NOT TRUE
			  AND NULLIF(btrim(attachment.object_key), '') IS NOT NULL
			  AND COALESCE(t.updated_date, t.created_date, t.captured_at, now()) > $2::timestamptz
		)
		SELECT
			source_table,
			source_id,
			attachment_type,
			source_bucket,
			source_object_key,
			mime_type,
			source_created_at,
			source_updated_at,
			cursor_at,
			raw_payload::text
		FROM candidates
		ORDER BY cursor_at ASC, source_table ASC, source_id ASC, attachment_type ASC
		LIMIT $3
	`

	rows, err := a.db.QueryContext(ctx, query, a.siteID, cursor, a.cfg.BatchSize)
	if err != nil {
		return nil, time.Time{}, err
	}
	defer rows.Close()

	candidates := make([]attachmentCandidate, 0, a.cfg.BatchSize)
	var maxCursor time.Time
	for rows.Next() {
		var candidate attachmentCandidate
		var createdAt sql.NullTime
		var updatedAt sql.NullTime
		var rawPayload string
		if err := rows.Scan(
			&candidate.SourceTable,
			&candidate.SourceID,
			&candidate.AttachmentType,
			&candidate.SourceBucket,
			&candidate.SourceObjectKey,
			&candidate.MimeType,
			&createdAt,
			&updatedAt,
			&candidate.CursorAt,
			&rawPayload,
		); err != nil {
			return nil, time.Time{}, err
		}
		if createdAt.Valid {
			candidate.SourceCreatedAt = &createdAt.Time
		}
		if updatedAt.Valid {
			candidate.SourceUpdatedAt = &updatedAt.Time
		}
		candidate.RawPayload = json.RawMessage(rawPayload)
		if candidate.CursorAt.After(maxCursor) {
			maxCursor = candidate.CursorAt
		}
		candidates = append(candidates, candidate)
	}
	if err := rows.Err(); err != nil {
		return nil, time.Time{}, err
	}
	return candidates, maxCursor, nil
}

func (a *syncAgent) copyAttachment(ctx context.Context, candidate attachmentCandidate) (attachmentCompleteRecord, error) {
	sourceClient := a.sourceMinIO[candidate.SourceBucket]
	if sourceClient == nil {
		return attachmentCompleteRecord{}, fmt.Errorf("no source MinIO client configured for bucket %s", candidate.SourceBucket)
	}
	if a.dataCenterMinIO == nil {
		return attachmentCompleteRecord{}, fmt.Errorf("data center MinIO client is not configured")
	}

	object, err := sourceClient.GetObject(ctx, candidate.SourceBucket, candidate.SourceObjectKey, minio.GetObjectOptions{})
	if err != nil {
		return attachmentCompleteRecord{}, fmt.Errorf("get source object %s/%s: %w", candidate.SourceBucket, candidate.SourceObjectKey, err)
	}
	defer object.Close()

	stat, err := object.Stat()
	if err != nil {
		return attachmentCompleteRecord{}, fmt.Errorf("stat source object %s/%s: %w", candidate.SourceBucket, candidate.SourceObjectKey, err)
	}

	targetObjectKey := a.targetAttachmentObjectKey(candidate)
	_, err = a.dataCenterMinIO.PutObject(ctx, a.cfg.DataCenterMinIOBucket, targetObjectKey, object, stat.Size, minio.PutObjectOptions{
		ContentType: candidate.MimeType,
	})
	if err != nil {
		return attachmentCompleteRecord{}, fmt.Errorf("put data center object %s/%s: %w", a.cfg.DataCenterMinIOBucket, targetObjectKey, err)
	}

	fileSize := stat.Size
	return attachmentCompleteRecord{
		SiteAttachmentID:  a.siteAttachmentID(candidate),
		SiteTransactionID: candidate.SourceID,
		AttachmentType:    candidate.AttachmentType,
		ObjectKey:         targetObjectKey,
		FileName:          path.Base(candidate.SourceObjectKey),
		MimeType:          candidate.MimeType,
		FileSize:          &fileSize,
		Checksum:          strings.Trim(stat.ETag, `"`),
		UploadStatus:      "completed",
		SourceCreatedAt:   candidate.SourceCreatedAt,
		SourceUpdatedAt:   candidate.SourceUpdatedAt,
		RawPayload:        candidate.RawPayload,
		IsDeleted:         false,
	}, nil
}

func (a *syncAgent) targetAttachmentObjectKey(candidate attachmentCandidate) string {
	return strings.Join([]string{
		a.siteCode,
		candidate.SourceTable,
		candidate.SourceID,
		candidate.AttachmentType,
		path.Base(candidate.SourceObjectKey),
	}, "/")
}

func (a *syncAgent) siteAttachmentID(candidate attachmentCandidate) string {
	seed := strings.Join([]string{
		a.siteID,
		candidate.SourceTable,
		candidate.SourceID,
		candidate.AttachmentType,
		candidate.SourceBucket,
		candidate.SourceObjectKey,
	}, ":")
	return uuid.NewSHA1(uuid.NameSpaceOID, []byte(seed)).String()
}

func (a *syncAgent) postJSON(ctx context.Context, path string, payload any, response any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, a.cfg.APIBaseURL+path, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Site-Sync-Key", a.cfg.SyncKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 8192))
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("POST %s failed: status=%d body=%s", path, resp.StatusCode, strings.TrimSpace(string(respBody)))
	}
	if response != nil && len(respBody) > 0 {
		if err := json.Unmarshal(respBody, response); err != nil {
			return err
		}
	}
	return nil
}

func (a *syncAgent) loadCursorState() error {
	a.state = cursorState{Tables: map[string]string{}}
	content, err := os.ReadFile(a.cfg.CursorFile)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	if err := json.Unmarshal(content, &a.state); err != nil {
		return err
	}
	if a.state.Tables == nil {
		a.state.Tables = map[string]string{}
	}
	return nil
}

func (a *syncAgent) saveCursorState() error {
	if err := os.MkdirAll(filepath.Dir(a.cfg.CursorFile), 0o755); err != nil {
		return err
	}
	content, err := json.MarshalIndent(a.state, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(a.cfg.CursorFile, content, 0o600)
}

func (a *syncAgent) cursor(tableName string) string {
	if value := strings.TrimSpace(a.state.Tables[tableName]); value != "" {
		return value
	}
	return "1970-01-01T00:00:00Z"
}

func env(key, def string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return def
}

func envInt(key string, def int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return def
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return def
	}
	return parsed
}

func envBool(key string, def bool) bool {
	value := strings.ToLower(strings.TrimSpace(os.Getenv(key)))
	if value == "" {
		return def
	}
	switch value {
	case "1", "true", "yes", "on":
		return true
	case "0", "false", "no", "off":
		return false
	default:
		return def
	}
}
