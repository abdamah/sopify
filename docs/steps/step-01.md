# Step 1 — Init Go module

**Week 1 — Products** · Prev: [Step 0](step-00.md) · Next: [Step 2](step-02.md)

## Goal

Create an empty Go backend project with Fiber.

## Commands

- mkdir -p backend/cmd/api backend/internal
```bash
cd backend
```

```bash
go mod init github.com/abdamah/dailykode/sopify/backend
```

```bash
go get github.com/gofiber/fiber/v3
```


## Verify

`go mod tidy` succeeds.
