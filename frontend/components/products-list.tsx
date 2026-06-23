"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { SearchInput } from "@/components/search-input";
import type { Category, Product } from "@/lib/types";

type ProductsListProps = {
  products: Product[];
  categories: Category[];
};

export function ProductsList({ products, categories }: ProductsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category.slug === selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const name = product.name.toLowerCase();
      const description = product.description.toLowerCase();
      const category = product.category.name.toLowerCase();

      return (
        name.includes(query) ||
        description.includes(query) ||
        category.includes(query)
      );
    });
  }, [products, searchQuery, selectedCategory]);

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
  }

  return (
    <>
      <div className="shop-controls">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products…"
          className="max-w-[340px] w-full"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-6 text-xs font-mono uppercase tracking-widest text-[#aaaaaa]">
        {filteredProducts.length} result
        {filteredProducts.length !== 1 ? "s" : ""}
      </p>

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
          <p className="mb-6">Try adjusting your search or filter.</p>
          <button
            type="button"
            className="primary-button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
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
