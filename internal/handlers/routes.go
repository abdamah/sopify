package handlers

import (
	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/gofiber/fiber/v3"
)

func RegisterRoutes(app *fiber.App, productHandler *ProductHandler, authMiddleware *middleware.AuthMiddleware) {
	app.Get("/health", Health)
	app.Get("/products", productHandler.ProductList)
	app.Get("/products/:id", productHandler.GetProductByID)

	app.Get("/me", authMiddleware.RequireAuth, Me)

	admin := app.Group("/admin")
	admin.Post("/products", productHandler.CreateProduct, authMiddleware.RequireAuth, authMiddleware.RequireAdmin)
	admin.Delete("/products/:id", productHandler.DeleteProduct, authMiddleware.RequireAuth, authMiddleware.RequireAdmin)
}
