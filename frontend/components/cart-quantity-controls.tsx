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
