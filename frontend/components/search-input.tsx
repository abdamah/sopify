"use client";

import { Search } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: "header" | "default";
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search products",
  variant = "default",
  className = "",
}: SearchInputProps) {
  return (
    <label className={`search-wrap ${className}`}>
      <Search
        className="search-icon"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={variant === "header" ? "search-input search-input-header" : "search-input"}
      />
    </label>
  );
}
