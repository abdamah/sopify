package handlers

import (
	"errors"
	"log"

	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/abdamah/dailykode/sopify/backend/internal/models"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

type CartHandler struct {
	cartRepo    *repository.CartRepository
	productRepo *repository.ProductRepository
}

func NewCartHandler(cartRepo *repository.CartRepository, productRepo *repository.ProductRepository) *CartHandler {
	return &CartHandler{
		cartRepo:    cartRepo,
		productRepo: productRepo,
	}
}

func (h *CartHandler) GetCart(c fiber.Ctx) error {
	user, ok := middleware.UserFromContext(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	response, err := h.buildCartResponse(c, user.ID)
	if err != nil {
		log.Printf("[api] list cart for user %s: %v", user.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to get cart",
		})
	}

	return c.JSON(response)
}

func (h *CartHandler) AddItem(c fiber.Ctx) error {
	user, ok := middleware.UserFromContext(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	var input models.AddCartItemInput
	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if _, err := uuid.Parse(input.ProductID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid product id",
		})
	}
	if input.Quantity <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "quantity must be greater than 0",
		})
	}

	product, err := h.productRepo.GetProductByID(c.Context(), input.ProductID)
	if errors.Is(err, repository.ErrProductNotFound) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "product not found",
		})
	}
	if err != nil {
		log.Printf("[api] get product %s: %v", input.ProductID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to add item to cart",
		})
	}

	currentQuantity, err := h.cartRepo.GetItemQuantity(c.Context(), user.ID, input.ProductID)
	if err != nil {
		log.Printf("[api] get cart item quantity: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to add item to cart",
		})
	}

	newQuantity := currentQuantity + input.Quantity
	if newQuantity > product.Stock {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "quantity exceeds available stock",
		})
	}

	if err := h.cartRepo.AddItem(c.Context(), user.ID, input.ProductID, input.Quantity); err != nil {
		log.Printf("[api] add cart item: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to add item to cart",
		})
	}

	response, err := h.buildCartResponse(c, user.ID)
	if err != nil {
		log.Printf("[api] list cart for user %s: %v", user.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to add item to cart",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

func (h *CartHandler) RemoveItem(c fiber.Ctx) error {
	user, ok := middleware.UserFromContext(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	productID := c.Params("product_id")
	if _, err := uuid.Parse(productID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid product id",
		})
	}

	err := h.cartRepo.DeleteItem(c.Context(), user.ID, productID)
	if errors.Is(err, repository.ErrCartItemNotFound) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "cart item not found",
		})
	}
	if err != nil {
		log.Printf("[api] delete cart item: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to remove item from cart",
		})
	}

	response, err := h.buildCartResponse(c, user.ID)
	if err != nil {
		log.Printf("[api] list cart for user %s: %v", user.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to remove item from cart",
		})
	}

	return c.JSON(response)
}

func (h *CartHandler) buildCartResponse(c fiber.Ctx, userID string) (models.CartResponse, error) {
	items, err := h.cartRepo.ListByUserID(c.Context(), userID)
	if err != nil {
		return models.CartResponse{}, err
	}

	var total float64
	for _, item := range items {
		total += item.LineTotal
	}

	return models.CartResponse{
		Items: items,
		Total: total,
	}, nil
}
