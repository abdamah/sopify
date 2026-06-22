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
