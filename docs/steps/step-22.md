# Step 22 — Header and layout

**Week 1 — Products** · Prev: [Step 21](step-21.md) · Next: [Step 23](step-23.md)

## Goal

Site header and root layout.

## Code

### `frontend/components/header.tsx`

```tsx
import Link from "next/link";
import { ShoppingBasket } from "lucide-react";


import { getMe } from "@/lib/session";
import { getCart } from "@/actions/cart";
import { CartLink } from "@/components/cart-link";
import { HeaderSearch } from "@/components/header-search";
import { UserAccountMenu } from "@/components/user-account-menu";
import { getCartItemCount } from "@/lib/cart-events";



export async function Header() {
  const user = await getMe().catch(() => null);
  const cart = user ? await getCart().catch(() => null) : null;
  const cartCount = cart ? getCartItemCount(cart) : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="header-inner">
        <Link href="/" className="logo-link">
          <span className="logo-icon" aria-hidden="true">
            <ShoppingBasket className="size-5" strokeWidth={2.25} color="#F97315" />
          </span>
          <span className="logo-text">
            Sop<span className="text-foreground">ify</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/products" className="nav-link">
            Shop
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <HeaderSearch />

          {user ? <CartLink initialCount={cartCount} /> : null}

          {user ? (
            <div className="flex items-center">
              <UserAccountMenu
                email={user.email}
                isAdmin={user.role === "admin"}
              />
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="secondary-button px-3 py-1.5 text-[13px]">
                Sign in
              </Link>
              <Link href="/register" className="primary-button px-3 py-1.5 text-[13px]">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

### `frontend/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Header } from "@/components/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sopify",
  description: "Simple ecommerce storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}
```

## Notes

Week 1 demo: home → products → detail (guest).

## Verify

Navigate to /products from any page.
