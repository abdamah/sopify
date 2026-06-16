package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	DatabaseURL  string
	ClerkJWKSURL string
	ClerkIssuer  string
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

	clerkJWKSURL := os.Getenv("CLERK_JWKS_URL")
	clerkIssuer := os.Getenv("CLERK_ISSUER")

	return &Config{
		Port:         port,
		DatabaseURL:  databaseURL,
		ClerkJWKSURL: clerkJWKSURL,
		ClerkIssuer:  clerkIssuer,
	}, nil
}
