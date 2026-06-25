# Step 8 — Product & category models

**Week 1 — Products** · Prev: [Step 7](step-07.md) · Next: [Step 9](step-09.md)

## Goal

Go structs matching API JSON.

## Code

### `backend/internal/models/category.go`

```go
package models

import "time"

type Category struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	CreatedAt time.Time `json:"created_at"`
}
```

### `backend/internal/models/product.go`

```go
package models

import "time"

type Product struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	ImageURL    string    `json:"image_url"`
	Stock       int       `json:"stock"`
	CategoryID  string    `json:"category_id"`
	Category    Category  `json:"category"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateProductInput struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	CategoryID  string  `json:"category_id"`
	ImageURL    string  `json:"image_url,omitempty"`
}
```

## Verify

Project compiles.
