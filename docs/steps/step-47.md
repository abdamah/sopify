# Step 47 — Admin products panel

**Week 3 — Admin** · Prev: [Step 46](step-46.md) · Next: [Step 48](step-48.md)

## Goal

Manage products in browser.

## Code

### `frontend/app/admin/page.tsx`

```tsx
import { getCategories } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import { AdminProductsPanel } from "@/components/admin-products-panel";

export default async function AdminPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <AdminProductsPanel
      initialProducts={products}
      categories={categories}
    />
  );
}
```

### `frontend/components/admin-nav.tsx`

```tsx
import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
      <Link href="/admin" className="secondary-button px-4 py-2 text-[13px]">
        Products
      </Link>
      <Link href="/admin/orders" className="secondary-button px-4 py-2 text-[13px]">
        Orders
      </Link>
    </nav>
  );
}
```

### `frontend/components/admin-products-panel.tsx`

```tsx
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { DeleteProductButton } from "@/components/delete-product-button";
import { ProductModal } from "@/components/product-modal";
import { SearchInput } from "@/components/search-input";
import type { Category, Product } from "@/lib/types";
import { formatPrice, getProductImageUrl } from "@/lib/utils";

const PAGE_SIZE = 8;

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return <span className="admin-stock-out">Out of stock</span>;
  }

  if (stock <= 5) {
    return <span className="admin-stock-low">{stock} left</span>;
  }

  return <span className="admin-stock-in">{stock}</span>;
}

type AdminProductsPanelProps = {
  initialProducts: Product[];
  categories: Category[];
};

export function AdminProductsPanel({
  initialProducts,
  categories,
}: AdminProductsPanelProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name.toLowerCase();
      const description = product.description.toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredProducts.slice(start, start + PAGE_SIZE);

  function handleSearch(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function openCreateModal() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProduct(null);
  }

  function handleProductSaved(product: Product) {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      if (exists) {
        return current.map((item) => (item.id === product.id ? product : item));
      }

      return [product, ...current];
    });
    closeModal();
  }

  function handleProductDeleted(productId: string) {
    setProducts((current) => current.filter((product) => product.id !== productId));
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-title">
          Product Management
          <span className="ml-2 text-[13px] font-normal text-muted-foreground">
            ({filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""})
          </span>
        </h1>

        <div className="admin-controls">
          <SearchInput
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search products…"
          />
          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            + Add product
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="mb-4 text-5xl text-muted-foreground">📦</div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No products found
          </h3>
          <p className="mb-6">
            Add your first product or adjust the search.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            + Add product
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead className="admin-table-head">
              <tr>
                <th className="admin-table-th">Product</th>
                <th className="admin-table-th">Category</th>
                <th className="admin-table-th">Price</th>
                <th className="admin-table-th">Stock</th>
                <th className="admin-table-th">ID</th>
                <th className="admin-table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((product) => (
                <tr key={product.id} className="admin-table-row">
                  <td className="admin-table-td">
                    <div className="admin-td-product">
                      <div className="admin-td-thumb">
                        <Image
                          src={getProductImageUrl(product.image_url)}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="size-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="admin-td-name">{product.name}</div>
                        <div className="admin-td-desc">
                          {product.description || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-table-td text-sm text-muted-foreground">
                    {product.category.name}
                  </td>
                  <td className="admin-table-td admin-td-price">
                    {formatPrice(product.price)}
                  </td>
                  <td className="admin-table-td">
                    <StockBadge stock={product.stock} />
                  </td>
                  <td className="admin-table-td admin-td-id">#{product.id}</td>
                  <td className="admin-table-td">
                    <div className="admin-action-btns">
                      <button
                        type="button"
                        className="admin-btn-edit"
                        onClick={() => openEditModal(product)}
                      >
                        Edit
                      </button>
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                        onDeleted={handleProductDeleted}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="admin-pagination">
            <p className="admin-page-info">
              Showing {start + 1}–
              {Math.min(start + PAGE_SIZE, filteredProducts.length)} of{" "}
              {filteredProducts.length}
            </p>
            <div className="admin-page-btns">
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setCurrentPage(page - 1)}
                disabled={page === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`admin-page-btn ${pageNumber === page ? "admin-page-btn-active" : ""}`}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                )
              )}
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setCurrentPage(page + 1)}
                disabled={page === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductModal
        open={isModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={closeModal}
        onSuccess={handleProductSaved}
      />
    </>
  );
}
```

### `frontend/components/product-modal.tsx`

```tsx
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
```

### `frontend/components/delete-product-button.tsx`

```tsx
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
```

## Notes

Week 3 demo: admin adds product with photo.

## Verify

Admin creates product with image → shows on /products.
