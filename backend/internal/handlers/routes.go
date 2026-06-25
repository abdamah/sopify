package handlers

import (
	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/gofiber/fiber/v3"
)

func RegisterRoutes(
	app *fiber.App,
	productHandler *ProductHandler,
	categoryHandler *CategoryHandler,
	authHandler *AuthHandler,
	cartHandler *CartHandler,
	checkoutHandler *CheckoutHandler,
	webhookHandler *StripeWebhookHandler,
	orderHandler *OrderHandler,
	authMiddleware *middleware.AuthMiddleware,
) {
	app.Get("/health", Health)
	app.Get("/categories", categoryHandler.ListCategories)
	app.Get("/products", productHandler.ProductList)
	app.Get("/products/:id", productHandler.GetProductByID)

	app.Post("/auth/register", authHandler.Register)
	app.Post("/auth/login", authHandler.Login)
	app.Post("/auth/logout", authMiddleware.RequireAuth, authHandler.Logout)

	app.Get("/me", authMiddleware.RequireAuth, Me)
	app.Get("/cart", authMiddleware.RequireAuth, cartHandler.GetCart)
	app.Post("/cart", authMiddleware.RequireAuth, cartHandler.AddItem)
	app.Patch("/cart/:product_id", authMiddleware.RequireAuth, cartHandler.UpdateItem)
	app.Delete("/cart/:product_id", authMiddleware.RequireAuth, cartHandler.RemoveItem)
	app.Post("/checkout", authMiddleware.RequireAuth, checkoutHandler.CreateSession)
	app.Post("/webhooks/stripe", webhookHandler.Handle)

	admin := app.Group("/admin", authMiddleware.RequireAuth, authMiddleware.RequireAdmin)
	admin.Post("/products", productHandler.CreateProduct)
	admin.Patch("/products/:id", productHandler.UpdateProduct)
	admin.Delete("/products/:id", productHandler.DeleteProduct)
	admin.Get("/orders", orderHandler.ListOrders)
}
