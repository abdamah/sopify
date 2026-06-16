package handlers

import "github.com/gofiber/fiber/v3"

func RegisterRoutes(app *fiber.App, productHandler *ProductHandler) {
	app.Get("/health", Health)
	app.Get("/products", productHandler.List)
	app.Get("/products/:id", productHandler.GetByID)
}
