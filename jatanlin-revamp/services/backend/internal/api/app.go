package api

import (
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func newFiberApp() *fiber.App {
	app := fiber.New(fiber.Config{
		AppName:   "WIM Service API",
		BodyLimit: bodyLimitBytes(),
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	return app
}

func bodyLimitBytes() int {
	const defaultLimitMB = 50
	value := os.Getenv("API_BODY_LIMIT_MB")
	if value == "" {
		return defaultLimitMB * 1024 * 1024
	}
	limitMB, err := strconv.Atoi(value)
	if err != nil || limitMB <= 0 {
		return defaultLimitMB * 1024 * 1024
	}
	return limitMB * 1024 * 1024
}
