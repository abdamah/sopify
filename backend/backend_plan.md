# Sopify Backend Plan

**Author:** Abdallah  
**Stack:** Go · Fiber v3 · PostgreSQL · JWT auth · Stripe

**Module:** `github.com/abdamah/dailykode/sopify/backend`  
**Requires:** Go 1.25+ (Fiber v3)

---

## Goal

Build a simple REST API that powers Sopify: products, cart, checkout, orders, and admin — with custom JWT auth (`/auth/register`, `/auth/login`).

---

## Project layout

```
backend/
├── cmd/api/main.go
├── internal/
│   ├── auth/          # JWT sign/verify
│   ├── config/        # env vars
│   ├── database/      # postgres connection
│   ├── handlers/      # HTTP handlers
│   ├── middleware/    # JWT auth, admin, CORS, logger
│   ├── models/        # structs
│   ├── repository/    # DB queries
│   └── storage/       # local product image uploads
├── migrations/
├── scripts/seed/      # products, categories, admin user
├── .env.example
└── go.mod
```

---

## Database

| Table | Key fields |
|-------|------------|
| `users` | id, email, password_hash, role, active |
| `categories` | id, name, slug |
| `products` | id, name, description, price, image_url, stock, category_id |
| `cart_items` | id, user_id, product_id, quantity |
| `orders` | id, user_id, total, status, stripe_session_id |
| `order_items` | id, order_id, product_id, quantity, price |

**Order status:** `pending` → `paid` → `shipped` → `cancelled`

---

## API overview

| Method | Route | Auth | Status |
|--------|-------|------|--------|
| GET | `/health` | — | Done |
| GET | `/categories` | — | Done |
| GET | `/products` | — | Done |
| GET | `/products/:id` | — | Done |
| POST | `/auth/register` | — | Done |
| POST | `/auth/login` | — | Done |
| POST | `/auth/logout` | user | Done |
| GET | `/me` | user | Done |
| GET | `/cart` | user | Done |
| POST | `/cart` | user | Done |
| PATCH | `/cart/:product_id` | user | Done |
| DELETE | `/cart/:product_id` | user | Done |
| POST | `/checkout` | user | Done |
| GET | `/orders` | user | Done |
| POST | `/webhooks/stripe` | Stripe sig | Done |
| POST | `/admin/products` | admin | Done |
| PATCH | `/admin/products/:id` | admin | Done |
| DELETE | `/admin/products/:id` | admin | Done |
| GET | `/admin/orders` | admin | Done |

Static: `GET /uploads/*` — served product images from local `uploads/` dir.

---

# Phase 1 — Project skeleton

**Goal:** Folder structure + Fiber v3 app + `GET /health` only.

### Tasks

- [x] Init Go module: `github.com/abdamah/dailykode/sopify/backend`
- [x] Install Fiber v3
- [x] Create folder layout (`cmd/`, `internal/`, `migrations/`)
- [x] `cmd/api/main.go` — start Fiber server
- [x] `GET /health` → `{ "status": "ok", "app": "sopify" }`

---

# Phase 2 — Database + products API

**Goal:** PostgreSQL connected + public product endpoints.

### Tasks

- [x] Load config from `.env` (`PORT`, `DATABASE_URL`, `JWT_SECRET`)
- [x] Connect PostgreSQL
- [x] Migration: `products` table
- [x] Migration: `categories` table + `products.category_id`
- [x] `GET /categories` — list categories
- [x] `GET /products` — list all (optional `?category=slug` filter)
- [x] `GET /products/:id` — single product with nested category
- [x] Seed products + categories (`make seed`)
- [x] CORS middleware for Next.js origin

---

# Phase 3 — Admin product CRUD

**Goal:** Create, update, and delete products.

### Tasks

- [x] `POST /admin/products` — multipart form fields + optional image
- [x] `PATCH /admin/products/:id` — update fields; image optional (keeps existing if empty)
- [x] `DELETE /admin/products/:id`
- [x] Input validation (price > 0, name required, stock ≥ 0, category_id)
- [x] Repository layer: `CreateProduct`, `UpdateProduct`, `DeleteProduct`, `ListProducts`, `GetProduct`

---

# Phase 4 — JWT auth

**Goal:** Register/login; protect routes with Bearer token.

### Tasks

