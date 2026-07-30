package api

import "github.com/gofiber/fiber/v2"

func health(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":  "ok",
		"service": "wim-service",
	})
}
