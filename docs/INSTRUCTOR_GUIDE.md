# Sopify — 1-Month Instructor Guide

**Duration:** 4 weeks · ~3 sessions/week (12 sessions total)  
**Teaching script:** [TEACHING_STEPS.md](TEACHING_STEPS.md) · [steps/](steps/) (one `.md` per step with code)  
**Stack:** Go/Fiber backend + Next.js frontend + PostgreSQL + Stripe  
**Reference solution:** this repo (`sopify/`)  
**Student cheatsheets:** [backend/CHEATSHEET.md](backend/CHEATSHEET.md) · [frontend/CHEATSHEET.md](frontend/CHEATSHEET.md)  
**Frontend starter assets:** [frontend/assets/](frontend/assets/)

---

## Before week 1 (you do this once)

- [ ] Install on your machine: Go 1.25+, Node 20+, PostgreSQL, Stripe CLI, **Postman**
- [ ] Clone repo, run `make setup` in `backend/`, confirm **Health check** in Postman
- [ ] Import `docs/backend/Sopify.postman_collection.json` into Postman
- [ ] Run `npm install && npm run dev` in `frontend/`, confirm `localhost:3000`
- [ ] Create Stripe test account; add keys to `backend/.env`
- [ ] Test full flow once yourself: register → cart → checkout → webhook → orders
- [ ] Share with students:
  - Cheatsheets (print or PDF)
  - Postman collection: `docs/backend/Sopify.postman_collection.json`
  - Asset zip from `docs/frontend/assets/`
  - Seed admin: `admin@sopify.com` / `Abc123@@`

**Teaching rule:** One small step per task. Students verify with **Postman** (backend) or browser (frontend) before moving on.

---

## Weekly map

| Week | Backend | Frontend | Demo at end of week |
|------|---------|----------|---------------------|
| 1 | Skeleton, DB, products, categories | Next setup, product list + detail | Browse shop |
| 2 | JWT auth, cart | Login, register, cart UI | Add to cart while logged in |
| 3 | Admin CRUD, image upload | Admin panel, product modal | Admin creates product with image |
| 4 | Stripe checkout, webhooks, orders | Checkout, orders pages | Pay in test mode, see order |

---

# Week 1 — Foundation & products

## Session 1 — Environment & backend skeleton (~90 min)

**Goal:** Everyone runs Postgres + Go API with health check.

### You teach (15 min)
- Monorepo layout: `backend/` + `frontend/`
- Layered Go architecture: `cmd` → handlers → repository → DB
- What REST + JSON means for this course

### Students build — Backend Phase 1
1. Init Go module, install Fiber v3
2. Create folders: `cmd/api`, `internal/config`, `internal/handlers`
3. `config.Load()` from `.env` (`PORT`, `DATABASE_URL`, `JWT_SECRET`)
4. `cmd/api/main.go` — Fiber app, `GET /health` → `{ "status": "ok", "app": "sopify" }`
5. Copy `.env.example` → `.env`, create local Postgres database `sopify`

### Verify checkpoint
1. `cd backend && make run` (or `make run`)
2. Postman → **Health → Health check** → Send
3. Expect `200` and `{ "status": "ok", "app": "sopify" }` (DB ping comes in week 4)

### Homework
- Install Node.js if missing
- Read backend cheatsheet “Project layout” + “Layer cheat sheet”

---

## Session 2 — Database & products API (~90 min)

**Goal:** Products in PostgreSQL, public read endpoints.

### You teach (10 min)
- Migrations vs seed data
- Repository pattern (SQL only, no HTTP in repo)

### Students build — Backend Phase 2
1. `internal/database/postgres.go` — connect with `pgx`
2. Migration `001_create_products.sql`
3. Migration `006_create_categories.sql` (+ `category_id` on products)
4. `models/product.go`, `repository/product.go`, `repository/category.go`
5. Handlers: `GET /products`, `GET /products/:id`, `GET /categories`
6. `make migrate` + `make seed`
7. CORS middleware for `http://localhost:3000`

### Verify checkpoint
1. `make setup` (migrate + seed)
2. Postman → **Products → List products** → array of products
3. Postman → **Products → List categories** → array of categories
4. Copy a `productId` and `categoryId` into collection variables for later labs

### Homework
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router

---

## Session 3 — Frontend products UI (~90 min)

**Goal:** Next.js storefront shows API products.

### You teach (10 min)
- Server Components vs Server Actions
- Why JWT will live in httpOnly cookie (preview week 2)

### Students build — Frontend Phase 1–2
1. Copy assets from `docs/frontend/assets/`:
   - `globals.css` → `app/globals.css`
   - `placeholder.png` → `public/placeholder.png`
   - `.env.local.example` → `.env.local`
   - `utils.ts` → `lib/utils.ts`
   - `next.config.ts` → project root
