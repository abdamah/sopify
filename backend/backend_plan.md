# Sopify Backend Plan

**Author:** Abdallah  
**Stack:** Go · Fiber v3 · PostgreSQL · JWT auth · Stripe

**Module:** `github.com/abdamah/dailykode/sopify/backend`  
**Requires:** Go 1.25+ (Fiber v3)

---

## Goal

Build a simple REST API that powers Sopify: products, cart, checkout, orders, and admin — with Clerk for auth (no custom login endpoints).

---

## Project layout

```
backend/
├── cmd/api/main.go
├── internal/
│   ├── config/        # env vars
│   ├── database/      # postgres connection
│   ├── handlers/      # HTTP handlers
│   ├── middleware/    # Clerk JWT, admin, CORS
│   ├── models/        # structs
│   ├── repository/    # DB queries
│   └── storage/       # local product image uploads
├── migrations/
├── .env.example
└── go.mod
```

---

## Database

| Table | Key fields |
|-------|------------|
| `users` | id, clerk_id, email, role |
| `products` | id, name, description, price, image_url, stock |
| `cart_items` | id, user_id, product_id, quantity |
| `orders` | id, user_id, total, status, stripe_session_id |
| `order_items` | id, order_id, product_id, quantity, price |

**Order status:** `pending` → `paid` → `shipped` (optional)

---

## API overview

| Method | Route | Auth | Phase |
|--------|-------|------|-------|
| GET | `/health` | — | 1 |
| GET | `/products` | — | 2 |
| GET | `/products/:id` | — | 2 |
| POST | `/admin/products` | admin | 3 |
| DELETE | `/admin/products/:id` | admin | 3 |
| GET | `/me` | user | 4 |
| GET | `/cart` | user | 5 |
| POST | `/cart` | user | 5 |
| DELETE | `/cart/:product_id` | user | 5 |
| POST | `/admin/products` (+ image) | admin | 6 |
| POST | `/checkout` | user | 7 |
| POST | `/webhooks/stripe` | Stripe sig | 7 |
| GET | `/admin/orders` | admin | 8 |

---

# Phase 1 — Project skeleton

**Goal:** Folder structure + Fiber v3 app + `GET /health` only.

### Tasks

- [x] Init Go module: `github.com/abdamah/dailykode/sopify/backend`
- [x] Install Fiber v3: `go get github.com/gofiber/fiber/v3@latest`
- [x] Create folder layout (`cmd/`, `internal/`, `migrations/`)
- [x] `cmd/api/main.go` — start Fiber server
- [x] `internal/handlers/health.go` — health handler
- [x] `GET /health` → `{ "status": "ok", "app": "sopify" }`

### Run

```bash
cd sopify/backend
go run ./cmd/api
curl http://localhost:8080/health
```

### Homework

Add `version` field to the health JSON response.

---

# Phase 2 — Database + products API

**Goal:** PostgreSQL connected + public product endpoints.

### Tasks

- [ ] Load config from `.env` (`PORT`, `DATABASE_URL`)
- [ ] Connect PostgreSQL (`pgx` or `database/sql`)
- [ ] Migration: `products` table
- [ ] `GET /products` — list all
- [ ] `GET /products/:id` — single product
- [ ] Seed 5 products (SQL or seed script)
- [ ] CORS middleware for Next.js origin

### Deliverable

```bash
curl http://localhost:8080/products
```

### Homework

Add 3 more products via SQL seed file.

---

# Phase 3 — Admin product CRUD

**Goal:** Create and delete products (auth added in Phase 4).

### Tasks

- [ ] Migration: extend `products` if needed
- [ ] `POST /admin/products` — body: `{ name, description, price, stock }`
- [ ] `DELETE /admin/products/:id`
- [ ] Input validation (price > 0, name required)
- [ ] Return proper status codes (201, 400, 404)
- [ ] Repository layer: `CreateProduct`, `DeleteProduct`, `ListProducts`, `GetProduct`

### Deliverable

Postman: create product → list shows it → delete removes it.

### Homework

Handle duplicate product name or return clear 400 errors.

---

# Phase 4 — Clerk auth

**Goal:** Verify JWT on protected routes; sync users to DB.

### Tasks

- [ ] Clerk JWT middleware (`Authorization: Bearer <token>`)
- [ ] Fetch/verify JWKS from Clerk
- [ ] Extract `sub` (clerk_id) and `email` from claims
- [ ] Migration: `users` table
- [ ] `GET /me` — find or create user by `clerk_id`
- [ ] Read `role` from Clerk `publicMetadata` or default `customer`
- [ ] `RequireAuth` middleware
- [ ] `RequireAdmin` middleware

