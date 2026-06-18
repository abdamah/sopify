"use server";

import axios from "axios";

import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  return api.get<Product[]>("/products");
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await api.get<Product>(`/products/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}