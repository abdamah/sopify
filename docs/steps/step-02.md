# Step 2 — Minimal Fiber server

**Week 1 — Products** · Prev: [Step 1](step-01.md) · Next: [Step 3](step-03.md)

## Goal

Start a Fiber HTTP server on port 8080.

## Code

### `backend/cmd/api/main.go`

```go
package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
)

func main() {
	app := fiber.New()
	log.Fatal(app.Listen(":8080"))
}
```

## Verify

`go run ./cmd/api` runs without crashing.
