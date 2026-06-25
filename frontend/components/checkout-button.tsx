"use client";

import { useState, useTransition } from "react";

import { startCheckout } from "@/actions/checkout";

type CheckoutButtonProps = {
  onUnauthenticated: () => void;
};

export function CheckoutButton({ onUnauthenticated }: CheckoutButtonProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCheckout() {
    setError("");

    startTransition(async () => {
      const result = await startCheckout();

      if (!result.ok) {
        if (result.unauthenticated) {
          onUnauthenticated();
          return;
        }

        setError(result.error);
        return;
      }

      window.location.href = result.url;
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        className="primary-button mt-6 w-full"
        disabled={isPending}
      >
        {isPending ? "Redirecting to Stripe…" : "Checkout with Stripe"}
      </button>
      {error ? (
        <p className="mt-2 text-center text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Secure payment powered by Stripe
        </p>
      )}
    </div>
  );
}
