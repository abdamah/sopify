import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";

export function Header() {
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

          <Link href="/cart" className="icon-button" aria-label="Cart">
            <ShoppingCart className="size-5" aria-hidden="true" />
          </Link>

          <Link href="/login" className="secondary-button hidden px-3 py-1.5 text-[13px] sm:inline-flex">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
