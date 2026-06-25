# Step 24 — User model & repository

**Week 2 — Auth & cart** · Prev: [Step 23](step-23.md) · Next: [Step 25](step-25.md)

## Goal

User struct and DB queries.

## Code

### `backend/internal/models/user.go`

```go
package models

import "time"

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	Role      string    `json:"role"`
	Active    bool      `json:"active"`
	Token     string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type RegisterInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
```

### `backend/internal/repository/user.go`

```go
package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/abdamah/dailykode/sopify/backend/internal/models"
)

var ErrUserNotFound = errors.New("user not found")
var ErrUserInactive = errors.New("user inactive")

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateWithPassword(ctx context.Context, email, passwordHash string) (*models.User, error) {
	var user models.User
	var token sql.NullString
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO users (email, password, role, active)
		VALUES ($1, $2, 'customer', true)
		RETURNING id, email, password, role, active, token, created_at, updated_at
	`, email, passwordHash).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Active,
		&token,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if token.Valid {
		user.Token = token.String
	}

	return &user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	var token sql.NullString
	err := r.db.QueryRowContext(ctx, `
		SELECT id, email, password, role, active, token, created_at, updated_at
		FROM users
		WHERE email = $1
	`, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Active,
		&token,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	if token.Valid {
		user.Token = token.String
	}
	if !user.Active {
		return nil, ErrUserInactive
	}

	return &user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	var user models.User
	var token sql.NullString
	err := r.db.QueryRowContext(ctx, `
		SELECT id, email, password, role, active, token, created_at, updated_at
		FROM users
		WHERE id = $1
	`, id).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Active,
		&token,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	if token.Valid {
		user.Token = token.String
	}
	if !user.Active {
		return nil, ErrUserInactive
	}

	return &user, nil
}

func (r *UserRepository) SaveToken(ctx context.Context, userID, token string) (*models.User, error) {
	var user models.User
	var storedToken sql.NullString
	err := r.db.QueryRowContext(ctx, `
		UPDATE users
		SET token = $2, updated_at = NOW()
		WHERE id = $1 AND active = true
		RETURNING id, email, password, role, active, token, created_at, updated_at
	`, userID, token).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Active,
		&storedToken,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrUserInactive
	}
	if err != nil {
		return nil, err
	}
	if storedToken.Valid {
		user.Token = storedToken.String
	}

	return &user, nil
}

func (r *UserRepository) ClearToken(ctx context.Context, userID string) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE users
		SET token = NULL, updated_at = NOW()
		WHERE id = $1 AND active = true
	`, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}
```

## Verify

Compiles.
