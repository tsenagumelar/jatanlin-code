package api

import (
	"log"
	"wim-service/internal/dashboard"

	"github.com/gofiber/fiber/v2"
)

type DashboardHandler struct{ service *dashboard.Service }

func NewDashboardHandler(service *dashboard.Service) *DashboardHandler {
	return &DashboardHandler{service: service}
}

func (h *DashboardHandler) Summary(c *fiber.Ctx) error {
	result, err := h.service.Summary(c.UserContext())
	if err != nil {
		log.Printf("[DASHBOARD] summary failed: %v", err)
		return errorResponse(c, fiber.StatusInternalServerError, "Dashboard data could not be loaded")
	}
	return c.JSON(fiber.Map{"success": true, "data": result})
}
