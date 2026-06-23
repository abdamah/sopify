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

	jwtService := auth.NewJWTService(cfg.JWTSecret, cfg.JWTExpiry)

	app := fiber.New()
	middleware.SetupLogger(app)
	middleware.SetupCORS(app)

	productRepo := repository.NewProductRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	userRepo := repository.NewUserRepository(db)
	cartRepo := repository.NewCartRepository(db)
	authMiddleware := middleware.NewAuthMiddleware(jwtService, userRepo)
	productHandler := handlers.NewProductHandler(productRepo, categoryRepo)
	categoryHandler := handlers.NewCategoryHandler(categoryRepo)
	authHandler := handlers.NewAuthHandler(userRepo, jwtService)
	cartHandler := handlers.NewCartHandler(cartRepo, productRepo)

	handlers.RegisterRoutes(app, productHandler, categoryHandler, authHandler, cartHandler, authMiddleware)

	log.Printf("[api] listening on :%s", cfg.Port)
	log.Fatal(app.Listen(":"+cfg.Port, fiber.ListenConfig{
		DisableStartupMessage: true,
	}))
}
