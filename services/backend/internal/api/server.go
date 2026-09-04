package api

import (
	"database/sql"
	"log"
	"time"
	"wim-service/internal/attachment"
	"wim-service/internal/auth"
	"wim-service/internal/license"
	"wim-service/internal/orchestrator"
	"wim-service/internal/veam"

	"github.com/gofiber/fiber/v2"
)

type Server struct {
	App                *fiber.App
	DB                 *sql.DB
	AuthService        *auth.AuthService
	AuthHandler        *AuthHandler
	UserHandler        *UserHandler
	AttachmentHandler  *attachment.AttachmentHandler
	VeamHandler        *veam.VeamHandler
	TransactionHandler *TransactionHandler
	AuthEnabled        bool
}

func NewServer(db *sql.DB, jwtSecret string, attachmentHandler *attachment.AttachmentHandler, licenseService *license.Service, authEnabled bool, siteID string, sessionTimeout time.Duration) (*Server, error) {
	authService := auth.NewAuthService(db, jwtSecret, licenseService)
	transactionService, err := orchestrator.NewService(db, siteID, sessionTimeout)
	if err != nil {
		return nil, err
	}

	server := &Server{
		App:                newFiberApp(),
		DB:                 db,
		AuthService:        authService,
		AuthHandler:        NewAuthHandler(authService),
		UserHandler:        NewUserHandler(db),
		AttachmentHandler:  attachmentHandler,
		VeamHandler:        veam.NewVeamHandler(licenseService),
		TransactionHandler: NewTransactionHandler(transactionService),
		AuthEnabled:        authEnabled,
	}

	if !authEnabled {
		log.Println("[API] Authorization middleware disabled (temporary)")
	}

	server.setupRoutes()

	return server, nil
}

func (s *Server) Start(port string) error {
	log.Printf("[API] Starting server on port %s", port)
	return s.App.Listen(":" + port)
}

func (s *Server) Shutdown() error {
	log.Println("[API] Shutting down server...")
	return s.App.Shutdown()
}
