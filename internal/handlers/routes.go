package handlers

import (
	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/gofiber/fiber/v3"
)

func RegisterRoutes(app *fiber.App, productHandler *ProductHandler, authHandler *AuthHandler, authMiddleware *middleware.AuthMiddleware) {
	app.Get("/health", Health)
	app.Get("/products", productHandler.ProductList)
	app.Get("/products/:id", productHandler.GetProductByID)

	app.Post("/auth/register", authHandler.Register)
	app.Post("/auth/login", authHandler.Login)

	app.Get("/me", authMiddleware.RequireAuth, Me)

	admin := app.Group("/admin", authMiddleware.RequireAuth, authMiddleware.RequireAdmin)
	admin.Post("/products", productHandler.CreateProduct)
	admin.Delete("/products/:id", productHandler.DeleteProduct)
}
