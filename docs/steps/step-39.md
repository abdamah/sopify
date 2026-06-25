# Step 39 — Add to cart form

**Week 2 — Auth & cart** · Prev: [Step 38](step-38.md) · Next: [Step 40](step-40.md)

## Goal

Button on product detail page.

## Code

### `frontend/components/add-to-cart-form.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addToCart } from "@/actions/cart";
import { emitCartUpdated } from "@/lib/cart-events";

type AddToCartFormProps = {
  productId: string;
  stock: number;
};

export function AddToCartForm({ productId, stock }: AddToCartFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isOutOfStock = stock <= 0;

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(stock, current + 1));
  }

  function handleAddToCart() {
    setMessage("");

    startTransition(async () => {
      const result = await addToCart(productId, quantity);

      if (!result.ok) {
        if (result.unauthenticated) {
          router.push("/login");
          return;
        }

        setMessage(result.error);
        return;
      }

      setMessage("Added to cart");
      emitCartUpdated(result.cart);
    });
  }

  return (
    <div className="min-w-40 flex-1">
      <div className="mb-5">
        <p className="mb-2 text-[13px] font-medium text-muted-foreground">
          Quantity
        </p>
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            onClick={decreaseQuantity}
            className="size-10 bg-muted text-lg font-semibold text-foreground disabled:opacity-40"
            disabled={quantity <= 1 || isOutOfStock}
          >
            -
          </button>
          <span className="grid h-10 w-14 place-items-center border-x border-border text-sm font-semibold">
            {isOutOfStock ? 0 : quantity}
          </span>
          <button
            type="button"
            onClick={increaseQuantity}
            className="size-10 bg-muted text-lg font-semibold text-foreground disabled:opacity-40"
            disabled={quantity >= stock || isOutOfStock}
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="primary-button min-w-40 flex-1"
        disabled={isOutOfStock || isPending}
      >
        {isPending ? "Adding..." : "Add to cart"}
      </button>

      {message ? (
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
```

## Notes

Add <AddToCartForm /> to app/products/[id]/page.tsx

## Verify

Add to cart from product page.
