package api

import "github.com/gofiber/fiber/v2"

func (s *Server) setupRoutes() {
	s.registerHealthRoutes()
	s.registerAuthRoutes()
	s.registerAttachmentRoutes()
	s.registerUserRoutes()
	s.registerVeamRoutes()
	s.registerDataCenterSyncRoutes()
	s.registerTransactionRoutes()
}

func (s *Server) registerTransactionRoutes() {
	transactions := s.App.Group("/api").Group("/transactions")
	transactions.Use(JWTMiddleware(s.AuthService))
	transactions.Post("/sessions/start", s.TransactionHandler.Start)
	transactions.Get("/sessions/active", s.TransactionHandler.Active)
	transactions.Get("/sessions/recover", s.TransactionHandler.Active)
	transactions.Post("/sessions/:id/finalize", s.TransactionHandler.Finalize)
	transactions.Put("/vehicles/:id/verification", s.TransactionHandler.Verify)
}

func (s *Server) registerHealthRoutes() {
	s.App.Get("/health", health)
}

func (s *Server) registerAuthRoutes() {
	api := s.App.Group("/api")

	authRoutes := api.Group("/auth")
	authRoutes.Post("/login", s.AuthHandler.Login)

	protected := api.Group("/auth")
	s.useAuthIfEnabled(protected)
	protected.Get("/profile", s.AuthHandler.GetProfile)
}

func (s *Server) registerAttachmentRoutes() {
	attachment := s.App.Group("/api").Group("/attachment")
	s.useAuthIfEnabled(attachment)
	attachment.Post("/upload", s.AttachmentHandler.UploadImage)
}

func (s *Server) registerUserRoutes() {
	users := s.App.Group("/api").Group("/users")
	// User mutations always require a verified actor so audit columns cannot be
	// silently written as NULL when the wider development auth flag is disabled.
	users.Use(JWTMiddleware(s.AuthService))
	users.Post("", s.UserHandler.CreateUser)
	users.Post("/", s.UserHandler.CreateUser)
	users.Put("/:id", s.UserHandler.UpdateUser)
	users.Delete("/:id", s.UserHandler.DeleteUser)
}

func (s *Server) registerVeamRoutes() {
	veam := s.App.Group("/veam")
	veam.Get("/scan-license", s.VeamHandler.ScanLicense)
	veam.Get("/status", s.VeamHandler.Status)
	veam.Post("/activate", s.VeamHandler.Activate)
	veam.Post("/activate-usb", s.VeamHandler.ActivateFromUSB)
	veam.Delete("/license", s.VeamHandler.Revoke)
}

func (s *Server) registerDataCenterSyncRoutes() {
	sync := s.App.Group("/api").Group("/data-center-sync")
	s.useAuthIfEnabled(sync)
	sync.Post("/range", s.TriggerDataCenterSyncRange)
}

func (s *Server) useAuthIfEnabled(router fiber.Router) {
	if s.AuthEnabled {
		router.Use(JWTMiddleware(s.AuthService))
	}
}
