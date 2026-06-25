# Sopify Frontend — Cheatsheet

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Server Actions  
**API:** `http://localhost:8080` via `NEXT_PUBLIC_API_URL`  
**Design:** orange `#F97315` · Geist Sans · see `docs/frontend/assets/globals.css`

---

## Quick start

```bash
cd frontend
cp docs/frontend/assets/.env.local.example .env.local   # or from course zip
npm install
npm run dev
# http://localhost:3000
```

**Needs backend running:** `cd backend && make run`

---

## Architecture

```
Browser
   ▼
Next.js (:3000)
   ├── Server Components   →  await getProducts()
   ├── Client Components   →  forms, buttons ("use client")
   └── Server Actions      →  actions/*.ts → lib/api.ts → Go API
```

| Layer | Role |
|-------|------|
| `actions/*.ts` | `"use server"` — UI-facing API calls |
| `lib/api.ts` | Axios to Go API (server-only) |
| `lib/auth.ts` | httpOnly cookie `sopify_token` |
| `lib/session.ts` | `getMe()` |
| `lib/types.ts` | Types matching Go JSON (snake_case) |
| `lib/utils.ts` | `formatPrice`, `getProductImageUrl` |

**No Next.js API routes** — Stripe webhooks stay on Go backend.

---

## Env

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | — | Home, featured products |
| `/products` | — | Product grid + search |
| `/products/[id]` | — | Detail + add to cart |
| `/login` | guest | Login form |
| `/register` | guest | Register form |
| `/cart` | user | Cart page |
| `/checkout/success` | — | After Stripe pay |
| `/checkout/cancel` | — | Cancelled checkout |
| `/orders` | user | My orders |
| `/admin` | admin | Product management |
| `/admin/orders` | admin | All orders |

---

## Actions map

| File | Functions |
|------|-----------|
| `actions/products.ts` | `getProducts`, `getProductById` |
| `actions/categories.ts` | `getCategories` |
| `actions/auth.ts` | `login`, `register`, `logout` |
| `actions/cart.ts` | `getCart`, `addToCart`, `updateCartItem`, `removeFromCart` |
| `actions/checkout.ts` | `createCheckoutSession` |
| `actions/orders.ts` | `getMyOrders`, `getAdminOrders` |
| `actions/admin.ts` | `createProduct`, `updateProduct`, `deleteProduct` |

---

## Types (snake_case — match Go)

```ts
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

type User = { id; email; role; active; created_at; updated_at };
type CartResponse = { items: CartItem[]; total: number };
type Order = { id; user_id; total; status; items?; created_at; ... };
```

---

## Auth flow

1. `login` / `register` → API returns token → `setToken()` httpOnly cookie  
2. Server Actions read token via `getToken()`  
3. `getMe()` in `lib/session.ts` → `GET /me`  
4. `logout` → `POST /auth/logout` + `clearToken()`  
5. Protected pages: `const user = await getMe(); if (!user) redirect("/login")`  
6. Admin: `user.role === "admin"` or `notFound()`

---

## Images

```ts
// lib/utils.ts
getProductImageUrl(image_url)
// ""           → /placeholder.png
// "/uploads/x" → http://localhost:8080/uploads/x
// "https://..." → external URL (seed uses placehold.co)
```

**next.config.ts** — allow `placehold.co` and `localhost:8080/uploads/**`

Copy from `docs/frontend/assets/next.config.ts`.

---

## CSS utilities (globals.css)

| Class | Use |
|-------|-----|
| `site-container` | Max width 1180px |
| `page-title` | Page heading |
| `primary-button` | Main CTA (orange) |
| `secondary-button` | Secondary action |
| `product-card` | Product grid card |
| `auth-card` | Login/register card |
| `cart-summary` | Order summary sidebar |
| `admin-table` | Admin data table |
| `empty-state` | No items message |
| `skeleton` | Loading placeholder |

**Brand:** primary `#F97315`, accent bg `#FFF4EE`, border `#E8E8E8`

---

## Server vs client

| Server Component (default) | Client Component (`"use client"`) |
|----------------------------|----------------------------------|
| `page.tsx`, `layout.tsx` | Forms: login, register |
| `header.tsx` (fetch user) | `add-to-cart-form`, cart qty |
| Data fetching in page | `checkout-button`, modals |
| | `user-account-menu` dropdown |

---

## Common patterns

```ts
// Server Action
"use server";
import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function addToCart(productId: string, qty: number) {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");
  await api.post("/cart", { product_id: productId, quantity: qty }, token);
  revalidatePath("/cart");
}
```

```tsx
// Protected page
import { redirect } from "next/navigation";
import { getMe } from "@/lib/session";

export default async function CartPage() {
  const user = await getMe();
  if (!user) redirect("/login");
  // ...
}
```

---

## Checkout flow

1. User clicks checkout on `/cart`  
2. `createCheckoutSession()` → `POST /checkout` → get Stripe URL  
3. `window.location.href = url` (client component)  
4. Stripe redirects to `/checkout/success` or `/checkout/cancel`  
5. Webhook on backend creates order + clears cart (not frontend)

**Local dev:** run `stripe listen --forward-to localhost:8080/webhooks/stripe`

---

## Dev workflow (3 terminals)

```bash
# 1 — API
cd backend && make run

# 2 — Stripe webhooks
stripe listen --forward-to localhost:8080/webhooks/stripe

# 3 — Frontend
cd frontend && npm run dev
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `NEXT_PUBLIC_API_URL is not set` | Create `.env.local` |
| CORS error | Backend must allow `localhost:3000` |
| 401 on cart actions | User not logged in; check cookie |
| Image 404 | `getProductImageUrl` + `next.config` remotePatterns |
| Cart stale after add | Call `revalidatePath("/cart")` in action |
| Pay succeeds, cart full | Webhook failed — check `stripe listen` |
| Admin 404 | Login as `admin@sopify.com` |

---

## Starter assets (course)

From `docs/frontend/assets/`:

| File | Copy to |
|------|---------|
| `globals.css` | `app/globals.css` |
| `placeholder.png` | `public/placeholder.png` |
| `.env.local.example` | `.env.local` |
| `utils.ts` | `lib/utils.ts` |
| `next.config.ts` | project root |

Install: `clsx`, `tailwind-merge`, `axios`, `lucide-react`
