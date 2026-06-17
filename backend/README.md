# Sopify Backend

Go + Fiber v3 API.

**Module:** `github.com/abdamah/dailykode/sopify/backend`  
**Requires:** Go 1.25+ (Fiber v3)

## Run

```bash
go run ./cmd/api
curl http://localhost:8080/health
```

Expected:

```json
{"app":"sopify","status":"ok"}
```

See [backend_plan.md](backend_plan.md) for phased build plan.
