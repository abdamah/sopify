"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState, useTransition } from "react";

import { createProduct } from "@/actions/admin";
import type { Product } from "@/lib/types";
import { createProductSchema } from "@/lib/validation";

type CreateProductModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
};

export function CreateProductModal({
  open,
  onClose,
  onSuccess,
}: CreateProductModalProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const values = {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: formData.get("price"),
      stock: formData.get("stock"),
    };

    const parsed = createProductSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }

    const form = event.currentTarget;

    startTransition(async () => {
      const result = await createProduct(parsed.data);

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

      form.reset();
      onSuccess(result.product);
    });
  }

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            Add product
          </h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error ? <p className="form-error">{error}</p> : null}

            <div>
              <label htmlFor="modal-name" className="form-label">
                Product name <span className="text-red-600">*</span>
              </label>
              <input
                id="modal-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Wireless Headphones"
                required
              />
            </div>

            <div>
              <label htmlFor="modal-desc" className="form-label">
                Description
              </label>
              <textarea
                id="modal-desc"
                name="description"
                rows={3}
                className="form-input resize-y"
                placeholder="Short product description…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-price" className="form-label">
                  Price ($) <span className="text-red-600">*</span>
                </label>
                <input
                  id="modal-price"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="modal-stock" className="form-label">
                  Stock quantity
                </label>
                <input
                  id="modal-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  className="form-input"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isPending}>
              {isPending ? "Saving..." : "Save product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