2. `lib/types.ts` — `Product`, `Category`
3. `lib/api.ts` — axios wrapper, `NEXT_PUBLIC_API_URL`
4. `actions/products.ts` — `getProducts()`, `getProductById()`
5. `components/product-card.tsx`
6. `app/products/page.tsx` — grid of cards
7. `app/products/[id]/page.tsx` — detail page
8. `components/header.tsx` + wire in `layout.tsx`

### Verify checkpoint
- `http://localhost:3000/products` shows seeded products
- Click product → detail page with image, price, stock

### Week 1 demo
Live: home → products → product detail. No auth yet.

---

# Week 2 — Auth & cart

## Session 4 — JWT auth backend (~90 min)

**Goal:** Register, login, protected `/me`.

### You teach (15 min)
- bcrypt + JWT flow
- `Authorization: Bearer <token>` header
- Logout = clear token in DB

### Students build — Backend Phase 4
1. Migration `004_recreate_users.sql`
2. `internal/auth/jwt.go` — sign/verify
3. `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
4. `GET /me`
5. Middleware: `RequireAuth`, `RequireAdmin`
6. Re-run seed for admin user

### Verify checkpoint
1. Postman → **Auth → Register** (edit email if needed) → `200` + token
2. Postman → **Auth → Login as student** → saves `token` automatically
3. Postman → **Auth → Me** → returns user JSON

---

## Session 5 — Auth UI (~90 min)

**Goal:** Login/register forms, header shows user state.

### Students build — Frontend Phase 3
1. `lib/auth.ts` — cookie helpers (`sopify_token`, httpOnly)
2. `actions/auth.ts` — `login`, `register`, `logout`
3. `lib/session.ts` — `getMe()`
4. `app/login/page.tsx` + `components/login-form.tsx`
5. `app/register/page.tsx` + `components/register-form.tsx`
6. Header: Login/Register when logged out

### Verify checkpoint
- Register new user → redirected to products
- Refresh → header shows logged-in state
- Logout → session cleared

---

## Session 6 — Cart backend + frontend (~90 min)

**Goal:** Full cart flow for logged-in users.

### Students build — Backend Phase 5
1. Migration `005_create_cart_items.sql`
2. `GET /cart`, `POST /cart`, `PATCH /cart/:product_id`, `DELETE /cart/:product_id`
3. Validate stock; merge duplicate product lines

### Students build — Frontend Phase 4
1. Types: `CartItem`, `CartResponse`
2. `actions/cart.ts`
3. `components/add-to-cart-form.tsx` on product detail
4. `app/cart/page.tsx` — redirect if not logged in
5. `components/cart-contents.tsx`, remove button
6. Header cart link

### Verify checkpoint
1. Postman → set `productId` variable (from List products)
2. Postman → **Cart → Add to cart** → `200`
3. Postman → **Cart → Get cart** → items + total
4. Browser: add item → `/cart` shows line items + total

### Week 2 demo
Register → browse → add to cart → view cart.

---

# Week 3 — Admin & images

## Session 7 — Admin product CRUD (~90 min)

**Goal:** Admin can create/edit/delete products (JSON first).

### You teach (10 min)
- Role-based access: `customer` vs `admin`
- Why admin routes are a separate group in Fiber

### Students build — Backend Phase 3
1. `POST /admin/products`, `PATCH /admin/products/:id`, `DELETE /admin/products/:id`
2. Input validation (price > 0, stock ≥ 0, category_id required)
3. Protect with `RequireAdmin`

### Verify checkpoint
1. Postman → **Auth → Login (saves token)** with `admin@sopify.com` / `Abc123@@`
2. Postman → set `categoryId` variable
3. Postman → **Admin — Products → Create product (JSON)** → `201` + product

---

## Session 8 — Image upload backend (~60 min)

**Goal:** Admin uploads product images to local storage.

### Students build — Backend Phase 6
1. `internal/storage/local.go`
2. Multipart `POST/PATCH /admin/products` with `image` field
3. Serve files at `GET /uploads/*`
4. PATCH with empty file keeps existing image

### Verify checkpoint
1. Postman → **Admin — Products → Create product (with image)**
2. Body → **form-data** → pick an image file for the `image` field
3. Open returned `image_url` in browser: `http://localhost:8080/uploads/...`

---

## Session 9 — Admin UI (~90 min)

**Goal:** Browser-based product management.

### Students build — Frontend Phase 6
1. `actions/admin.ts` — `createProduct`, `updateProduct`, `deleteProduct` (FormData)
2. `app/admin/layout.tsx` — guard `role === "admin"`
3. `components/admin-products-panel.tsx`, `product-modal.tsx`
4. `components/admin-nav.tsx`
5. `actions/categories.ts` for category dropdown

### Verify checkpoint
- Login as admin → `/admin`
- Create product with image → appears on `/products`
- Edit without re-uploading image → image preserved

### Week 3 demo
Admin creates product with photo; student sees it in shop.

---

# Week 4 — Payments, orders & wrap-up

## Session 10 — Stripe checkout (~90 min)

**Goal:** Pay for cart via Stripe test mode.

### You teach (20 min)
- Stripe Checkout vs custom payment form
- Webhook flow: who creates the order (backend, not frontend)
- Run `stripe listen` in a separate terminal

### Students build — Backend Phase 7
1. Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`
2. `POST /checkout` → Stripe session URL
3. Migration `007_create_orders.sql`
4. `POST /webhooks/stripe` — on `checkout.session.completed`:
   - Create order + order items
   - Decrement stock
   - Clear cart
   - Idempotency via `stripe_session_id`

### Students build — Frontend Phase 7
1. `actions/checkout.ts`
2. `components/checkout-button.tsx` on cart page
3. `app/checkout/success/page.tsx`, `app/checkout/cancel/page.tsx`

### Verify checkpoint
```bash
# Terminal 1: backend
# Terminal 2:
stripe listen --forward-to localhost:8080/webhooks/stripe
# Copy whsec_... to .env, restart API
```
- Pay with test card `4242 4242 4242 4242`
- Cart empties after webhook
- Order row in database

---

## Session 11 — Orders UI (~90 min)

**Goal:** Customers and admins view order history.

### Students build — Backend Phase 8 (remaining)
1. `GET /orders` — current user's orders
2. `GET /admin/orders` — all orders with customer email
3. `GET /health` — DB ping (503 if DB down)
4. Graceful shutdown on `SIGINT`/`SIGTERM`

### Students build — Frontend Phase 8
1. `actions/orders.ts`
2. `app/orders/page.tsx` + `my-orders-list.tsx`
3. `app/admin/orders/page.tsx` + `admin-orders-panel.tsx`
4. `components/user-account-menu.tsx` — My orders, admin links

### Verify checkpoint
- Customer sees own orders at `/orders`
- Admin sees all orders at `/admin/orders`

---

## Session 12 — Polish & final demo (~60 min)

**Goal:** Ship-ready local app; recap architecture.

### Optional polish (pick 1–2 if time)
- `loading.tsx` / `error.tsx` on key routes
- Product search on `/products`
- Home page featured products

### Final student demo checklist
- [ ] Browse products (guest)
- [ ] Register / login
- [ ] Add to cart, update quantity
- [ ] Checkout with Stripe test card
- [ ] View order on `/orders`
- [ ] Admin: manage products + view all orders

### Homework stretch (post-course)
- `PATCH /admin/orders/:id/status` → `shipped`
- Deploy backend (Railway/Fly) + frontend (Vercel)

---

## Session timing cheat sheet

| Session | Focus | If running 2×/week, merge |
|---------|-------|---------------------------|
| 1 | Backend skeleton | Week 1 = sessions 1–2 |
| 2 | Products API | |
| 3 | Frontend products | |
| 4 | Auth backend | Week 2 = sessions 4–5 |
| 5 | Auth UI | |
| 6 | Cart full stack | Week 2 end = session 6 |
| 7 | Admin CRUD | Week 3 = sessions 7–8 |
| 8 | Image upload | |
| 9 | Admin UI | Week 3 end = session 9 |
| 10 | Stripe | Week 4 = sessions 10–11 |
| 11 | Orders | |
| 12 | Demo + recap | Week 4 end |

---

## When students get stuck

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| CORS error | Frontend not on `:3000` | Check backend CORS origin |
| 401 on cart | No token / wrong cookie | Login again; check `sopify_token` |
| 403 on admin | Not admin user | Use `admin@sopify.com` |
| Empty products | No seed | `make seed` |
| Cart not clearing after pay | Webhook failed | `stripe listen` running? `STRIPE_WEBHOOK_SECRET` matches? |
| Image broken | `next.config` patterns | Copy from `docs/frontend/assets/next.config.ts` |
| PATCH loses image | Empty file sent | Skip upload when file size is 0 |

---

## Your prep checklist (each session)

1. Pull latest solution branch
2. Run backend + frontend locally
3. Open relevant cheatsheet section on screen
4. Prepare 1–2 Postman requests for verify step (use imported collection)
5. End with working demo, not slides

---

## Related files in this repo

| File | Use |
|------|-----|
| `backend/backend_plan.md` | Full backend task list |
| `frontend/frontend_plan.md` | Full frontend task list |
| `docs/backend/CHEATSHEET.md` | Give to students — backend |
| `docs/frontend/CHEATSHEET.md` | Give to students — frontend |
| `docs/backend/Sopify.postman_collection.json` | Import into Postman — all API requests |
| `docs/frontend/assets/` | CSS, placeholder, env, utils |
