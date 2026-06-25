# Sopify Frontend Plan

**Stack:** Next.js · TypeScript · Tailwind CSS · shadcn/ui · Server Actions  
**Backend:** Go API at `http://localhost:8080` (see [backend_plan.md](../backend/backend_plan.md))

**Principles:** Simple, clean UI. One small step at a time. No over-engineering.

---

## Goal

Build a storefront UI for Sopify: browse products, login/register, manage cart, checkout with Stripe, and view orders — powered by the Go REST API via **Server Actions** (not Next.js API routes).

---

## Architecture

```
Browser
   │
   ▼
Next.js (localhost:3000)
   ├── Server Components  →  await getProducts()
   ├── Client Components  →  form → login() action
   └── Server Actions     →  lib/api.ts  →  Go API (localhost:8080)
```

| Layer | Role |
|-------|------|
| **Server Actions** (`actions/*.ts`) | UI-facing functions (`"use server"`) |
| **lib/api.ts** | Low-level fetch to Go API (server-only) |
| **lib/types.ts** | TypeScript types matching Go JSON |
| **httpOnly cookie** | Store JWT for auth (read in actions) |

**Why Server Actions (not `/api` routes)?** Actions call Go directly — fewer layers, no extra REST surface in Next.js. Use Next.js API routes later only if needed (e.g. Stripe webhooks).

---

## Project layout (current)

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── [id]/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── cart/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── checkout/
│   │   ├── success/page.tsx
│   │   └── cancel/page.tsx
│   ├── orders/page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── loading.tsx
│       ├── error.tsx
│       └── orders/
│           ├── page.tsx
│           └── loading.tsx
├── actions/
│   ├── products.ts
│   ├── categories.ts
│   ├── auth.ts
│   ├── cart.ts
│   ├── checkout.ts
│   ├── orders.ts
│   └── admin.ts
├── components/
│   ├── header.tsx
│   ├── header-search.tsx
│   ├── user-account-menu.tsx
│   ├── cart-link.tsx
│   ├── cart-contents.tsx
│   ├── cart-quantity-controls.tsx
│   ├── checkout-button.tsx
│   ├── add-to-cart-form.tsx
│   ├── remove-cart-item-button.tsx
│   ├── product-card.tsx
│   ├── products-list.tsx
│   ├── product-modal.tsx
│   ├── admin-nav.tsx
│   ├── admin-products-panel.tsx
│   ├── admin-orders-panel.tsx
│   ├── my-orders-list.tsx
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── ui/                     # shadcn components
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── session.ts              # getMe()
│   ├── types.ts
│   ├── utils.ts                # formatPrice, cn
│   ├── errors.ts               # getApiErrorMessage
│   ├── validation.ts
│   └── cart-events.ts
├── .env.local
└── next.config.ts
```

---

## Environment

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Backend CORS already allows `http://localhost:3000`.

---

## Backend endpoints used

| Method | Route | Auth | Frontend phase |
|--------|-------|------|----------------|
| GET | `/health` | — | — (ops) |
| GET | `/categories` | — | 2 |
| GET | `/products` | — | 2 |
| GET | `/products/:id` | — | 2 |
| POST | `/auth/register` | — | 3 |
| POST | `/auth/login` | — | 3 |
| POST | `/auth/logout` | user | 3 |
| GET | `/me` | user | 3 |
| GET | `/cart` | user | 4 |
| POST | `/cart` | user | 4 |
| PATCH | `/cart/:product_id` | user | 4 |
| DELETE | `/cart/:product_id` | user | 4 |
| POST | `/checkout` | user | 7 |
| GET | `/orders` | user | 8 |
| POST | `/admin/products` | admin | 6 |
| PATCH | `/admin/products/:id` | admin | 6 |
| DELETE | `/admin/products/:id` | admin | 6 |
| GET | `/admin/orders` | admin | 8 |

Stripe webhooks (`POST /webhooks/stripe`) are handled by the Go API only — not the Next.js frontend.

---

## Types (`lib/types.ts`)

Match Go JSON (snake_case):

```ts
type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category_id: string;
  category: Category;
  created_at: string;
  updated_at: string;
};

type User = {
  id: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

type CartItem = {
  id: string;
  quantity: number;
  product: Product;
  line_total: number;
};

type CartResponse = {
  items: CartItem[];
  total: number;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  price: number;
  created_at: string;
};

type Order = {
  id: string;
  user_id: string;
  user_email?: string;
  total: number;
  status: string;
  stripe_session_id?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
};
```

