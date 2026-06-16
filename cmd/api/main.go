package main

import (
	"log"

	"github.com/abdamah/dailykode/sopify/backend/internal/auth"
	"github.com/abdamah/dailykode/sopify/backend/internal/config"
	"github.com/abdamah/dailykode/sopify/backend/internal/database"
	"github.com/abdamah/dailykode/sopify/backend/internal/handlers"
	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
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

	if cfg.ClerkJWKSURL == "" || cfg.ClerkIssuer == "" {
		log.Fatal("CLERK_JWKS_URL and CLERK_ISSUER are required")
	}

	clerkVerifier, err := auth.NewVerifier(cfg.ClerkJWKSURL, cfg.ClerkIssuer)
	if err != nil {
		log.Fatal(err)
	}

	app := fiber.New()
	middleware.SetupLogger(app)
	middleware.SetupCORS(app)

	productRepo := repository.NewProductRepository(db)
	userRepo := repository.NewUserRepository(db)
	authMiddleware := middleware.NewAuthMiddleware(clerkVerifier, userRepo)
	productHandler := handlers.NewProductHandler(productRepo)
	handlers.RegisterRoutes(app, productHandler, authMiddleware)

	log.Printf("[api] listening on :%s", cfg.Port)
	log.Fatal(app.Listen(":"+cfg.Port, fiber.ListenConfig{
		DisableStartupMessage: true,
	}))
}
