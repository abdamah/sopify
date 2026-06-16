package handlers

import "github.com/gofiber/fiber/v3"

func RegisterRoutes(app *fiber.App) {
	app.Get("/health", Health)
}
