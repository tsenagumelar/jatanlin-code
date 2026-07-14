package api

import (
	"log"
	"strings"
	"wim-service/internal/auth"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	AuthService *auth.AuthService
}

func NewAuthHandler(authService *auth.AuthService) *AuthHandler {
	return &AuthHandler{
		AuthService: authService,
	}
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req auth.LoginRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	usernameOrEmail := strings.TrimSpace(req.Username)
	if usernameOrEmail == "" {
		usernameOrEmail = strings.TrimSpace(req.Email)
	}

	if usernameOrEmail == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Username/email and password are required",
		})
	}

	response, err := h.AuthService.Authenticate(usernameOrEmail, req.Password)
	if err != nil {
		log.Printf("[AUTH] Login failed for user: %s - %v", usernameOrEmail, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Invalid username or password",
		})
	}

	log.Printf("[AUTH] Login successful for user: %s", usernameOrEmail)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Login successful",
		"data":    response,
	})
}

func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	user, err := h.AuthService.GetUserByUUID(userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "User not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}