- [x] `POST /auth/register` — create user, return JWT
- [x] `POST /auth/login` — verify password, return JWT
- [x] `POST /auth/logout` — authenticated logout
- [x] Migration: `users` table (email, password_hash, role)
- [x] `GET /me` — current user from JWT
- [x] `RequireAuth` middleware
- [x] `RequireAdmin` middleware
- [x] Seed admin: `admin@sopify.com` / `Abc123@@` (`make seed`)

---

# Phase 5 — Cart

**Goal:** Logged-in users manage cart.

### Tasks

- [x] Migration: `cart_items` table
- [x] `GET /cart` — items + product details + total
- [x] `POST /cart` — `{ product_id, quantity }` (merge if exists)
- [x] `PATCH /cart/:product_id` — update quantity
- [x] `DELETE /cart/:product_id`
- [x] All cart routes behind `RequireAuth`
- [x] Validate product exists and stock available
- [x] Prevent quantity > stock; return 400 with message

---

# Phase 6 — Product image upload (local)

**Goal:** Admin uploads product image on create/update.

### Tasks

- [x] `POST/PATCH /admin/products` — multipart: fields + `image` file
- [x] Local storage in `uploads/` + serve at `/uploads/*`
- [x] Save `image_url` on product
- [x] Validate file type (jpeg, png, webp) and max size (5MB)
- [x] Protect `/admin/*` with `RequireAdmin`
- [x] PATCH: empty file input keeps existing image

---

# Phase 7 — Stripe checkout

**Goal:** Pay for cart; webhook creates order.

### Tasks

- [x] Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`
- [x] `POST /checkout` — build line items from cart → Stripe Checkout Session → `{ url }`
- [x] `POST /webhooks/stripe` — verify signature (`IgnoreAPIVersionMismatch` for Stripe CLI)
- [x] On `checkout.session.completed`:
  - Create `orders` + `order_items`
  - Set status `paid`
  - Decrement `products.stock`
  - Clear user cart
- [x] Migrations: `orders`, `order_items`
- [x] Idempotency: skip duplicate events by `stripe_session_id`
- [x] Store `stripe_session_id` on order

### Local webhook testing

```bash
stripe listen --forward-to localhost:8080/webhooks/stripe
# Copy whsec_... into STRIPE_WEBHOOK_SECRET, restart API
```

---

# Phase 8 — Orders

**Goal:** Admin and customers can view orders.

### Tasks

- [x] `GET /admin/orders` — all orders with items + customer email
- [x] `GET /orders` — current user's orders with items + product names
- [ ] `PATCH /admin/orders/:id/status` → `shipped` (homework)
- [ ] Consistent JSON error format: `{ "error": "message" }` (mostly done)
- [x] Request logging middleware
- [ ] Graceful shutdown (`SIGINT`)
- [ ] Health check includes DB ping

### Deliverable

Admin lists all orders; customer lists own orders at `GET /orders`.

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
DATABASE_URL=postgres://user:password@localhost:5432/sopify?sslmode=disable
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRY=24h
UPLOAD_DIR=uploads
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Phase summary

| Phase | Focus | Key endpoints |
|-------|--------|----------------|
| 1 | Skeleton + health | `/health` |
| 2 | DB + products + categories | `/products`, `/categories` |
| 3 | Admin CRUD | `/admin/products` |
| 4 | JWT auth | `/auth/*`, `/me` |
| 5 | Cart | `/cart` |
| 6 | Local image upload | multipart `/admin/products` |
| 7 | Stripe | `/checkout`, `/webhooks/stripe` |
| 8 | Orders | `/orders`, `/admin/orders` |
| 9 | Deploy | production |

---

## Dependencies

| Package | Use |
|---------|-----|
| `github.com/gofiber/fiber/v3` | HTTP framework |
| `github.com/jackc/pgx/v5` | PostgreSQL driver |
| `github.com/golang-jwt/jwt/v5` | JWT sign/verify |
| `github.com/stripe/stripe-go/v82` | Stripe Checkout + webhooks |
| `github.com/joho/godotenv` | .env loading |
| `golang.org/x/crypto` | bcrypt password hashing |

---

## Milestones

1. [x] Health endpoint live
2. [x] Products + categories API live
3. [x] Admin can CRUD products
4. [x] JWT auth protects routes
5. [x] Cart works per user
6. [x] Images on products (local upload)
7. [x] Stripe payment → order created, stock decremented, cart cleared
8. [x] Admin + customer order listing
9. [ ] Deployed
