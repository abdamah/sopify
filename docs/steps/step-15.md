# Step 15 — Copy starter assets

**Week 1 — Products** · Prev: [Step 14](step-14.md) · Next: [Step 16](step-16.md)

## Goal

Brand CSS, placeholder image, env template, image helpers.

## Commands

Copy these files from `docs/frontend/assets/` into your Next.js project:

| Source | Destination |
|--------|-------------|
| `globals.css` | `app/globals.css` |
| `placeholder.png` | `public/placeholder.png` |
| `.env.local.example` | `.env.local` |
| `utils.ts` | `lib/utils.ts` |
| `next.config.ts` | `next.config.ts` (project root) |

## Code

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### `frontend/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PRODUCT_PLACEHOLDER_IMAGE = "/placeholder.png";

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function getProductImageUrl(imageUrl: string): string {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return PRODUCT_PLACEHOLDER_IMAGE;
  }

  if (trimmed.startsWith("/uploads/")) {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    return `${baseUrl}${trimmed}`;
  }

  return trimmed;
}
```

### `frontend/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
```

## Notes

- `globals.css` is large — copy the full file from `docs/frontend/assets/globals.css` (do not type by hand).
- `placeholder.png` is a binary image — copy from `docs/frontend/assets/placeholder.png`.

## Verify

Page loads with orange primary button utilities (`primary-button` class works).
