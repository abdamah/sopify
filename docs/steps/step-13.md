# Step 13 — CORS for Next.js

**Week 1 — Products** · Prev: [Step 12](step-12.md) · Next: [Step 14](step-14.md)

## Goal

Allow browser requests from localhost:3000.

## Code

### `backend/internal/middleware/cors.go`

```go
package middleware

import (
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

func SetupCORS(app *fiber.App) {
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
	}))
}
```

## Notes

Call middleware.SetupCORS(app) in main.go before routes.

## Verify

No CORS errors once frontend runs.
