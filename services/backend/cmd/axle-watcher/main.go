package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"wim-service/internal/axle"
	"wim-service/internal/config"
	"wim-service/internal/ftpwatcher"
	"wim-service/internal/session"
)

func main() {
	log.Println("========================================")
	log.Println("  WIM AXLE FTP WATCHER")
	log.Println("========================================")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("[AXLE] Failed to load config:", err)
	}
	defer cfg.DB.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Create AXLE processor
	axleProcessor, err := axle.NewAxleProcessor(
		cfg.DB,
		cfg.SiteUUID,
		cfg.AxleFTPDir,
		cfg.AxleMinIOEndpoint,
		cfg.AxleMinIOAccess,
		cfg.AxleMinIOSecret,
		cfg.AxleMinIOBucket,
		cfg.AxleMinIOUseSSL,
	)
	if err != nil {
		log.Fatal("[AXLE] Failed to create AXLE processor:", err)
	}

	// Create and link session service
	sessionService := session.NewSessionService(cfg.DB, cfg.SiteUUID, cfg.SessionWindowSeconds)
	axleProcessor.SetSessionService(sessionService)

	// Configure AXLE insert queue (NATS JetStream)
	if err := axleProcessor.SetInsertQueue(cfg.NATSURL); err != nil {
		log.Fatalf("[AXLE] Failed to init AXLE queue: %v", err)
	}

	log.Printf("[AXLE] Session-based processing enabled (window: %d seconds)", cfg.SessionWindowSeconds)

	// Create FTP watcher
	axleWatcher := ftpwatcher.New(
		cfg.AxleFTPHost,
		cfg.AxleFTPUser,
		cfg.AxleFTPPass,
		cfg.AxleFTPDir,
		cfg.AxleFTPInterval,
		axleProcessor.HandleNewFileAXLE,
	)

	log.Println("")
	log.Println("Configuration:")
	log.Printf("  FTP Host:     %s", cfg.AxleFTPHost)
	log.Printf("  FTP Dir:      %s", cfg.AxleFTPDir)
	log.Printf("  Interval:     %v", cfg.AxleFTPInterval)
	log.Printf("  Dummy Mode:   session-based (transact_wim_session.is_dummy)")
	log.Printf("  MinIO:        %s", cfg.AxleMinIOEndpoint)
	log.Printf("  Bucket:       %s", cfg.AxleMinIOBucket)
	log.Printf("  Session Window: %d seconds", cfg.SessionWindowSeconds)
	log.Println("")
	log.Println("Press Ctrl+C to stop the watcher")
	log.Println("========================================")
	log.Println("")

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("")
		log.Println("[AXLE] Shutting down gracefully...")
		cancel()
	}()

	// Start session-aware loop:
	// - If active session is_dummy=true: process dummy AXLE.
	// - If active session is_dummy=false: ingest AXLE from FTP.
	// - If no active session: skip current cycle.
	log.Println("[AXLE] Starting session-aware watcher loop...")
	ticker := time.NewTicker(cfg.AxleFTPInterval)
	defer ticker.Stop()

	runCycle := func() {
		session, err := sessionService.GetActiveSession()
		if err != nil {
			log.Printf("[AXLE] Active session check failed: %v", err)
			return
		}
		if session == nil {
			log.Println("[AXLE] No active IN_PROGRESS session found")
			return
		}
		log.Printf(
			"[AXLE] Active session found: id=%s code=%s is_dummy=%v site_id=%s",
			session.ID.String(),
			session.Code,
			session.IsDummy,
			session.SiteID.String(),
		)

		if session.IsDummy {
			if err := axleProcessor.ProcessDummySession(ctx); err != nil {
				log.Printf("[AXLE] Dummy session processing failed: %v", err)
			}
			return
		}

		if err := axleWatcher.PollOnce(ctx); err != nil {
			log.Printf("[AXLE] FTP polling failed: %v", err)
		}
	}

	// Run first cycle immediately.
	runCycle()

	for {
		select {
		case <-ctx.Done():
			log.Println("[AXLE] Watcher stopped")
			log.Println("[AXLE] Shutdown complete. Goodbye!")
			return
		case <-ticker.C:
			runCycle()
		}
	}
}
