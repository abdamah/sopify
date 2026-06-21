"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateCartItem } from "@/actions/cart";

type CartQuantityControlsProps = {
  productId: string;
  quantity: number;
  stock: number;
};

export function CartQuantityControls({
  productId,
  quantity,
  stock,
}: CartQuantityControlsProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function changeQuantity(nextQuantity: number) {
    setError("");

    startTransition(async () => {
      const result = await updateCartItem(productId, nextQuantity);

      if (!result.ok) {
        if (result.unauthenticated) {
          router.push("/login");
          return;
        }

        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleDecrease() {
    changeQuantity(quantity - 1);
  }

  function handleIncrease() {
    changeQuantity(quantity + 1);
  }

  return (
    <div>
      <div className="inline-flex overflow-hidden rounded-md border border-border">
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
          {isPending ? "…" : quantity}
        </span>
        <button
          type="button"
          onClick={handleIncrease}
          className="size-8 bg-muted text-base font-semibold text-foreground disabled:opacity-40"
          disabled={quantity >= stock || isPending}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
