# Step 53 — Checkout UI

**Week 4 — Stripe & orders** · Prev: [Step 52](step-52.md) · Next: [Step 54](step-54.md)

## Goal

Checkout button and success/cancel pages.

## Code

### `frontend/actions/checkout.ts`

```typescript
"use server";

import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";

type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; unauthenticated?: boolean };

export async function startCheckout(): Promise<CheckoutResult> {
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      error: "Please sign in to checkout",
      unauthenticated: true,
    };
  }

  try {
    const { url } = await api.post<{ url: string }>("/checkout", undefined, token);
    return { ok: true, url };
  } catch (error) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to start checkout"),
    };
  }
}
```

### `frontend/components/checkout-button.tsx`

```tsx
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
```

### `frontend/app/checkout/success/page.tsx`

```tsx
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  return (
    <main className="page-container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <CheckCircle2
        className="mb-4 size-14 text-primary"
        aria-hidden="true"
      />
      <p className="section-label">Checkout</p>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        Payment successful
      </h1>
      <p className="mb-8 max-w-md text-sm leading-6 text-muted-foreground">
        Thank you for your order. You will receive a confirmation once payment is
        processed.
      </p>
      {sessionId ? (
        <p className="mb-8 max-w-md break-all text-xs text-muted-foreground">
          Reference: {sessionId}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/products" className="primary-button">
          Continue shopping
        </Link>
        <Link href="/orders" className="secondary-button">
          View my orders
        </Link>
      </div>
    </main>
  );
}
```

### `frontend/app/checkout/cancel/page.tsx`

```tsx
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="page-container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <XCircle className="mb-4 size-14 text-muted-foreground" aria-hidden="true" />
      <p className="section-label">Checkout</p>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        Payment cancelled
      </h1>
      <p className="mb-8 max-w-md text-sm leading-6 text-muted-foreground">
        Your payment was not completed. Your cart items are still saved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/cart" className="primary-button">
          Back to cart
        </Link>
        <Link href="/products" className="secondary-button">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
```

## Verify

Pay with 4242 4242 4242 4242 → cart empties.
