package main

import (
	"log"

	"github.com/abdamah/dailykode/sopify/backend/internal/config"
	"github.com/abdamah/dailykode/sopify/backend/internal/database"
	"github.com/abdamah/dailykode/sopify/backend/internal/handlers"
	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	app := fiber.New()
	middleware.SetupCORS(app)

	productRepo := repository.NewProductRepository(db)
	productHandler := handlers.NewProductHandler(productRepo)
	handlers.RegisterRoutes(app, productHandler)

	log.Printf("Sopify API listening on :%s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
