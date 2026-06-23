"use server";

import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  return api.get<Category[]>("/categories");
}
