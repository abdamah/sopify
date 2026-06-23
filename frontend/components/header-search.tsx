"use client";

import { useState } from "react";

import { SearchInput } from "@/components/search-input";

export function HeaderSearch() {
  const [query, setQuery] = useState("");

  return (
    <SearchInput
      value={query}
      onChange={setQuery}
      placeholder="Search products"
      variant="header"
    />
  );
}
