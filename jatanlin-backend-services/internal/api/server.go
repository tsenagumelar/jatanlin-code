package api

import (
	"database/sql"
	"log"
	"wim-service/internal/auth"
	"wim-service/internal/handler"
	"wim-service/internal/license"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

type Server struct {
	App               *fiber.App
	AuthService       *auth.AuthService
	AuthHandler       *AuthHandler
	AttachmentHandler *handler.AttachmentHandler
	AuthEnabled       bool
	LicenseService    *license.Service
}

func NewServer(db *sql.DB, jwtSecret string, attachmentHandler *handler.AttachmentHandler, authEnabled bool, licenseService *license.Service) *Server {
	app := fiber.New(fiber.Config{
		AppName: "WIM Service API",
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	authService := auth.NewAuthService(db, jwtSecret)
	authHandler := NewAuthHandler(authService)

	server := &Server{
		App:               app,
		AuthService:       authService,
		AuthHandler:       authHandler,
		AttachmentHandler: attachmentHandler,
		AuthEnabled:       authEnabled,
		LicenseService:    licenseService,
	}

	if !authEnabled {
		log.Println("[API] Authorization middleware disabled (temporary)")
	}

	server.setupRoutes()

	return server
}

func (s *Server) setupRoutes() {
	s.App.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "wim-service",
		})
	})

	api := s.App.Group("/api")

	api.Get("/license/status", func(c *fiber.Ctx) error {
		return c.JSON(s.LicenseService.StatusPayload())
	})

	// Auth routes (public)
	authRoutes := api.Group("/auth")
	authRoutes.Use(s.licenseGuard)
	authRoutes.Post("/login", s.AuthHandler.Login)

	// Protected routes (requires JWT)
	protected := api.Group("/auth")
	protected.Use(s.licenseGuard)
	if s.AuthEnabled {
		protected.Use(JWTMiddleware(s.AuthService))
	}
	protected.Get("/profile", s.AuthHandler.GetProfile)

	// Attachment upload routes (protected - requires JWT)
	attachment := api.Group("/attachment")
	attachment.Use(s.licenseGuard)
	if s.AuthEnabled {
		attachment.Use(JWTMiddleware(s.AuthService))
	}
	attachment.Post("/upload", s.AttachmentHandler.UploadImage)

	// Note: WIM Session management is handled via Hasura GraphQL
	// No REST API endpoints needed here
}

func (s *Server) licenseGuard(c *fiber.Ctx) error {
	if s.LicenseService == nil || s.LicenseService.IsAllowed() {
		return c.Next()
	}

	return c.Status(fiber.StatusLocked).JSON(fiber.Map{
		"message": "license is locked",
		"license": s.LicenseService.StatusPayload(),
	})
}

func (s *Server) Start(port string) error {
	log.Printf("[API] Starting server on port %s", port)
	return s.App.Listen(":" + port)
}

func (s *Server) Shutdown() error {
	log.Println("[API] Shutting down server...")
	return s.App.Shutdown()
}
