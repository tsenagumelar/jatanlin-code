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
	licenseSvc := license.NewService(cfg.LicenseEnabled, cfg.LicenseStatus)

	// Create AXLE processor
	axleProcessor, err := handler.NewAxleProcessor(
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
	sessionService := handler.NewSessionService(cfg.DB, cfg.SiteUUID, cfg.SessionWindowSeconds)
	axleProcessor.SetSessionService(sessionService)

	// Configure AXLE insert queue (NATS JetStream)
	if err := axleProcessor.SetInsertQueue(cfg.NATSURL, licenseSvc); err != nil {
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
		func(ctx context.Context, c *ftp.ServerConn, name string) bool {
			if !licenseSvc.IsAllowed() {
				log.Printf("[AXLE][LICENSE] Skip file %s because license status=%s", name, licenseSvc.Evaluate())
				return false
			}
			return axleProcessor.HandleNewFileAXLE(ctx, c, name)
		},
	)

	log.Println("")
	log.Println("Configuration:")
	log.Printf("  FTP Host:     %s", cfg.AxleFTPHost)
	log.Printf("  FTP Dir:      %s", cfg.AxleFTPDir)
	log.Printf("  Interval:     %v", cfg.AxleFTPInterval)
	log.Printf("  Dummy Mode:   %v", cfg.AxleDummyEnabled)
	log.Printf("  MinIO:        %s", cfg.AxleMinIOEndpoint)
	log.Printf("  Bucket:       %s", cfg.AxleMinIOBucket)
	log.Printf("  Session Window: %d seconds", cfg.SessionWindowSeconds)
	log.Printf("  License Enabled: %v", cfg.LicenseEnabled)
	log.Printf("  License Status:  %s", licenseSvc.Evaluate())
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

	if cfg.AxleDummyEnabled {
		log.Println("[AXLE] Starting dummy session listener...")
		ticker := time.NewTicker(cfg.AxleFTPInterval)
		defer ticker.Stop()

		if err := axleProcessor.ProcessDummySession(ctx); err != nil {
			log.Printf("[AXLE] Initial dummy session processing failed: %v", err)
		}

		for {
			select {
			case <-ctx.Done():
				log.Println("[AXLE] Dummy listener stopped")
				log.Println("[AXLE] Shutdown complete. Goodbye!")
				return
			case <-ticker.C:
				if !licenseSvc.IsAllowed() {
					log.Printf("[AXLE][LICENSE] Standby (status=%s)", licenseSvc.Evaluate())
					continue
				}
				if err := axleProcessor.ProcessDummySession(ctx); err != nil {
					log.Printf("[AXLE] Dummy session processing failed: %v", err)
				}
			}
		}
	}

	// Start watcher
	for !licenseSvc.IsAllowed() {
		log.Printf("[AXLE][LICENSE] Startup standby (status=%s), waiting 5s...", licenseSvc.Evaluate())
		select {
		case <-ctx.Done():
			log.Println("[AXLE] Shutdown complete. Goodbye!")
			return
		case <-time.After(5 * time.Second):
		}
	}
	log.Println("[AXLE] Starting FTP watcher...")
	if err := axleWatcher.Start(ctx); err != nil {
		log.Printf("[AXLE] Watcher stopped: %v", err)
	}

	log.Println("[AXLE] Shutdown complete. Goodbye!")
}
