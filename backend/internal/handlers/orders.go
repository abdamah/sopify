package handlers

import (
	"log"

	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
)

type OrderHandler struct {
	repo *repository.OrderRepository
}

func NewOrderHandler(repo *repository.OrderRepository) *OrderHandler {
	return &OrderHandler{repo: repo}
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
