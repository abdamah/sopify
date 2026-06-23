# Sopify Frontend Plan

**Stack:** Next.js · TypeScript · Tailwind CSS · shadcn/ui · Server Actions  
**Backend:** Go API at `http://localhost:8080` (see [backend_plan.md](../backend/backend_plan.md))

**Principles:** Simple, clean UI. One small step at a time. No over-engineering.

---

## Goal

Build a storefront UI for Sopify: browse products, login/register, manage cart — powered by the Go REST API via **Server Actions** (not Next.js API routes).

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

## Project layout (target)

```
frontend/
├── app/
│   ├── layout.tsx              # root layout + header
│   ├── page.tsx                # home
│   ├── products/
│   │   ├── page.tsx            # product list
│   │   └── [id]/page.tsx       # product detail
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── cart/page.tsx
├── actions/
│   ├── products.ts
│   ├── auth.ts
│   └── cart.ts
├── components/
│   ├── header.tsx
│   ├── product-card.tsx
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── ui/                     # shadcn components
├── lib/
│   ├── api.ts
│   ├── types.ts
│   └── utils.ts
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
| POST | `/admin/products` | admin | 6 |
| PATCH | `/admin/products/:id` | admin | 6 |
| DELETE | `/admin/products/:id` | admin | 6 |

---

## Types (`lib/types.ts`)

Match Go JSON (snake_case):

```ts
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
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
- [ ] Simple header in `layout.tsx` (logo + nav links) — optional polish, can do in Phase 2.8

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

### 3.3 — `actions/auth.ts`

- [x] `register(email, password)` → `POST /auth/register` → set cookie
- [x] `login(email, password)` → `POST /auth/login` → set cookie
- [x] `logout()` → `POST /auth/logout` with token → clear cookie
- [x] `getMe()` → `GET /me` with token (return `null` if not logged in)

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
- [x] Show email + Logout when logged in
- [x] Logout button calls `logout` action

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

# Phase 6 — Admin UI (later, when backend ready)

**Goal:** Admin product management in the browser.

Depends on backend Phase 6+ (Cloudflare Images, etc.).

### Tasks

- [x] `actions/admin.ts` — `createProduct`, `updateProduct`, `deleteProduct`
- [x] Admin layout or `/admin` routes
- [x] Guard: only show if `user.role === "admin"`
- [x] Create product form → `POST /admin/products`
- [x] Edit product modal → `PATCH /admin/products/:id`
- [x] Delete product → `DELETE /admin/products/:id`
- [ ] Image upload when backend supports multipart

---

# Phase 7 — Checkout UI (later)

**Goal:** Stripe checkout flow.

Depends on backend Phase 7 (`POST /checkout`, webhooks).

### Tasks

- [ ] Checkout button on cart page
- [ ] Redirect to Stripe Checkout session
- [ ] Success / cancel pages

---

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

# Terminal 2 — frontend
cd frontend && npm run dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Frontend |
| http://localhost:8080 | Go API |
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
| 6 — Admin | In progress |
| 7 — Checkout | Not started |

---

## Notes

- **No React Query / Zustand** for now — Server Actions + `useTransition` is enough.
- **No Next.js API routes** unless a future feature requires a public HTTP endpoint (e.g. webhooks).
- Keep pages as **Server Components** where possible; use `"use client"` only for forms and interactive buttons.
- Match backend JSON field names (`image_url`, not `imageUrl`) in types and components.
