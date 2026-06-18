import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getMe } from "@/actions/auth";
import { getCart } from "@/actions/cart";
import { RemoveCartItemButton } from "@/components/remove-cart-item-button";
import { getProductImageUrl } from "@/lib/utils";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

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

      {cart.items.length === 0 ? (
        <div className="empty-state">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Your cart is empty
          </h2>
          <p className="mb-6">Add products to your cart before checkout.</p>
          <Link href="/products" className="primary-button">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          <section>
            <h2 className="cart-section-title">Items</h2>
            <div>
              {cart.items.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <Image
                    src={getProductImageUrl(item.product.image_url)}
                    alt={item.product.name}
                    width={64}
                    height={64}
                    className="cart-item-image"
                    unoptimized
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity} x {formatPrice(item.product.price)}
                    </p>
                  </div>

                  <p className="whitespace-nowrap text-sm font-bold text-primary">
                    {formatPrice(item.line_total)}
                  </p>

                  <RemoveCartItemButton productId={item.product.id} />
                </div>
              ))}
            </div>
          </section>

          <aside className="cart-summary">
            <h2 className="cart-section-title">Order summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated later</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-base font-bold text-foreground">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <button type="button" className="primary-button mt-6 w-full">
              Checkout
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
