# Sopify Backend — Cheatsheet

**Stack:** Go 1.25+ · Fiber v3 · PostgreSQL (`pgx`) · JWT · bcrypt  
**Module:** `github.com/abdamah/dailykode/sopify/backend`  
**Default URL:** `http://localhost:8080`

---

## Quick start

```bash
cd backend
cp .env.example .env          # set DATABASE_URL, JWT_SECRET
make setup                    # migrate + seed
make run                      # go run ./cmd/api
curl http://localhost:8080/health
```

| Command | What it does |
|---------|----------------|
| `make run` | Start API |
| `make migrate` | Run SQL migrations |
| `make seed` | Seed products + admin user |
| `make setup` | migrate + seed |

**Seed admin:** `admin@sopify.com` / `Abc123@@`

---

## Env vars (`.env`)

| Var | Required | Example |
|-----|----------|---------|
| `PORT` | no | `8080` |
| `DATABASE_URL` | yes | `postgres://user:pass@localhost:5432/sopify?sslmode=disable` |
| `JWT_SECRET` | yes | long random string |
| `UPLOAD_DIR` | no | `uploads` (local product images) |

---

## Project layout

```
backend/
├── cmd/api/main.go           # entry: wire deps + routes
├── internal/
│   ├── config/               # .env loading
│   ├── database/             # postgres connect
│   ├── auth/                 # JWT sign/verify
│   ├── models/               # structs (JSON tags)
│   ├── repository/           # SQL queries
│   ├── handlers/             # HTTP handlers + routes.go
│   └── middleware/           # auth, CORS, logger
├── migrations/               # SQL schema
└── scripts/seed/             # sample data + admin
```

**Flow:** `main` → handlers → repository → PostgreSQL

---

## API routes

| Method | Route | Auth | Body / query |
|--------|-------|------|--------------|
| GET | `/health` | — | — |
| GET | `/categories` | — | — |
| GET | `/products` | — | `?category=electronics` (optional) |
| GET | `/products/:id` | — | — |
| POST | `/auth/register` | — | `{ email, password }` |
| POST | `/auth/login` | — | `{ email, password }` |
| POST | `/auth/logout` | user | — |
| GET | `/me` | user | — |
| GET | `/cart` | user | — |
| POST | `/cart` | user | `{ product_id, quantity }` |
| PATCH | `/cart/:product_id` | user | `{ quantity }` — `0` removes item |
| DELETE | `/cart/:product_id` | user | — |
| POST | `/admin/products` | admin | multipart: fields + optional `image` file |
| PATCH | `/admin/products/:id` | admin | multipart: fields + optional `image` file |
| DELETE | `/admin/products/:id` | admin | — |

**Auth header:** `Authorization: Bearer <token>`

**Errors:** `{ "error": "message" }`

---

## curl examples

```bash
# Health
curl http://localhost:8080/health

# Products
curl http://localhost:8080/products
curl "http://localhost:8080/products?category=electronics"
curl http://localhost:8080/products/<uuid>

# Categories
curl http://localhost:8080/categories

# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Login (save token)
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sopify.com","password":"Abc123@@"}'

# Me
curl http://localhost:8080/me -H "Authorization: Bearer $TOKEN"

# Add to cart
curl -X POST http://localhost:8080/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":"<uuid>","quantity":1}'

# Update qty (0 = remove)
curl -X PATCH http://localhost:8080/cart/<product_id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":2}'

# Admin create product
curl -X POST http://localhost:8080/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"...","price":9.99,"stock":10,"category_id":"<uuid>"}'
```

---

## Auth (JWT)

1. **Register / Login** → bcrypt hash → JWT signed → token saved in `users.token`
2. **Protected routes** → `RequireAuth`:
   - Read `Bearer` token
   - Verify JWT signature + expiry
   - Load user from DB
   - Token must match `users.token` (logout invalidates)
3. **Admin routes** → `RequireAdmin` → `user.role === "admin"`

| Role | Value |
|------|-------|
| Customer | `customer` (default) |
| Admin | `admin` |

---

## Database tables

### `users`
| Column | Notes |
|--------|-------|
| id | UUID PK |
| email | unique |
| password | bcrypt hash |
| role | `customer` \| `admin` |
| active | bool |
| token | current JWT (logout clears) |

### `categories`
| Column | Notes |
|--------|-------|
| id | UUID PK |
| name | unique |
| slug | unique (`electronics`, `office`, …) |

**Seeded:** Electronics, Accessories, Office, Home, Kitchen, General

### `products`
| Column | Notes |
|--------|-------|
| id | UUID PK |
| name, description | text |
| price | numeric > 0 |
| image_url | text (default `''`) |
| stock | int ≥ 0 |
| category_id | FK → categories |

### `cart_items`
| Column | Notes |
|--------|-------|
| user_id | FK → users |
| product_id | FK → products |
| quantity | int > 0 |
| UNIQUE | (user_id, product_id) |

---

## Go models (JSON)

```go
// Product response includes nested category
Product {
  id, name, description, price, image_url, stock,
  category_id, category { id, name, slug },
  created_at, updated_at
}

// Create / update product (admin)
CreateProductInput {
  name, description, price, stock, category_id
}

// Auth
AuthResponse { token, user }

// Cart
CartResponse { items[], total }
CartItem { id, quantity, product, line_total }
```

---

## Migrations (order)

| File | Creates |
|------|---------|
| `001_create_products.sql` | `products` |
| `002_create_users.sql` | `users` (legacy) |
| `004_recreate_users.sql` | `users` (JWT fields) |
| `005_create_cart_items.sql` | `cart_items` |
| `006_create_categories.sql` | `categories` + `products.category_id` |

---

## Layer cheat sheet

| Layer | File pattern | Job |
|-------|--------------|-----|
| Handler | `handlers/*.go` | Parse request, validate, HTTP status |
| Repository | `repository/*.go` | SQL only |
| Model | `models/*.go` | Structs + JSON tags |
| Middleware | `middleware/*.go` | Auth, CORS, logging |

**Add a new endpoint:**
1. Model / input struct
2. Repository method
3. Handler method
4. Register in `handlers/routes.go`
5. Wire in `cmd/api/main.go` if new repo/handler

---

## Business rules

| Rule | Where |
|------|-------|
| Price > 0 | product validation |
| Stock ≥ 0 | product validation |
| `category_id` required + must exist | product create/update |
| Cart qty > 0 on add | cart handler |
| Cart qty ≤ product stock | add + patch |
| PATCH qty `≤ 0` → delete line | cart handler |
| Duplicate email on register | 400 |
| Invalid / logged-out token | 401 |
| Non-admin on `/admin/*` | 403 |

---

## CORS

Allows: `http://localhost:3000`  
Headers: `Authorization`, `Content-Type`

---

## Not built yet

| Feature | Planned |
|---------|---------|
| Stripe checkout | Phase 7 |
| Orders + webhooks | Phase 7–8 |
| Category admin CRUD | optional |
| Clerk auth | plan only — using custom JWT today |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `DATABASE_URL is required` | Create `.env` from `.env.example` |
| `relation "products" does not exist` | `make migrate` |
| Empty products | `make seed` (only if table empty) |
| 401 on cart/admin | Login first, pass `Bearer` token |
| 403 on admin | Use `admin@sopify.com` |
| CORS error from browser | Frontend must be `localhost:3000` |

---

## Related docs

- [backend_plan.md](backend_plan.md) — full phased roadmap  
- [README.md](README.md) — minimal run instructions
