import { getOrders } from "@/actions/admin";
import { AdminOrdersPanel } from "@/components/admin-orders-panel";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return <AdminOrdersPanel orders={orders} />;
}
