"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteProduct } from "@/actions/admin";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
  onDeleted?: (productId: string) => void;
};

export function DeleteProductButton({
  productId,
  productName,
  onDeleted,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${productName}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await deleteProduct(productId);

      if (!result.ok) {
        if (result.unauthenticated) {
          router.push("/login");
          return;
        }

        if (result.forbidden) {
          router.push("/products");
          return;
        }

        setError(result.error);
        return;
      }

      if (onDeleted) {
        onDeleted(productId);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        className="admin-btn-delete"
        disabled={isPending}
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