Add types incrementally — Product first, then User/Auth, then Cart.

---

# Phase 1 — Setup

**Goal:** Next.js app with Tailwind, shadcn, env — minimal shell.

### Tasks

- [x] Create Next.js app (TypeScript, Tailwind, App Router)
- [x] Init shadcn/ui (`button` component)
- [x] Add `.env.local` with `NEXT_PUBLIC_API_URL`
- [x] Root layout + placeholder home page
- [x] Simple header in `layout.tsx` (logo + nav links)

### Verify

```bash
cd frontend && npm run dev
# http://localhost:3000 loads, shadcn Button renders
```

---

# Phase 2 — Products UI

**Goal:** Browse products and view details. No auth yet.

Do **one sub-step at a time**. Verify before moving on.

### 2.1 — `lib/types.ts`

- [x] Define `Product` type matching Go API

**Done when:** TypeScript knows the product shape; no UI yet.

---

### 2.2 — `lib/api.ts`

- [x] Install `server-only`
- [x] Create fetch helper using `NEXT_PUBLIC_API_URL`
- [x] Support optional `token` for later auth
- [x] `cache: "no-store"` for fresh data

**Done when:** `api("/products")` works from a server file.

---

### 2.3 — `actions/products.ts`

- [x] `"use server"`
- [x] `getProducts()` → `GET /products`
- [x] `getProductById(id)` → `GET /products/:id` (return `null` on 404)

**Done when:** Actions return real product data from Go API.

---

### 2.4 — `next.config.ts`

- [x] Add `images.remotePatterns` for `placehold.co` (seed images)

**Done when:** Next.js `<Image>` accepts product image URLs.

---

### 2.5 — `components/product-card.tsx`

- [x] Add shadcn `card`: `npx shadcn@latest add card`
- [x] Image, name, price, link to `/products/[id]`

**Done when:** Card renders with hardcoded or real product props.

---

### 2.6 — `app/products/page.tsx`

- [x] Server Component calls `getProducts()`
- [x] Grid of `ProductCard` components

**Done when:** `http://localhost:3000/products` shows API products.

---

### 2.7 — `app/products/[id]/page.tsx`

- [x] Server Component calls `getProductById(id)`
- [x] `notFound()` if missing
- [x] Image, name, description, price, stock

**Done when:** Clicking a product opens detail page.

---

### 2.8 — Header / nav (optional)

- [x] `components/header.tsx` — Sopify title, link to `/products`
- [x] Wire into `app/layout.tsx`

**Done when:** Navigate to products from any page.

---

# Phase 3 — Auth UI

**Goal:** Register, login, logout, show current user. JWT in httpOnly cookie.

### 3.1 — Types

- [x] Add `User`, `AuthResponse` to `lib/types.ts`

---

### 3.2 — `lib/auth.ts` (cookie helpers)

- [x] `getToken()` — read cookie
- [x] `setToken(token)` — set httpOnly cookie
- [x] `clearToken()` — delete cookie
- [x] Cookie name: `sopify_token`

---

### 3.3 — `actions/auth.ts` + `lib/session.ts`

- [x] `register(email, password)` → `POST /auth/register` → set cookie
- [x] `login(email, password)` → `POST /auth/login` → set cookie
- [x] `logout()` → `POST /auth/logout` with token → clear cookie
- [x] `getMe()` in `lib/session.ts` → `GET /me` with token (return `null` if not logged in)

---

### 3.4 — Login page

- [x] Add Tailwind `input`, `label`
- [x] `app/login/page.tsx` + `components/login-form.tsx` (client)
- [x] Form calls `login` action, redirect to `/products` on success
- [x] Show error message on failure

---

### 3.5 — Register page

- [x] `app/register/page.tsx` + `components/register-form.tsx`
- [x] Form calls `register` action, redirect on success

---

### 3.6 — Header auth state

- [x] Show Login / Register when logged out
- [x] `UserAccountMenu` dropdown when logged in (My orders, Log out; admin links for admins)
- [x] Logout via dropdown calls `logout` action

**Done when:** Can register, login, see `/me` data in header, logout invalidates session.

---

# Phase 4 — Cart UI

**Goal:** Add to cart, view cart, remove items. Requires auth.

### 4.1 — Types

- [x] Add `CartItem`, `CartResponse` to `lib/types.ts`

---

### 4.2 — `actions/cart.ts`

