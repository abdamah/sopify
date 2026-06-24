"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState, useTransition } from "react";

import { createProduct, updateProduct } from "@/actions/admin";
import type { Category, Product } from "@/lib/types";
import { getProductImageUrl } from "@/lib/utils";
import { createProductSchema } from "@/lib/validation";

type ProductModalProps = {
  open: boolean;
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: (product: Product) => void;
};

export function ProductModal({
  open,
  product,
  categories,
  onClose,
  onSuccess,
}: ProductModalProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(product);

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
      category_id: String(formData.get("category_id") ?? ""),
    };

    const parsed = createProductSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }

    const form = event.currentTarget;

    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(product!.id, formData)
        : await createProduct(formData);

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
            {isEditing ? "Edit product" : "Add product"}
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

        <form
          key={product?.id ?? "new"}
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          <div className="modal-body">
            {error ? <p className="form-error">{error}</p> : null}

            <div>
              <label htmlFor="modal-image" className="form-label">
                Product image
              </label>
              {product?.image_url ? (
                <div className="mb-3 overflow-hidden rounded-xl border border-border">
                  <Image
                    src={getProductImageUrl(product.image_url)}
                    alt={product.name}
                    width={480}
                    height={240}
                    className="h-40 w-full object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
              <input
                id="modal-image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-input file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                JPEG, PNG, or WebP. Max 5MB. Leave empty to keep the current
                image when editing.
              </p>
            </div>

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
                defaultValue={product?.name ?? ""}
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
                defaultValue={product?.description ?? ""}
              />
            </div>

            <div>
              <label htmlFor="modal-category" className="form-label">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                id="modal-category"
                name="category_id"
                className="form-input"
                defaultValue={product?.category_id ?? categories[0]?.id ?? ""}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
                  defaultValue={product?.price ?? ""}
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
                  defaultValue={product?.stock ?? ""}
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
              {isPending
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                  ? "Update product"
                  : "Save product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
