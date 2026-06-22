import { Search } from "lucide-react";
import Link from "next/link";

import { getMe } from "@/actions/auth";
import { getCart } from "@/actions/cart";
import { CartLink } from "@/components/cart-link";
import { LogoutButton } from "@/components/logout-button";
import { getCartItemCount } from "@/lib/cart-events";

export async function Header() {
  const user = await getMe().catch(() => null);
  const cart = user ? await getCart().catch(() => null) : null;
  const cartCount = cart ? getCartItemCount(cart) : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="header-inner">
        <Link href="/" className="logo-link">
          Sop<span className="text-foreground">ify</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/products" className="nav-link">
            Shop
          </Link>
          {user?.role === "admin" ? (
            <Link href="/admin" className="nav-link">
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <label className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa]">
              <Search className="size-4" aria-hidden="true" />
            </span>
            <input className="header-search" placeholder="Search products" />
          </label>

          {user ? <CartLink initialCount={cartCount} /> : null}

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-40 truncate rounded-full border border-border px-3 py-1.5 text-[13px] font-medium text-foreground">
                {user.email}
              </span>
              <LogoutButton />
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