- [x] `getCart()` → `GET /cart`
- [x] `addToCart(productId, quantity)` → `POST /cart`
- [x] `removeFromCart(productId)` → `DELETE /cart/:product_id`

All pass token from cookie.

---

### 4.3 — Add to cart (product detail)

- [x] Client component on product detail page
- [x] Quantity input (default 1)
- [x] Button calls `addToCart` action
- [x] Redirect to login if not authenticated (or show message)

---

### 4.4 — Cart page

- [x] `app/cart/page.tsx` — list items, line totals, cart total
- [x] Remove button per item
- [x] Empty state when cart is empty
- [x] Protect page: redirect to login if not authenticated

---

### 4.5 — Header cart link

- [x] Link to `/cart` in header (visible when logged in)

**Done when:** Full cart flow works against Go API.

---

# Phase 5 — Polish

**Goal:** Better UX, loading states, errors — still simple.

### Tasks

- [x] Loading UI (`loading.tsx` for products/cart)
- [x] Error boundaries or inline error messages
- [x] Home page links to products
- [x] Responsive grid (mobile-friendly)
- [x] `revalidatePath` after cart mutations so UI updates
- [x] Product search on `/products`
- [x] Admin `loading.tsx` and `error.tsx`

---

# Phase 6 — Admin UI

**Goal:** Admin product management in the browser.

### Tasks

- [x] `actions/admin.ts` — `createProduct`, `updateProduct`, `deleteProduct`
- [x] Admin layout or `/admin` routes
- [x] Guard: only show if `user.role === "admin"`
- [x] Create product form → `POST /admin/products`
- [x] Edit product modal → `PATCH /admin/products/:id`
- [x] Delete product → `DELETE /admin/products/:id`
- [x] Image upload — multipart `POST/PATCH /admin/products`, local `uploads/` storage

---

# Phase 7 — Checkout UI

**Goal:** Stripe checkout flow.

Depends on backend `POST /checkout` and Stripe webhooks.

### Tasks

- [x] `actions/checkout.ts` — `createCheckoutSession()` → `POST /checkout`
- [x] Checkout button on cart page (`components/checkout-button.tsx`)
- [x] Redirect to Stripe Checkout session URL
- [x] Success page (`/checkout/success`) and cancel page (`/checkout/cancel`)

**Done when:** Paying with Stripe clears the cart (via webhook) and user lands on success page.

---

# Phase 8 — Orders UI

**Goal:** Customer and admin order history.

### Tasks

- [x] `actions/orders.ts` — `getMyOrders()`, `getAdminOrders()`
- [x] Customer orders page (`/orders`) + `MyOrdersList`
- [x] Admin orders page (`/admin/orders`) + `AdminOrdersPanel`
- [x] "My orders" link in `UserAccountMenu`
- [x] Admin nav in `admin/layout.tsx` (Products, Orders)

**Done when:** Logged-in users see their orders; admins see all orders with customer email.

---

# Phase 9 — Deploy (later)

**Goal:** Production deployment (Vercel + hosted API/DB).

Not started.

## shadcn components (add as needed)

| Phase | Components |
|-------|------------|
| 1 | `button` |
| 2 | `card` |
| 3 | `input`, `label` |
| 4 | — (reuse button) |
| 5+ | `badge`, `separator` if needed |

---

## Dev workflow

```bash
# Terminal 1 — backend
cd backend && make run

# Terminal 2 — Stripe webhooks (local dev)
stripe listen --forward-to localhost:8080/webhooks/stripe

# Terminal 3 — frontend
cd frontend && npm run dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Frontend |
| http://localhost:8080 | Go API |
| http://localhost:8080/health | Health + DB ping |
| http://localhost:8080/products | Quick API check |

**Seed admin (backend):** `admin@sopify.com` / `Abc123@@` via `make seed`

---

## Progress tracker

| Phase | Status |
|-------|--------|
| 1 — Setup | Done |
| 2 — Products | Done |
| 3 — Auth | Done |
| 4 — Cart | Done |
| 5 — Polish | Done |
| 6 — Admin | Done |
| 7 — Checkout | Done |
| 8 — Orders | Done |
| 9 — Deploy | Not started |

---

## Notes

- **No React Query / Zustand** for now — Server Actions + `useTransition` is enough.
- **No Next.js API routes** — Stripe webhooks stay on the Go API.
- Keep pages as **Server Components** where possible; use `"use client"` only for forms and interactive buttons.
- Match backend JSON field names (`image_url`, not `imageUrl`) in types and components.
- Brand accent color: orange `#F97315`.
