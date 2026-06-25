# Sopify Frontend — Starter Assets

Copy these into a new Next.js project so students focus on logic, not design from scratch.

## Files

| File | Copy to | Purpose |
|------|---------|---------|
| `globals.css` | `app/globals.css` | Brand colors + all UI utility classes |
| `placeholder.png` | `public/placeholder.png` | Fallback when product has no image |
| `.env.local.example` | `.env.local` | API URL |
| `utils.ts` | `lib/utils.ts` | `formatPrice`, `getProductImageUrl`, `cn` |
| `next.config.ts` | `next.config.ts` | Remote images (placehold.co + uploads) |

## After copying

```bash
npm install clsx tailwind-merge axios lucide-react
```

In `app/layout.tsx`:

```tsx
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
```

## Brand tokens (in globals.css)

| Token | Value |
|-------|-------|
| Primary | `#F97315` |
| Background | `#FFFFFF` |
| Foreground | `#111111` |
| Muted text | `#666666` |
| Border | `#E8E8E8` |
| Accent tint | `#FFF4EE` |

## Images in the app

- **No image URL** → `/placeholder.png`
- **Seed products** → `https://placehold.co/400x400?text=...`
- **Admin upload** → `http://localhost:8080/uploads/...`

Always use `getProductImageUrl(product.image_url)` with Next.js `<Image>`.