### Deliverable

```bash
curl -H "Authorization: Bearer <clerk_jwt>" http://localhost:8080/me
```

### Homework

Return 401 without token, 403 for admin route as non-admin.

---

# Phase 5 — Cart

**Goal:** Logged-in users manage cart.

### Tasks

- [ ] Migration: `cart_items` table
- [ ] `GET /cart` — items + product details + total
- [ ] `POST /cart` — `{ product_id, quantity }` (merge if exists)
- [ ] `DELETE /cart/:product_id`
- [ ] All cart routes behind `RequireAuth`
- [ ] Validate product exists and stock available

### Deliverable

Sign in → add 2 products → GET cart shows correct total.

### Homework

Prevent quantity > stock; return 400 with message.

---

# Phase 6 — Product image upload (local)

**Goal:** Admin uploads product image on create/update.

### Tasks

- [x] `POST/PATCH /admin/products` — multipart: fields + `image` file
- [x] Local storage in `uploads/` + serve at `/uploads/*`
- [x] Save `image_url` on product
- [x] Validate file type (jpeg, png, webp) and max size (5MB)
- [x] Protect `/admin/*` with `RequireAdmin`

### Deliverable

Admin creates product with image → `GET /products` returns `image_url`.

### Homework

Return default placeholder if no image uploaded.

---

# Phase 7 — Stripe checkout

**Goal:** Pay for cart; webhook creates order.

### Tasks

- [ ] Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] `POST /checkout` — build line items from cart
- [ ] Create Stripe Checkout Session → return `{ url }`
- [ ] `POST /webhooks/stripe` — verify signature
- [ ] On `checkout.session.completed`:
  - Create `orders` + `order_items`
  - Set status `paid`
  - Clear user cart
- [ ] Migrations: `orders`, `order_items`
- [ ] Idempotency: ignore duplicate webhook events

### Deliverable

Test card `4242 4242 4242 4242` → order in DB → cart empty.

### Homework

Store `stripe_session_id` on order for lookup.

---

# Phase 8 — Admin orders + polish

**Goal:** Admin sees orders; API production-ready basics.

### Tasks

- [ ] `GET /admin/orders` — list with items
- [ ] Optional: decrement `products.stock` on payment
- [ ] Consistent JSON error format: `{ "error": "message" }`
- [ ] Request logging middleware
- [ ] Graceful shutdown (`SIGINT`)
- [ ] Health check includes DB ping

### Deliverable

Admin lists orders after a test purchase.

### Homework

Add `PATCH /admin/orders/:id/status` → `shipped`.

---

# Phase 9 — Deploy

**Goal:** Live API.

### Tasks

- [ ] Dockerfile or Railway/Fly config
- [ ] Run migrations on deploy
- [ ] Production env vars (JWT, Stripe, DB)
- [ ] Stripe webhook URL → `https://api.yoursite.com/webhooks/stripe`
- [ ] CORS: allow production frontend URL only

### Deliverable

Frontend on Vercel talks to deployed backend.

---

## Env vars (`.env.example`)

```env
PORT=8080
DATABASE_URL=postgres://...
CLERK_JWKS_URL=https://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=uploads
```

---

## Phase summary

| Phase | Focus | Endpoints |
|-------|--------|-----------|
| 1 | Skeleton + health | `/health` |
| 2 | DB + products | `/products` |
| 3 | Admin CRUD | `/admin/products` |
| 4 | Clerk JWT | `/me` |
| 5 | Cart | `/cart` |
| 6 | Local image upload | multipart `/admin/products` |
| 7 | Stripe | `/checkout`, `/webhooks/stripe` |
| 8 | Orders + polish | `/admin/orders` |
| 9 | Deploy | production |

---

## Dependencies (suggested)

| Package | Use |
|---------|-----|
| `github.com/gofiber/fiber/v3` | HTTP framework (Fiber v3) |
| `github.com/jackc/pgx/v5` | PostgreSQL |
| `github.com/golang-jwt/jwt/v5` | JWT verify |
| `github.com/stripe/stripe-go/v76` | Stripe |
| `github.com/joho/godotenv` | .env loading |

---

## Milestones

1. Health endpoint live
2. Products API live
3. Admin can add/delete products
4. Clerk protects routes
5. Cart works per user
6. Images on products
7. Stripe payment → order created
8. Admin sees orders
9. Deployed
