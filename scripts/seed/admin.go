package main

import (
	"context"
	"database/sql"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

const (
	adminEmail    = "admin@sopify.com"
	adminPassword = "Abc123@@"
)

func seedAdmin(ctx context.Context, db *sql.DB) error {
	var exists bool
	if err := db.QueryRowContext(ctx, `
		SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)
	`, adminEmail).Scan(&exists); err != nil {
		return fmt.Errorf("check admin user: %w", err)
	}
	if exists {
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash admin password: %w", err)
	}

	_, err = db.ExecContext(ctx, `
		INSERT INTO users (email, password, role, active)
		VALUES ($1, $2, 'admin', true)
	`, adminEmail, string(hash))
	if err != nil {
		return fmt.Errorf("insert admin user: %w", err)
	}

	return nil
}
