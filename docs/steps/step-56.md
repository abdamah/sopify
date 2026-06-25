# Step 56 — Orders UI

**Week 4 — Stripe & orders** · Prev: [Step 55](step-55.md) · Next: [Step 57](step-57.md)

## Goal

Customer and admin order pages.

## Code

### `frontend/actions/orders.ts`

```typescript
"use server";

import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

export async function getMyOrders(): Promise<Order[]> {
  const token = await getToken();
  if (!token) {
    throw new Error("Please sign in to view your orders");
  }

  return api.get<Order[]>("/orders", token);
}
```

### `frontend/app/orders/page.tsx`

```tsx
import { redirect } from "next/navigation";

import { getMyOrders } from "@/actions/orders";
import { MyOrdersList } from "@/components/my-orders-list";
import { getMe } from "@/lib/session";

export default async function OrdersPage() {
  const user = await getMe();
  if (!user) {
    redirect("/login");
  }

  const orders = await getMyOrders();

  return (
    <main className="page-container">
      <div className="mb-8">
        <p className="section-label">Account</p>
        <h1 className="page-title">My orders</h1>
      </div>

      <MyOrdersList orders={orders} />
    </main>
  );
}
```

### `frontend/components/my-orders-list.tsx`

```tsx
import Link from "next/link";

import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatItemsSummary(order: Order) {
  if (!order.items?.length) {
    return "—";
  }

  return order.items
    .map((item) => `${item.quantity}× ${item.product_name ?? "Product"}`)
    .join(", ");
}

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") {
    return <span className="admin-stock-in capitalize">{status}</span>;
  }

  if (status === "shipped") {
    return (
      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 capitalize">
        {status}
      </span>
    );
  }

  if (status === "cancelled") {
    return <span className="admin-stock-out capitalize">{status}</span>;
  }

  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground capitalize">
      {status}
    </span>
  );
}

type MyOrdersListProps = {
  orders: Order[];
};

export function MyOrdersList({ orders }: MyOrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="mb-4 text-5xl text-muted-foreground">🧾</div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          No orders yet
        </h2>
        <p className="mb-6">
          Your order history will appear here after you complete checkout.
        </p>
        <Link href="/products" className="primary-button">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead className="admin-table-head">
          <tr>
            <th className="admin-table-th">Date</th>
            <th className="admin-table-th">Items</th>
            <th className="admin-table-th">Total</th>
            <th className="admin-table-th">Status</th>
            <th className="admin-table-th">Order ID</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="admin-table-row">
              <td className="admin-table-td whitespace-nowrap text-sm text-muted-foreground">
                {formatOrderDate(order.created_at)}
              </td>
              <td className="admin-table-td max-w-md text-sm text-muted-foreground">
                {formatItemsSummary(order)}
              </td>
              <td className="admin-table-td admin-td-price">
                {formatPrice(order.total)}
              </td>
              <td className="admin-table-td">
                <StatusBadge status={order.status} />
              </td>
              <td className="admin-table-td admin-td-id">#{order.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### `frontend/app/admin/orders/page.tsx`

```tsx
import { getOrders } from "@/actions/admin";
import { AdminOrdersPanel } from "@/components/admin-orders-panel";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return <AdminOrdersPanel orders={orders} />;
}
```

### `frontend/components/admin-orders-panel.tsx`

```tsx
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatItemsSummary(order: Order) {
  if (!order.items?.length) {
    return "—";
  }

  return order.items
    .map((item) => `${item.quantity}× ${item.product_name ?? "Product"}`)
    .join(", ");
}

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") {
    return <span className="admin-stock-in capitalize">{status}</span>;
  }

  if (status === "shipped") {
    return <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 capitalize">
      {status}
    </span>;
  }

  if (status === "cancelled") {
    return <span className="admin-stock-out capitalize">{status}</span>;
  }

  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground capitalize">
      {status}
    </span>
  );
}

type AdminOrdersPanelProps = {
  orders: Order[];
};

export function AdminOrdersPanel({ orders }: AdminOrdersPanelProps) {
  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-title">
          Orders
          <span className="ml-2 text-[13px] font-normal text-muted-foreground">
            ({orders.length} order{orders.length !== 1 ? "s" : ""})
          </span>
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="mb-4 text-5xl text-muted-foreground">🧾</div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No orders yet
          </h3>
          <p>Orders will appear here after customers complete checkout.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead className="admin-table-head">
              <tr>
                <th className="admin-table-th">Date</th>
                <th className="admin-table-th">Customer</th>
                <th className="admin-table-th">Items</th>
                <th className="admin-table-th">Total</th>
                <th className="admin-table-th">Status</th>
                <th className="admin-table-th">Order ID</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="admin-table-row">
                  <td className="admin-table-td whitespace-nowrap text-sm text-muted-foreground">
                    {formatOrderDate(order.created_at)}
                  </td>
                  <td className="admin-table-td text-sm">
                    {order.user_email ?? "—"}
                  </td>
                  <td className="admin-table-td max-w-xs text-sm text-muted-foreground">
                    {formatItemsSummary(order)}
                  </td>
                  <td className="admin-table-td admin-td-price">
                    {formatPrice(order.total)}
                  </td>
                  <td className="admin-table-td">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="admin-table-td admin-td-id">#{order.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
```

### `frontend/components/user-account-menu.tsx`

```tsx
"use client";

import {
  ChevronDown,
  ClipboardList,
  LogOut,
  Package,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { logout } from "@/actions/auth";

type UserAccountMenuProps = {
  email: string;
  isAdmin?: boolean;
};

const menuItemClassName =
  "flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted";

export function UserAccountMenu({ email, isAdmin = false }: UserAccountMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLogout() {
    setOpen(false);

    startTransition(async () => {
      await logout();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="secondary-button max-w-44 px-3 py-1.5 text-[13px]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="truncate">{email}</span>
        <ChevronDown
          className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-background py-1 shadow-lg"
          role="menu"
        >
          {isAdmin ? (
            <>
              <Link
                href="/admin"
                role="menuitem"
                className={menuItemClassName}
                onClick={() => setOpen(false)}
              >
                <ShoppingBag
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Products
              </Link>
              <Link
                href="/admin/orders"
                role="menuitem"
                className={menuItemClassName}
                onClick={() => setOpen(false)}
              >
                <ClipboardList
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Orders
              </Link>
              <div className="my-1 border-t border-border" role="separator" />
            </>
          ) : null}
          <Link
            href="/orders"
            role="menuitem"
            className={menuItemClassName}
            onClick={() => setOpen(false)}
          >
            <Package className="size-4 text-muted-foreground" aria-hidden="true" />
            My orders
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={isPending}
            className={`${menuItemClassName} text-left disabled:opacity-60`}
          >
            <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
            {isPending ? "Signing out…" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
```

## Verify

/orders and /admin/orders work.
