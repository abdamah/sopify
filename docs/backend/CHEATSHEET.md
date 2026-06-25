# Sopify Backend — Cheatsheet

**Stack:** Go 1.25+ · Fiber v3 · PostgreSQL · JWT · bcrypt · Stripe  
**Module:** `github.com/abdamah/dailykode/sopify/backend`  
**URL:** `http://localhost:8080`

---

## Quick start

```bash
cd backend
cp .env.example .env          # edit DATABASE_URL, JWT_SECRET
make setup                    # migrate + seed
make run
```

Then in **Postman**: import `docs/backend/Sopify.postman_collection.json` → run **Health check**.

**Seed admin:** `admin@sopify.com` / `Abc123@@`

| Command | What it does |
|---------|----------------|
| `make run` | Start API |
| `make migrate` | Run SQL migrations |
| `make seed` | Seed categories, products, admin |
| `make setup` | migrate + seed |

---

## Env vars

| Var | Required | Example |
|-----|----------|---------|
| `PORT` | no | `8080` |
| `DATABASE_URL` | yes | `postgres://user:pass@localhost:5432/sopify?sslmode=disable` |
| `JWT_SECRET` | yes | long random string |
| `JWT_EXPIRY` | no | `24h` |
| `UPLOAD_DIR` | no | `uploads` |
| `FRONTEND_URL` | for Stripe | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | for checkout | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | for webhooks | `whsec_...` (from `stripe listen`) |

---

## Project layout

```
backend/
├── cmd/api/main.go           # wire deps, routes, graceful shutdown
├── internal/
│   ├── config/               # .env
│   ├── database/             # postgres connect
│   ├── auth/                 # JWT
│   ├── models/               # structs + JSON tags
│   ├── repository/           # SQL only
│   ├── handlers/             # HTTP + routes.go
│   ├── middleware/           # auth, CORS, logger
│   └── storage/              # local image uploads
├── migrations/
└── scripts/seed/
```

**Flow:** `main` → handler → repository → PostgreSQL

**Add an endpoint:** model → repository → handler → `routes.go` → wire in `main.go`

---

## API routes

| Method | Route | Auth | Body / notes |
|--------|-------|------|--------------|
| GET | `/health` | — | DB ping; 503 if DB down |
| GET | `/categories` | — | — |
| GET | `/products` | — | `?category=slug` optional |
| GET | `/products/:id` | — | — |
| POST | `/auth/register` | — | `{ email, password }` |
| POST | `/auth/login` | — | `{ email, password }` |
| POST | `/auth/logout` | user | — |
| GET | `/me` | user | — |
| GET | `/cart` | user | — |
| POST | `/cart` | user | `{ product_id, quantity }` |
| PATCH | `/cart/:product_id` | user | `{ quantity }` — `0` removes |
| DELETE | `/cart/:product_id` | user | — |
| POST | `/checkout` | user | → `{ "url": "https://checkout.stripe.com/..." }` |
| GET | `/orders` | user | current user's orders |
| POST | `/webhooks/stripe` | Stripe sig | raw body |
| POST | `/admin/products` | admin | multipart: fields + optional `image` |
| PATCH | `/admin/products/:id` | admin | multipart; empty image = keep existing |
| DELETE | `/admin/products/:id` | admin | — |
| GET | `/admin/orders` | admin | all orders + customer email |

**Static:** `GET /uploads/*` — product images  
**Auth header:** `Authorization: Bearer <token>`  
**Errors:** `{ "error": "message" }`

---

## Health response

```json
// 200
{ "status": "ok", "app": "sopify", "database": "ok" }

// 503
{ "status": "error", "app": "sopify", "database": "unavailable" }
```

---

## Postman

**Import:** `docs/backend/Sopify.postman_collection.json`

### Setup (once)

1. Postman → **Import** → select `Sopify.postman_collection.json`
2. Collection **Variables** tab:
   - `baseUrl` = `http://localhost:8080`
   - `token` = (leave empty — filled by Login)
   - `productId` = copy from **List products** response
   - `categoryId` = copy from **List categories** response
3. Run **Auth → Login (saves token)** — the test script stores `token` automatically

### Auth for protected routes

Collection requests use **Bearer Token** → `{{token}}`.  
Or manually: Authorization tab → Type **Bearer Token** → paste token from login response.

### Request reference

