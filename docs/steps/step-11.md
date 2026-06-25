# Step 11 — Product handlers & routes

**Week 1 — Products** · Prev: [Step 10](step-10.md) · Next: [Step 12](step-12.md)

## Goal

Public GET /products, /products/:id, /categories.

## Code

### `backend/internal/handlers/products.go`

```go
package handlers

import (
	"errors"
	"log"
	"strings"

	"github.com/abdamah/dailykode/sopify/backend/internal/models"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/abdamah/dailykode/sopify/backend/internal/storage"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

type ProductHandler struct {
	repo         *repository.ProductRepository
	categoryRepo *repository.CategoryRepository
	uploads      *storage.LocalStorage
}

func NewProductHandler(
	repo *repository.ProductRepository,
	categoryRepo *repository.CategoryRepository,
	uploads *storage.LocalStorage,
) *ProductHandler {
	return &ProductHandler{
		repo:         repo,
		categoryRepo: categoryRepo,
		uploads:      uploads,
	}
}

func (h *ProductHandler) ProductList(c fiber.Ctx) error {
	categorySlug := strings.TrimSpace(c.Query("category"))
	products, err := h.repo.ListProducts(c.Context(), categorySlug)
	if err != nil {
		log.Printf("[api] list products: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to list products",
		})
	}

	return c.JSON(products)
}

func (h *ProductHandler) GetProductByID(c fiber.Ctx) error {
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

func (h *ProductHandler) CreateProduct(c fiber.Ctx) error {
	input, err := parseProductForm(c, h.uploads, false)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if errMsg := h.validateCreateProductInput(c, input); errMsg != "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": errMsg,
		})
	}

	product, err := h.repo.CreateProduct(c.Context(), input)
	if err != nil {
		log.Printf("[api] create product: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create product",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(product)
}

func (h *ProductHandler) UpdateProduct(c fiber.Ctx) error {
	id := c.Params("id")
	if _, err := uuid.Parse(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid product id",
		})
	}

	input, err := parseProductForm(c, h.uploads, false)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if errMsg := h.validateCreateProductInput(c, input); errMsg != "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": errMsg,
		})
	}

	product, err := h.repo.UpdateProduct(c.Context(), id, input)
	if errors.Is(err, repository.ErrProductNotFound) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "product not found",
		})
	}
	if err != nil {
		log.Printf("[api] update product %s: %v", id, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to update product",
		})
	}

	return c.JSON(product)
}

func (h *ProductHandler) DeleteProduct(c fiber.Ctx) error {
	id := c.Params("id")
	if _, err := uuid.Parse(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid product id",
		})
	}

	err := h.repo.DeleteProduct(c.Context(), id)
	if errors.Is(err, repository.ErrProductNotFound) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "product not found",
		})
	}
	if err != nil {
		log.Printf("[api] delete product %s: %v", id, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to delete product",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductHandler) validateCreateProductInput(c fiber.Ctx, input models.CreateProductInput) string {
	switch {
	case input.Name == "":
		return "name is required"
	case input.Price <= 0:
		return "price must be greater than 0"
	case input.Stock < 0:
		return "stock must be 0 or greater"
	case input.CategoryID == "":
		return "category_id is required"
	}

	if _, err := uuid.Parse(input.CategoryID); err != nil {
		return "invalid category id"
	}

	exists, err := h.categoryRepo.ExistsByID(c.Context(), input.CategoryID)
	if err != nil {
		log.Printf("[api] check category %s: %v", input.CategoryID, err)
		return "failed to validate category"
	}
	if !exists {
		return "category not found"
	}

	return ""
}
```

### `backend/internal/handlers/categories.go`

```go
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
```

### `backend/internal/handlers/routes.go`

```go
package handlers

import (
	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/gofiber/fiber/v3"
)

func RegisterRoutes(
	app *fiber.App,
	healthHandler *HealthHandler,
	productHandler *ProductHandler,
	categoryHandler *CategoryHandler,
	authHandler *AuthHandler,
	cartHandler *CartHandler,
	checkoutHandler *CheckoutHandler,
	webhookHandler *StripeWebhookHandler,
	orderHandler *OrderHandler,
	authMiddleware *middleware.AuthMiddleware,
) {
	app.Get("/health", healthHandler.Health)
	app.Get("/categories", categoryHandler.ListCategories)
	app.Get("/products", productHandler.ProductList)
	app.Get("/products/:id", productHandler.GetProductByID)

	app.Post("/auth/register", authHandler.Register)
	app.Post("/auth/login", authHandler.Login)
	app.Post("/auth/logout", authMiddleware.RequireAuth, authHandler.Logout)

	app.Get("/me", authMiddleware.RequireAuth, Me)
	app.Get("/cart", authMiddleware.RequireAuth, cartHandler.GetCart)
	app.Post("/cart", authMiddleware.RequireAuth, cartHandler.AddItem)
	app.Patch("/cart/:product_id", authMiddleware.RequireAuth, cartHandler.UpdateItem)
	app.Delete("/cart/:product_id", authMiddleware.RequireAuth, cartHandler.RemoveItem)
	app.Post("/checkout", authMiddleware.RequireAuth, checkoutHandler.CreateSession)
	app.Get("/orders", authMiddleware.RequireAuth, orderHandler.ListMyOrders)
	app.Post("/webhooks/stripe", webhookHandler.Handle)

	admin := app.Group("/admin", authMiddleware.RequireAuth, authMiddleware.RequireAdmin)
	admin.Post("/products", productHandler.CreateProduct)
	admin.Patch("/products/:id", productHandler.UpdateProduct)
	admin.Delete("/products/:id", productHandler.DeleteProduct)
	admin.Get("/orders", orderHandler.ListOrders)
}
```

## Notes

Week 1: implement read-only handlers first. Wire repos in main.go.

## Verify

Postman → List products returns JSON array.
