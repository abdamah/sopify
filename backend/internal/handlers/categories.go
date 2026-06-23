package handlers

import (
	"log"

	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
)

type CategoryHandler struct {
	repo *repository.CategoryRepository
}

func NewCategoryHandler(repo *repository.CategoryRepository) *CategoryHandler {
	return &CategoryHandler{repo: repo}
}

func (h *CategoryHandler) ListCategories(c fiber.Ctx) error {
	categories, err := h.repo.ListCategories(c.Context())
	if err != nil {
		log.Printf("[api] list categories: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to list categories",
		})
	}

	return c.JSON(categories)
}
