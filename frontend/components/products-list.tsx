"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { SearchInput } from "@/components/search-input";
import type { Product } from "@/lib/types";

type ProductsListProps = {
  products: Product[];
};

export function ProductsList({ products }: ProductsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <>
      <div className="shop-controls">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <strong className="text-foreground">{filteredProducts.length}</strong>{" "}
          product{filteredProducts.length !== 1 ? "s" : ""}
        </p>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products"
          variant="header"
        />
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No products yet
          </h3>
          <p>Seed products from the backend to show them here.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No products found
          </h3>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
