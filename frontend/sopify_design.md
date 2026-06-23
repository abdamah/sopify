# Sopify Frontend Design

Simple storefront UI. Tailwind + custom utilities in `app/globals.css`. No shadcn components in pages.

---

## Brand

| Token | Value |
|-------|-------|
| Primary | `#F97315` (orange) |
| Background | `#FFFFFF` |
| Foreground | `#111111` |
| Muted text | `#666666` |
| Border | `#E8E8E8` |
| Accent tint | `#FFF4EE` (soft orange bg) |

Logo: **Sop** (orange) + **ify** (dark). Font: Geist Sans.

---

## Layout

- Max width: **1180px** (`site-container`, `page-container`)
- Page padding: `px-6`, vertical `py-10`–`py-16`
- Sticky header, 60px height, border-bottom
- Mobile-first; grids stack → 2 cols → 4 cols

---

## Typography

| Use | Style |
|-----|-------|
| Page title | `page-title` — 3xl bold |
| Section label | `section-label` — xs uppercase orange |
| Body | `text-sm` / `text-[15px]`, `text-muted-foreground` |
| Price | bold, `text-primary` |

---

## Buttons

| Class | Use |
|-------|-----|
| `primary-button` | Main actions (Add to cart, Save, Register) |
| `secondary-button` | Secondary (Cancel, Sign in link style) |
| `icon-button` | Cart, close, logout icon |
| `admin-btn-edit` | Table edit |
| `admin-btn-delete` | Table delete (red) |

Primary: orange bg, white text, rounded-md, hover darker orange.

---

## Search

Reusable `SearchInput` component — pill shape, icon left, muted bg.

- **Header** — compact, hidden on mobile, expands on focus
- **Shop / Admin** — full pill, filters client-side

---

## Pages

| Route | Layout |
|-------|--------|
| `/` | Hero gradient → services grid → featured products → orange CTA banner |
| `/products` | Shop hero bar → search + product grid (`product-card`) |
| `/products/[id]` | 2-col detail: image + title, price, qty, add to cart |
| `/cart` | Item rows + quantity controls + order summary sidebar |
| `/login`, `/register` | Centered `auth-card` on muted bg |
| `/admin` | Top bar + table + pagination + product modal |
| 404 | Large orange `404`, links to shop / home |

---

## Components

| Component | Notes |
|-----------|-------|
| `product-card` | Image, stock badge, title, price, hover lift |
| `SearchInput` | Shared search field |
| `ProductModal` | Add / edit product (admin) |
| `CartQuantityControls` | +/- without page refresh |
| `NotFoundPage` | 404 content |

Stock badges: green (in stock), amber (low), red (out).

---

## States

| State | Pattern |
|-------|---------|
| Loading | `loading.tsx` + `skeleton` pulse blocks |
| Error | `error.tsx` + `PageError` (retry + go home) |
| Empty | `empty-state` centered message + CTA |

---

## Icons

Lucide React: `Search`, `ShoppingCart`, `LogOut`, `Trash2`, service icons on home.

Product images: Next `Image`, placeholder from `public/placeholder.png` when missing.

---

## Auth UI rules

- Logged out → header shows Sign in / Register
- Logged in → email pill + logout + cart badge
- Admin only → Admin nav link
- `/login` & `/register` → redirect home if already logged in
- `/cart` → redirect login if not logged in
- `/admin` → 404 if not admin

---

## File map

```
app/globals.css     — colors + @utility classes
components/         — UI pieces
app/*/loading.tsx   — skeletons
app/not-found.tsx   — 404
```

Keep new UI consistent: reuse utilities, primary orange, rounded cards, light borders.
