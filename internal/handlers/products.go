package handlers

import (
	"errors"
	"log"

	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

type ProductHandler struct {
	repo *repository.ProductRepository
}

func NewProductHandler(repo *repository.ProductRepository) *ProductHandler {
	return &ProductHandler{repo: repo}
}

func (h *ProductHandler) List(c fiber.Ctx) error {
	products, err := h.repo.ListProducts(c.Context())
	if err != nil {
		log.Printf("[api] list products: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to list products",
		})
	}

	return c.JSON(products)
}

func (h *ProductHandler) GetByID(c fiber.Ctx) error {
	id := c.Params("id")
	if _, err := uuid.Parse(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid product id",
		})
	}

	product, err := h.repo.GetProductByID(c.Context(), id)
	if errors.Is(err, repository.ErrProductNotFound) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "product not found",
		})
	}
	if err != nil {
		log.Printf("[api] get product %s: %v", id, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to get product",
		})
	}

	return c.JSON(product)
}
