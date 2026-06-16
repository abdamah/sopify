package models

import "time"

type User struct {
	ID        string    `json:"id"`
	ClerkID   string    `json:"clerk_id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
