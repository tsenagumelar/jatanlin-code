package api

import (
	"database/sql"
	"log"
	"wim-service/internal/attachment"
	"wim-service/internal/auth"
	"wim-service/internal/license"
	"wim-service/internal/veam"

	"github.com/gofiber/fiber/v2"
)

type Server struct {
	App               *fiber.App
	DB                *sql.DB
	AuthService       *auth.AuthService
	AuthHandler       *AuthHandler
	UserHandler       *UserHandler
	AttachmentHandler *attachment.AttachmentHandler
	VeamHandler       *veam.VeamHandler
	AuthEnabled       bool
}

func NewServer(db *sql.DB, jwtSecret string, attachmentHandler *attachment.AttachmentHandler, licenseService *license.Service, authEnabled bool) *Server {
	authService := auth.NewAuthService(db, jwtSecret)

	server := &Server{
		App:               newFiberApp(),
		DB:                db,
		AuthService:       authService,
		AuthHandler:       NewAuthHandler(authService),
		UserHandler:       NewUserHandler(db),
		AttachmentHandler: attachmentHandler,
		VeamHandler:       veam.NewVeamHandler(licenseService),
		AuthEnabled:       authEnabled,
	}

	if !authEnabled {
		log.Println("[API] Authorization middleware disabled (temporary)")
	}

	server.setupRoutes()

	return server
}

func (s *Server) Start(port string) error {
	log.Printf("[API] Starting server on port %s", port)
	return s.App.Listen(":" + port)
}

func (s *Server) Shutdown() error {
	log.Println("[API] Shutting down server...")
	return s.App.Shutdown()
}
