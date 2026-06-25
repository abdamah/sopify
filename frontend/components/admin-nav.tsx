import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
      <Link href="/admin" className="secondary-button px-4 py-2 text-[13px]">
        Products
      </Link>
      <Link href="/admin/orders" className="secondary-button px-4 py-2 text-[13px]">
        Orders
      </Link>
    </nav>
  );
}
