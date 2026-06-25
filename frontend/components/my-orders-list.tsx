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
