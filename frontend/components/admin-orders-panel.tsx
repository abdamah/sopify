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
