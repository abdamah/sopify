# Step 40 — Cart page

**Week 2 — Auth & cart** · Prev: [Step 39](step-39.md) · Next: [Step 41](step-41.md)

## Goal

View cart with line items.

## Code

### `frontend/app/cart/page.tsx`

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";

import { getMe } from "@/lib/session";
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
```

### `frontend/components/cart-contents.tsx`

```tsx
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
```

### `frontend/components/cart-quantity-controls.tsx`

```tsx
"use client";

import { useEffect, useState, useTransition } from "react";

import { updateCartItem } from "@/actions/cart";
import type { CartResponse } from "@/lib/types";

type CartQuantityControlsProps = {
  productId: string;
  quantity: number;
  stock: number;
  onCartChange: (cart: CartResponse) => void;
  onUnauthenticated: () => void;
};

export function CartQuantityControls({
  productId,
  quantity,
  stock,
  onCartChange,
  onUnauthenticated,
}: CartQuantityControlsProps) {
  const [displayQuantity, setDisplayQuantity] = useState(quantity);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDisplayQuantity(quantity);
  }, [quantity]);

  function changeQuantity(nextQuantity: number) {
    setError("");
    setDisplayQuantity(nextQuantity);

    startTransition(async () => {
      const result = await updateCartItem(productId, nextQuantity);

      if (!result.ok) {
        setDisplayQuantity(quantity);

        if (result.unauthenticated) {
          onUnauthenticated();
          return;
        }

        setError(result.error);
        return;
      }

      onCartChange(result.cart);
    });
  }

  function handleDecrease() {
    changeQuantity(displayQuantity - 1);
  }

  function handleIncrease() {
    changeQuantity(displayQuantity + 1);
  }

  return (
    <div>
      <div
        className={`inline-flex overflow-hidden rounded-md border border-border transition-opacity ${isPending ? "opacity-70" : ""}`}
      >
        <button
          type="button"
          onClick={handleDecrease}
          className="size-8 bg-muted text-base font-semibold text-foreground disabled:opacity-40"
          disabled={isPending}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="grid h-8 w-10 place-items-center border-x border-border text-sm font-semibold">
          {displayQuantity}
        </span>
        <button
          type="button"
          onClick={handleIncrease}
          className="size-8 bg-muted text-base font-semibold text-foreground disabled:opacity-40"
          disabled={displayQuantity >= stock || isPending}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
```

### `frontend/components/remove-cart-item-button.tsx`

```tsx
"use client";

import { X } from "lucide-react";
import { useState, useTransition } from "react";

import { removeFromCart } from "@/actions/cart";
import type { CartResponse } from "@/lib/types";

type RemoveCartItemButtonProps = {
  productId: string;
  onCartChange: (cart: CartResponse) => void;
  onUnauthenticated: () => void;
};

export function RemoveCartItemButton({
  productId,
  onCartChange,
  onUnauthenticated,
}: RemoveCartItemButtonProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    setError("");

    startTransition(async () => {
      const result = await removeFromCart(productId);

      if (!result.ok) {
        if (result.unauthenticated) {
          onUnauthenticated();
          return;
        }

        setError(result.error);
        return;
      }

      onCartChange(result.cart);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleRemove}
        className="icon-button"
        aria-label="Remove item"
        disabled={isPending}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
```

## Verify

Browser /cart shows items and total.
