package config

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	DatabaseURL     string
	JWTSecret       string
	JWTExpiry       time.Duration
	UploadDir       string
	StripeSecretKey     string
	StripeWebhookSecret string
	FrontendURL         string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	jwtExpiry := 24 * time.Hour
	if value := os.Getenv("JWT_EXPIRY"); value != "" {
		parsed, err := time.ParseDuration(value)
		if err != nil {
			return nil, fmt.Errorf("invalid JWT_EXPIRY: %w", err)
		}
		jwtExpiry = parsed
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "uploads"
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	return &Config{
		Port:            port,
		DatabaseURL:     databaseURL,
		JWTSecret:       jwtSecret,
		JWTExpiry:       jwtExpiry,
		UploadDir:       uploadDir,
		StripeSecretKey:     os.Getenv("STRIPE_SECRET_KEY"),
		StripeWebhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),
		FrontendURL:         frontendURL,
	}, nil
}
