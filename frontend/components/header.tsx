import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { getMe } from "@/actions/auth";
import { getCart } from "@/actions/cart";
import { LogoutButton } from "@/components/logout-button";

export async function Header() {
  const user = await getMe().catch(() => null);
  const cart = user ? await getCart().catch(() => null) : null;
  const cartCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

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
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <label className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa]">
              <Search className="size-4" aria-hidden="true" />
            </span>
            <input className="header-search" placeholder="Search products" />
          </label>

          {user ? (
            <Link href="/cart" className="icon-button relative" aria-label="Cart">
              <ShoppingCart className="size-5" aria-hidden="true" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          ) : null}

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
