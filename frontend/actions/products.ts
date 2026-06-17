"use server";

import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  return api<Product[]>("/products");
}

export async function getProductById(id: string): Promise<Product | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  const res = await fetch(`${baseUrl}/products/${id}`, { cache: "no-store" });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`API GET /products/${id} failed: ${res.status}`);
  }

  return res.json() ;
}
