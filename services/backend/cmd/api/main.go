package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"wim-service/internal/api"
	"wim-service/internal/attachment"
	"wim-service/internal/config"
	"wim-service/internal/license"
)

func main() {
	log.Println("========================================")
	log.Println("  WIM API SERVER")
	log.Println("========================================")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("[API] Failed to load config:", err)
	}
	defer cfg.DB.Close()

	// Initialize attachment handler
	attachmentHandler, err := attachment.NewAttachmentHandler(
		cfg.AttachmentMinIOEndpoint,
		cfg.AttachmentMinIOAccess,
		cfg.AttachmentMinIOSecret,
		cfg.AttachmentMinIOBucket,
		cfg.AttachmentMinIOUseSSL,
	)
	if err != nil {
		log.Fatal("[API] Failed to create attachment handler:", err)
	}

	licenseService, err := license.NewService(
		cfg.VEAMLicensePath,
		cfg.VEAMPublicKeyB64,
		cfg.SiteUUID,
		cfg.VEAMHardwareID,
	)
	if err != nil {
		log.Fatal("[API] Failed to create VEAM license service:", err)
	}

	// Create API server
	apiServer, err := api.NewServer(
		cfg.DB,
		cfg.JWTSecret,
		attachmentHandler,
		licenseService,
		cfg.AuthEnabled,
		cfg.SiteUUID,
		time.Duration(cfg.SessionWindowSeconds)*time.Second,
	)
	if err != nil {
		log.Fatal("[API] Failed to create transaction orchestrator:", err)
	}

	log.Println("")
	log.Println("API Endpoints:")
	log.Printf("  → http://localhost:%s", cfg.APIPort)
	log.Println("")
	log.Println("Public Endpoints:")
	log.Printf("  - Health Check:  GET  /health")
	log.Printf("  - Login:         POST /api/auth/login")
	log.Printf("  - VEAM Scan USB: GET  /veam/scan-license")
	log.Printf("  - VEAM Status:   GET  /veam/status")
	log.Printf("  - VEAM Activate: POST /veam/activate")
	log.Println("")
	if cfg.AuthEnabled {
		log.Println("Protected Endpoints (Require JWT Token):")
		log.Printf("  - Profile:       GET  /api/auth/profile")
		log.Printf("  - Upload Image:  POST /api/attachment/upload")
	} else {
		log.Println("Protected Endpoints (Authorization temporarily disabled):")
		log.Printf("  - Profile:       GET  /api/auth/profile")
		log.Printf("  - Upload Image:  POST /api/attachment/upload")
	}
	log.Println("")
	log.Println("Press Ctrl+C to stop the API server")
	log.Println("========================================")
	log.Println("")

	// Handle graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan

		log.Println("")
		log.Println("[API] Shutting down gracefully...")
		if err := apiServer.Shutdown(); err != nil {
			log.Printf("[API] Error during shutdown: %v", err)
		}
		log.Println("[API] Shutdown complete. Goodbye!")
		os.Exit(0)
	}()

	// Start server
	log.Printf("[API] Starting server on port %s...", cfg.APIPort)
	if err := apiServer.Start(cfg.APIPort); err != nil {
		log.Fatal("[API] Server error:", err)
	}
}
