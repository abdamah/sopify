"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CreateProductModal } from "@/components/create-product-modal";
import { DeleteProductButton } from "@/components/delete-product-button";
import type { Product } from "@/lib/types";
import { getProductImageUrl } from "@/lib/utils";

const PAGE_SIZE = 8;

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

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
};

export function AdminProductsPanel({
  initialProducts,
}: AdminProductsPanelProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  function handleProductCreated(product: Product) {
    setProducts((current) => [product, ...current]);
    setIsModalOpen(false);
  }

  function handleProductDeleted(productId: string) {
    setProducts((current) => current.filter((product) => product.id !== productId));
  }

  return (
    <div className="admin-wrap">
      <div className="admin-topbar">
        <h1 className="admin-title">
          Product Management
          <span className="ml-2 text-[13px] font-normal text-muted-foreground">
            ({filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""})
          </span>
        </h1>

        <div className="admin-controls">
          <div className="admin-search-wrap">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => handleSearch(event.target.value)}
              className="admin-search-input"
              placeholder="Search products…"
            />
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={() => setIsModalOpen(true)}
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
            onClick={() => setIsModalOpen(true)}
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
                  <td className="admin-table-td admin-td-price">
                    {formatPrice(product.price)}
                  </td>
                  <td className="admin-table-td">
                    <StockBadge stock={product.stock} />
                  </td>
                  <td className="admin-table-td admin-td-id">#{product.id}</td>
                  <td className="admin-table-td">
                    <div className="admin-action-btns">
                      <Link
                        href={`/products/${product.id}`}
                        className="admin-btn-view"
                      >
                        View
                      </Link>
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

      <CreateProductModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProductCreated}
      />
    </div>
  );
}
