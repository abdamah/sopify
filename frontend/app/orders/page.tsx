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
