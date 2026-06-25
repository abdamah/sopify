# Step 4 — Health endpoint

**Week 1 — Products** · Prev: [Step 3](step-03.md) · Next: [Step 5](step-05.md)

## Goal

Expose GET /health returning JSON.

## Code

### `backend/internal/handlers/health.go`

```go
package handlers

import "github.com/gofiber/fiber/v3"

func Health(c fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status": "ok",
		"app":    "sopify",
	})
}
```

## Notes

In main.go add: `app.Get("/health", handlers.Health)`

## Verify

Postman → Health check → 200 {"status":"ok","app":"sopify"}
