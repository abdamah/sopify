"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CartQuantityControls } from "@/components/cart-quantity-controls";
import { CheckoutButton } from "@/components/checkout-button";
import { RemoveCartItemButton } from "@/components/remove-cart-item-button";
import { emitCartUpdated } from "@/lib/cart-events";
import type { CartResponse } from "@/lib/types";
import { formatPrice, getProductImageUrl } from "@/lib/utils";

type CartContentsProps = {
  initialCart: CartResponse;
};

export function CartContents({ initialCart }: CartContentsProps) {
  const router = useRouter();
  const [cart, setCart] = useState(initialCart);

  function handleCartChange(nextCart: CartResponse) {
    setCart(nextCart);
    emitCartUpdated(nextCart);
  }

  function handleUnauthenticated() {
    router.push("/login");
  }

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Your cart is empty
        </h2>
        <p className="mb-6">Add products to your cart before checkout.</p>
        <Link href="/products" className="primary-button">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
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
                <CartQuantityControls
                  productId={item.product.id}
                  quantity={item.quantity}
                  stock={item.product.stock}
                  onCartChange={handleCartChange}
                  onUnauthenticated={handleUnauthenticated}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatPrice(item.product.price)} each
                </p>
              </div>

              <p className="whitespace-nowrap text-sm font-bold text-primary">
                {formatPrice(item.line_total)}
              </p>

              <RemoveCartItemButton
                productId={item.product.id}
                onCartChange={handleCartChange}
                onUnauthenticated={handleUnauthenticated}
              />
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
        <CheckoutButton onUnauthenticated={handleUnauthenticated} />
      </aside>
    </div>
  );
}