| Folder | Request | Method | Body |
|--------|---------|--------|------|
| Health | Health check | GET | — |
| Products | List products | GET | — |
| Products | List products by category | GET | query `category=electronics` |
| Products | Get product by ID | GET | set `productId` variable |
| Products | List categories | GET | — |
| Auth | Register | POST | JSON `{ email, password }` |
| Auth | Login | POST | JSON — saves `token` |
| Auth | Me | GET | Bearer token |
| Auth | Logout | POST | Bearer token |
| Cart | Get cart | GET | Bearer token |
| Cart | Add to cart | POST | JSON `{ product_id, quantity }` |
| Cart | Update cart item | PATCH | JSON `{ quantity }` |
| Cart | Remove from cart | DELETE | — |
| Checkout | Create checkout session | POST | Bearer token → returns `{ url }` |
| Orders | My orders | GET | Bearer token |
| Orders | Admin — list orders | GET | Bearer token (admin) |
| Admin | Create product (JSON) | POST | JSON fields |
| Admin | Create product (with image) | POST | **form-data**: name, description, price, stock, category_id, image (file) |
| Admin | Update product | PATCH | **form-data** (image optional) |
| Admin | Delete product | DELETE | — |

### JSON body examples

**Register / Login:**
```json
{ "email": "user@test.com", "password": "password123" }
```

**Add to cart:**
```json
{ "product_id": "<uuid>", "quantity": 1 }
```

**Create product (admin, no image):**
```json
{
  "name": "Test",
  "description": "...",
  "price": 9.99,
  "stock": 10,
  "category_id": "<uuid>"
}
```

### Multipart (image upload)

**Body** tab → **form-data** (not raw JSON):

| Key | Type | Value |
|-----|------|-------|
| name | Text | Camera |
| description | Text | HD webcam |
| price | Text | 49.99 |
| stock | Text | 20 |
| category_id | Text | `<uuid>` |
| image | File | choose `.jpg` / `.png` / `.webp` |

Do **not** set `Content-Type` manually — Postman adds the boundary for multipart.

---

## Auth (JWT)

1. Register/login → bcrypt → sign JWT → store token on user row  
2. Protected routes → read `Bearer` token → verify JWT → load user → token must match DB  
3. Logout → clear `users.token`  
4. Admin → `user.role === "admin"`

| Role | Value |
|------|-------|
| Customer | `customer` |
| Admin | `admin` |

---

## Database tables

| Table | Key fields |
|-------|------------|
| `users` | id, email, password, role, active, token |
| `categories` | id, name, slug |
| `products` | id, name, description, price, image_url, stock, category_id |
| `cart_items` | user_id, product_id, quantity — UNIQUE(user_id, product_id) |
| `orders` | id, user_id, total, status, stripe_session_id |
| `order_items` | order_id, product_id, quantity, price |

**Order status:** `pending` → `paid` → `shipped` → `cancelled`

---

## Migrations (order)

| File | Creates |
|------|---------|
| `001_create_products.sql` | `products` |
| `002_create_users.sql` | legacy users |
| `004_recreate_users.sql` | `users` (JWT) |
| `005_create_cart_items.sql` | `cart_items` |
| `006_create_categories.sql` | `categories` + FK on products |
| `007_create_orders.sql` | `orders`, `order_items` |

---

## Stripe (local)

```bash
stripe listen --forward-to localhost:8080/webhooks/stripe
# Copy whsec_... → STRIPE_WEBHOOK_SECRET, restart API
```

**Test card:** `4242 4242 4242 4242`  
**Webhook event:** `checkout.session.completed` → create order, decrement stock, clear cart

---

## Business rules

| Rule | Where |
|------|-------|
| Price > 0 | product validation |
| Stock ≥ 0 | product validation |
| `category_id` must exist | product create/update |
| Cart qty ≤ stock | cart handler |
| PATCH qty ≤ 0 → delete line | cart handler |
| Duplicate email | 400 on register |
| Invalid token | 401 |
| Non-admin on `/admin/*` | 403 |
| Duplicate webhook | skip by `stripe_session_id` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `DATABASE_URL is required` | Create `.env` |
| `relation does not exist` | `make migrate` |
| Empty products | `make seed` |
| 401 | Login, pass Bearer token |
| 403 admin | Use admin account |
| CORS from browser | Frontend on `localhost:3000` |
| Webhook 400 | Check `STRIPE_WEBHOOK_SECRET`; use `stripe listen` |
| Cart not clearing | Webhook must succeed |

---

## Key packages

| Package | Use |
|---------|-----|
| `gofiber/fiber/v3` | HTTP |
| `jackc/pgx/v5` | PostgreSQL |
| `golang-jwt/jwt/v5` | JWT |
| `stripe/stripe-go/v82` | Checkout + webhooks |
| `joho/godotenv` | .env |
| `golang.org/x/crypto` | bcrypt |
