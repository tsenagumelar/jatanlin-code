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
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"wim-service/internal/config"
)

type syncConfig struct {
	Enabled      bool
	APIBaseURL   string
	SyncKey      string
	Interval     time.Duration
	BatchSize    int
	CursorFile   string
	HTTPTimeout  time.Duration
	Once         bool
	MirrorTables []mirrorTable
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

type syncAgent struct {
	db         *sql.DB
	httpClient *http.Client
	siteID     string
	siteCode   string
	siteName   string
	siteRegion string
	cfg        syncConfig
	state      cursorState
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
		Enabled:     envBool("DATA_CENTER_SYNC_ENABLED", false),
		APIBaseURL:  strings.TrimRight(env("DATA_CENTER_API_URL", "http://localhost:28001"), "/"),
		SyncKey:     env("DATA_CENTER_SYNC_KEY", "jatanlin-site-sync-key-2026"),
		Interval:    time.Duration(envInt("DATA_CENTER_SYNC_INTERVAL_SEC", 30)) * time.Second,
		BatchSize:   envInt("DATA_CENTER_SYNC_BATCH_SIZE", 100),
		CursorFile:  env("DATA_CENTER_SYNC_CURSOR_FILE", "./data/sync-agent-cursors.json"),
		HTTPTimeout: time.Duration(envInt("DATA_CENTER_SYNC_HTTP_TIMEOUT_SEC", 20)) * time.Second,
		Once:        envBool("DATA_CENTER_SYNC_ONCE", false),
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
