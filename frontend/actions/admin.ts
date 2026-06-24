"use server";

import axios from "axios";
import { revalidatePath } from "next/cache";

import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

type AdminActionResult =
  | { ok: true; product: Product }
  | {
      ok: false;
      error: string;
      unauthenticated?: boolean;
      forbidden?: boolean;
    };

type DeleteProductResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      unauthenticated?: boolean;
      forbidden?: boolean;
    };

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? fallback;
  }

  return fallback;
}

function getAdminActionError(
  error: unknown,
  fallback: string
): Extract<AdminActionResult, { ok: false }> {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return {
        ok: false,
        error: "Please sign in to continue",
        unauthenticated: true,
      };
    }

    if (error.response?.status === 403) {
      return {
        ok: false,
        error: "Admin access required",
        forbidden: true,
      };
    }
  }

  return {
    ok: false,
    error: getApiErrorMessage(error, fallback),
  };
}

export async function createProduct(
  formData: FormData
): Promise<AdminActionResult> {
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      error: "Please sign in to create products",
      unauthenticated: true,
    };
  }

  try {
    const product = await api.postForm<Product>("/admin/products", formData, token);

    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/", "layout");

    return { ok: true, product };
  } catch (error) {
    return getAdminActionError(error, "Failed to create product");
  }
}

export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<AdminActionResult> {
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      error: "Please sign in to update products",
      unauthenticated: true,
    };
  }

  try {
    const product = await api.patchForm<Product>(
      `/admin/products/${productId}`,
      formData,
      token
    );

    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/admin");
    revalidatePath("/", "layout");

    return { ok: true, product };
  } catch (error) {
    return getAdminActionError(error, "Failed to update product");
  }
}

export async function deleteProduct(
  productId: string
): Promise<DeleteProductResult> {
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      error: "Please sign in to delete products",
      unauthenticated: true,
    };
  }

  try {
    await api.delete(`/admin/products/${productId}`, token);

    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/", "layout");

    return { ok: true };
  } catch (error) {
    return getAdminActionError(error, "Failed to delete product");
  }
}
