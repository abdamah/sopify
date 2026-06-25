package handlers

import (
	"context"
	"database/sql"
	"time"

	"github.com/gofiber/fiber/v3"
)

type HealthHandler struct {
	db *sql.DB
}

func NewHealthHandler(db *sql.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) Health(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 2*time.Second)
	defer cancel()

	if err := h.db.PingContext(ctx); err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status":   "error",
			"app":      "sopify",
			"database": "unavailable",
		})
	}

	return c.JSON(fiber.Map{
		"status":   "ok",
		"app":      "sopify",
		"database": "ok",
	})
}
