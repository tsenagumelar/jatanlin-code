package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"wim-service/internal/config"
	"wim-service/internal/ftpwatcher"
	"wim-service/internal/handler"
)

func main() {
	log.Println("========================================")
	log.Println("  WIM ANPR FTP WATCHER")
	log.Println("========================================")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("[ANPR] Failed to load config:", err)
	}
	defer cfg.DB.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize dimension handler if enabled
	var dimensionHandler *handler.DimensionHandler
	if cfg.DimensionEnabled {
		log.Println("[ANPR] Vehicle Dimension Detection: ENABLED")
		dimensionHandler, err = handler.NewDimensionHandler(
			cfg.DB,
			cfg.SiteUUID,
			cfg.DimensionModelPath,
			cfg.DimensionThreshold,
		)
		if err != nil {
			log.Fatal("[ANPR] Failed to create dimension handler:", err)
		}

		calibration := cfg.GetCameraCalibration()
		if err := dimensionHandler.SetCalibration(calibration); err != nil {
			log.Fatal("[ANPR] Failed to set camera calibration:", err)
		}
		dimensionHandler.SetDummyEnabled(cfg.DimensionDummyEnabled)

		log.Printf("[ANPR] Camera: %dx%d, Height: %.2fm, Tilt: %.2f°",
			cfg.CameraImageWidth, cfg.CameraImageHeight,
			cfg.CameraHeight, cfg.CameraTiltAngle)
		log.Printf("[ANPR] Dimension Dummy Mode: %v", cfg.DimensionDummyEnabled)
	} else {
		log.Println("[ANPR] Vehicle Dimension Detection: DISABLED")
	}

	// Create ANPR processor
	anprProcessor, err := handler.NewFileProcessor(
		cfg.DB,
		cfg.SiteUUID,
		cfg.ANPRFTPDir,
		cfg.ANPRMinIOEndpoint,
		cfg.ANPRMinIOAccess,
		cfg.ANPRMinIOSecret,
		cfg.ANPRMinIOBucket,
		cfg.ANPRMinIOUseSSL,
	)
	if err != nil {
		log.Fatal("[ANPR] Failed to create ANPR processor:", err)
	}

	// Link dimension handler
	if dimensionHandler != nil {
		anprProcessor.SetDimensionHandler(dimensionHandler)
	}

	// Create and link session service
	sessionService := handler.NewSessionService(cfg.DB, cfg.SiteUUID, cfg.SessionWindowSeconds)
	anprProcessor.SetSessionService(sessionService)

	// Configure ANPR insert queue (NATS JetStream)
	if err := anprProcessor.SetInsertQueue(cfg.NATSURL); err != nil {
		log.Fatalf("[ANPR] Failed to init ANPR queue: %v", err)
	}

	// Configure weighing trigger
	anprProcessor.SetWeighingTriggerConfig(&handler.WeighingTriggerConfig{
		URL:        cfg.WeighingTriggerURL,
		Direction:  cfg.WeighingTriggerDirection,
		TimeoutSec: cfg.WeighingTriggerTimeoutSec,
		Save:       cfg.WeighingTriggerSave,
		Dummy:      cfg.WeighingTriggerDummy,
	})

	// Configure CCTV trigger
	anprProcessor.SetCCTVTriggerConfig(&handler.CCTVTriggerConfig{
		Enabled: cfg.CCTVTriggerEnabled,
		URL:     cfg.CCTVTriggerURL,
		Seconds: cfg.CCTVTriggerSeconds,
		Dummy:   cfg.CCTVTriggerDummy,
	})

	log.Printf("[ANPR] Session-based processing enabled (window: %d seconds)", cfg.SessionWindowSeconds)

	// Create FTP watcher
	anprWatcher := ftpwatcher.New(
		cfg.ANPRFTPHost,
		cfg.ANPRFTPUser,
		cfg.ANPRFTPPass,
		cfg.ANPRFTPDir,
		cfg.ANPRFTPInterval,
		anprProcessor.HandleNewFile,
	)

	log.Println("")
	log.Println("Configuration:")
	log.Printf("  FTP Host:         %s", cfg.ANPRFTPHost)
	log.Printf("  FTP Dir:          %s", cfg.ANPRFTPDir)
	log.Printf("  Interval:         %v", cfg.ANPRFTPInterval)
	log.Printf("  Dummy Mode:       session-based (transact_wim_session.is_dummy)")
	log.Printf("  MinIO:            %s", cfg.ANPRMinIOEndpoint)
	log.Printf("  Bucket:           %s", cfg.ANPRMinIOBucket)
	log.Printf("  Session Window:   %d seconds", cfg.SessionWindowSeconds)
	if cfg.WeighingTriggerURL != "" {
		log.Printf("  Weighing Trigger: %s (save=%v dummy=%v)", cfg.WeighingTriggerURL, cfg.WeighingTriggerSave, cfg.WeighingTriggerDummy)
	}
	if cfg.CCTVTriggerEnabled && cfg.CCTVTriggerURL != "" {
		log.Printf("  CCTV Trigger:     %s (seconds=%d)", cfg.CCTVTriggerURL, cfg.CCTVTriggerSeconds)
	}
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
		log.Println("[ANPR] Shutting down gracefully...")
		cancel()
	}()

	// Start session-aware loop:
	// - If active session is_dummy=true: process dummy ANPR.
	// - If active session is_dummy=false: ingest ANPR from FTP.
	// - If no active session: skip current cycle.
	log.Println("[ANPR] Starting session-aware watcher loop...")
	ticker := time.NewTicker(cfg.ANPRFTPInterval)
	defer ticker.Stop()

	runCycle := func() {
		session, err := sessionService.GetActiveSession()
		if err != nil {
			log.Printf("[ANPR] Active session check failed: %v", err)
			return
		}
		if session == nil {
			log.Println("[ANPR] No active IN_PROGRESS session found")
			return
		}
		log.Printf(
			"[ANPR] Active session found: id=%s code=%s is_dummy=%v site_id=%s",
			session.ID.String(),
			session.Code,
			session.IsDummy,
			session.SiteID.String(),
		)

		if session.IsDummy {
			if err := anprProcessor.ProcessDummySession(ctx); err != nil {
				log.Printf("[ANPR] Dummy session processing failed: %v", err)
			}
			return
		}

		if err := anprWatcher.PollOnce(ctx); err != nil {
			log.Printf("[ANPR] FTP polling failed: %v", err)
		}
	}

	// Run first cycle immediately.
	runCycle()

	for {
		select {
		case <-ctx.Done():
			log.Println("[ANPR] Watcher stopped")
			log.Println("[ANPR] Shutdown complete. Goodbye!")
			return
		case <-ticker.C:
			runCycle()
		}
	}
}
