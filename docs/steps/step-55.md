# Step 55 — Health DB ping & graceful shutdown

**Week 4 — Stripe & orders** · Prev: [Step 54](step-54.md) · Next: [Step 56](step-56.md)

## Goal

Production-ready health and shutdown.

## Code

### `backend/internal/handlers/health.go`

```go
package handlers

import (
	"context"
	"database/sql"
	"time"

	"github.com/gofiber/fiber/v3"
)

type HealthHandler struct {
	db *sql.DB
}

func NewHealthHandler(db *sql.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) Health(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 2*time.Second)
	defer cancel()

	if err := h.db.PingContext(ctx); err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status":   "error",
			"app":      "sopify",
			"database": "unavailable",
		})
	}

	return c.JSON(fiber.Map{
		"status":   "ok",
		"app":      "sopify",
		"database": "ok",
	})
}
```

### `backend/cmd/api/main.go`

```go
package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/abdamah/dailykode/sopify/backend/internal/auth"
	"github.com/abdamah/dailykode/sopify/backend/internal/config"
	"github.com/abdamah/dailykode/sopify/backend/internal/database"
	"github.com/abdamah/dailykode/sopify/backend/internal/handlers"
	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/abdamah/dailykode/sopify/backend/internal/storage"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/static"
)

func main() {
	log.SetFlags(log.Ldate | log.Ltime)

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	uploads, err := storage.NewLocalStorage(cfg.UploadDir)
	if err != nil {
		log.Fatal(err)
	}

	jwtService := auth.NewJWTService(cfg.JWTSecret, cfg.JWTExpiry)

	app := fiber.New(fiber.Config{
		BodyLimit: storage.MaxUploadBytes,
	})
	middleware.SetupLogger(app)
	middleware.SetupCORS(app)
	app.Use("/uploads", static.New(cfg.UploadDir))

	productRepo := repository.NewProductRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	userRepo := repository.NewUserRepository(db)
	cartRepo := repository.NewCartRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	authMiddleware := middleware.NewAuthMiddleware(jwtService, userRepo)
	productHandler := handlers.NewProductHandler(productRepo, categoryRepo, uploads)
	categoryHandler := handlers.NewCategoryHandler(categoryRepo)
	authHandler := handlers.NewAuthHandler(userRepo, jwtService)
	cartHandler := handlers.NewCartHandler(cartRepo, productRepo)
	checkoutHandler := handlers.NewCheckoutHandler(cartRepo, cfg)
	webhookHandler := handlers.NewStripeWebhookHandler(orderRepo, cartRepo, productRepo, cfg)
	orderHandler := handlers.NewOrderHandler(orderRepo)
	healthHandler := handlers.NewHealthHandler(db)

	handlers.RegisterRoutes(app, healthHandler, productHandler, categoryHandler, authHandler, cartHandler, checkoutHandler, webhookHandler, orderHandler, authMiddleware)

	go func() {
		log.Printf("[api] listening on :%s", cfg.Port)
		if err := app.Listen(":"+cfg.Port, fiber.ListenConfig{
			DisableStartupMessage: true,
		}); err != nil {
			log.Printf("[api] server stopped: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("[api] shutting down...")
	if err := app.Shutdown(); err != nil {
		log.Printf("[api] shutdown error: %v", err)
	}
	log.Println("[api] stopped")
}
```

## Verify

Health shows database ok; Ctrl+C shuts down cleanly.
