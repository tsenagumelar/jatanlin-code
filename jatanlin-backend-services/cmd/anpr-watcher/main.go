package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jlaffaye/ftp"

	"wim-service/internal/config"
	"wim-service/internal/ftpwatcher"
	"wim-service/internal/handler"
	"wim-service/internal/license"
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
	licenseSvc := license.NewService(cfg.LicenseEnabled, cfg.LicenseStatus)

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
	if err := anprProcessor.SetInsertQueue(cfg.NATSURL, licenseSvc); err != nil {
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
		func(ctx context.Context, c *ftp.ServerConn, name string) bool {
			if !licenseSvc.IsAllowed() {
				log.Printf("[ANPR][LICENSE] Skip file %s because license status=%s", name, licenseSvc.Evaluate())
				return false
			}
			return anprProcessor.HandleNewFile(ctx, c, name)
		},
	)

	log.Println("")
	log.Println("Configuration:")
	log.Printf("  FTP Host:         %s", cfg.ANPRFTPHost)
	log.Printf("  FTP Dir:          %s", cfg.ANPRFTPDir)
	log.Printf("  Interval:         %v", cfg.ANPRFTPInterval)
	log.Printf("  Dummy Mode:       %v", cfg.ANPRDummyEnabled)
	log.Printf("  MinIO:            %s", cfg.ANPRMinIOEndpoint)
	log.Printf("  Bucket:           %s", cfg.ANPRMinIOBucket)
	log.Printf("  Session Window:   %d seconds", cfg.SessionWindowSeconds)
	log.Printf("  License Enabled:  %v", cfg.LicenseEnabled)
	log.Printf("  License Status:   %s", licenseSvc.Evaluate())
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

	if cfg.ANPRDummyEnabled {
		log.Println("[ANPR] Starting dummy session listener...")
		ticker := time.NewTicker(cfg.ANPRFTPInterval)
		defer ticker.Stop()

		if err := anprProcessor.ProcessDummySession(ctx); err != nil {
			log.Printf("[ANPR] Initial dummy session processing failed: %v", err)
		}

		for {
			select {
			case <-ctx.Done():
				log.Println("[ANPR] Dummy listener stopped")
				log.Println("[ANPR] Shutdown complete. Goodbye!")
				return
			case <-ticker.C:
				if !licenseSvc.IsAllowed() {
					log.Printf("[ANPR][LICENSE] Standby (status=%s)", licenseSvc.Evaluate())
					continue
				}
				if err := anprProcessor.ProcessDummySession(ctx); err != nil {
					log.Printf("[ANPR] Dummy session processing failed: %v", err)
				}
			}
		}
	}

	// Start watcher
	for !licenseSvc.IsAllowed() {
		log.Printf("[ANPR][LICENSE] Startup standby (status=%s), waiting 5s...", licenseSvc.Evaluate())
		select {
		case <-ctx.Done():
			log.Println("[ANPR] Shutdown complete. Goodbye!")
			return
		case <-time.After(5 * time.Second):
		}
	}
	log.Println("[ANPR] Starting FTP watcher...")
	if err := anprWatcher.Start(ctx); err != nil {
		log.Printf("[ANPR] Watcher stopped: %v", err)
	}

	log.Println("[ANPR] Shutdown complete. Goodbye!")
}
