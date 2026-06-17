import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="header-inner">
        <Link href="/" className="text-lg font-semibold tracking-tight text-primary">
          Sopify
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products" className="nav-link">
            Products
          </Link>
        </nav>
      </div>
    </header>
  );
}
