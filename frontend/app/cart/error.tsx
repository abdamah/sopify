"use client";

import { PageError } from "@/components/page-error";

type CartErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CartError({ reset }: CartErrorProps) {
  return (
    <PageError
      title="Could not load your cart"
      message="We couldn't load your cart right now. Please try again in a moment."
      reset={reset}
    />
  );
}
