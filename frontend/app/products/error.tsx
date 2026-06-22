"use client";

import { PageError } from "@/components/page-error";

type ProductsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductsError({ reset }: ProductsErrorProps) {
  return (
    <PageError
      title="Could not load products"
      message="We couldn't fetch products from the store. Make sure the backend is running and try again."
      reset={reset}
    />
  );
}
