package middleware

import (
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/logger"
)

func SetupLogger(app *fiber.App) {
	app.Use(logger.New(logger.Config{
		Format: "${method} ${path} ${status} - ${latency}\n",
		Next: func(c fiber.Ctx) bool {
			return c.Path() == "/health"
		},
	}))
}
