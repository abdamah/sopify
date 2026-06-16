package handlers

import (
	"errors"

	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
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
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to list products",
		})
	}

	return c.JSON(products)
}

func (h *ProductHandler) GetByID(c fiber.Ctx) error {
	product, err := h.repo.GetProductByID(c.Context(), c.Params("id"))
	if errors.Is(err, repository.ErrProductNotFound) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "product not found",
		})
	}
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to get product",
		})
	}

	return c.JSON(product)
}
