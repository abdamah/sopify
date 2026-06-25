package handlers

import (
	"log"

	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
)

type OrderHandler struct {
	repo *repository.OrderRepository
}

func NewOrderHandler(repo *repository.OrderRepository) *OrderHandler {
	return &OrderHandler{repo: repo}
}

func (h *OrderHandler) ListMyOrders(c fiber.Ctx) error {
	user, ok := middleware.UserFromContext(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	orders, err := h.repo.ListByUserIDWithItems(c.Context(), user.ID)
	if err != nil {
		log.Printf("[api] list orders for user %s: %v", user.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to list orders",
		})
	}

	return c.JSON(orders)
}

func (h *OrderHandler) ListOrders(c fiber.Ctx) error {
	orders, err := h.repo.ListAllWithItems(c.Context())
	if err != nil {
		log.Printf("[api] list orders: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to list orders",
		})
	}

	return c.JSON(orders)
}
