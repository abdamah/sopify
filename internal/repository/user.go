package repository

import (
	"context"
	"database/sql"

	"github.com/abdamah/dailykode/sopify/backend/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindOrCreateByClerkID(ctx context.Context, clerkID, email, role string) (*models.User, error) {
	var user models.User
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO users (clerk_id, email, role)
		VALUES ($1, $2, $3)
		ON CONFLICT (clerk_id) DO UPDATE
		SET email = EXCLUDED.email,
		    role = EXCLUDED.role,
		    updated_at = NOW()
		RETURNING id, clerk_id, email, role, created_at, updated_at
	`, clerkID, email, role).Scan(
		&user.ID,
		&user.ClerkID,
		&user.Email,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
