# Step 42 — Admin product CRUD (backend)

**Week 3 — Admin** · Prev: [Step 41](step-41.md) · Next: [Step 43](step-43.md)

## Goal

Admin create/update/delete products.

## Code

### `backend/internal/handlers/product_form.go`

```go
package handlers

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/abdamah/dailykode/sopify/backend/internal/models"
	"github.com/abdamah/dailykode/sopify/backend/internal/storage"
	"github.com/gofiber/fiber/v3"
)

func parseProductForm(c fiber.Ctx, uploads *storage.LocalStorage, requireImage bool) (models.CreateProductInput, error) {
	contentType := string(c.Request().Header.ContentType())
	if !strings.HasPrefix(contentType, "multipart/form-data") {
		return models.CreateProductInput{}, fmt.Errorf("multipart form data is required")
	}

	name := strings.TrimSpace(c.FormValue("name"))
	description := strings.TrimSpace(c.FormValue("description"))
	categoryID := strings.TrimSpace(c.FormValue("category_id"))

	price, err := strconv.ParseFloat(strings.TrimSpace(c.FormValue("price")), 64)
	if err != nil {
		return models.CreateProductInput{}, fmt.Errorf("price must be a valid number")
	}

	stock, err := strconv.Atoi(strings.TrimSpace(c.FormValue("stock")))
	if err != nil {
		return models.CreateProductInput{}, fmt.Errorf("stock must be a valid number")
	}

	input := models.CreateProductInput{
		Name:        name,
		Description: description,
		Price:       price,
		Stock:       stock,
		CategoryID:  categoryID,
	}

	file, err := c.FormFile("image")
	if err != nil {
		if requireImage {
			return models.CreateProductInput{}, fmt.Errorf("image is required")
		}
		return input, nil
	}

	if file.Size == 0 || strings.TrimSpace(file.Filename) == "" {
		if requireImage {
			return models.CreateProductInput{}, fmt.Errorf("image is required")
		}
		return input, nil
	}

	imageURL, err := uploads.SaveProductImage(file)
	if err != nil {
		return models.CreateProductInput{}, err
	}

	input.ImageURL = imageURL
	return input, nil
}
```

## Notes

Add CreateProduct, UpdateProduct, DeleteProduct to products.go. Register admin routes in routes.go.

## Verify

Postman admin → Create product (JSON).
