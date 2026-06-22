import Link from "next/link";
import { redirect } from "next/navigation";

import { getMe } from "@/actions/auth";
import { getCart } from "@/actions/cart";
import { CartContents } from "@/components/cart-contents";

export default async function CartPage() {
  const user = await getMe();
  if (!user) {
    redirect("/login");
  }

  const cart = await getCart();

  return (
    <main className="page-container">
      <div className="mb-8">
        <p className="section-label">Cart</p>
        <h1 className="page-title">Your cart</h1>
      </div>

      <CartContents initialCart={cart} />
    </main>
  );
}
