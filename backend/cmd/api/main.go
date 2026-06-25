package main

import (
	"log"

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

	handlers.RegisterRoutes(app, productHandler, categoryHandler, authHandler, cartHandler, checkoutHandler, webhookHandler, authMiddleware)

	log.Printf("[api] listening on :%s", cfg.Port)
	log.Fatal(app.Listen(":"+cfg.Port, fiber.ListenConfig{
		DisableStartupMessage: true,
	}))
}
