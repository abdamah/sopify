"use server";

import axios from "axios";
import { revalidatePath } from "next/cache";

import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";
import type { CartResponse } from "@/lib/types";

type CartActionResult =
  | { ok: true; cart: CartResponse }
  | { ok: false; error: string; unauthenticated?: boolean };

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? fallback;
  }

  return fallback;
}

function requireToken(token: string | undefined) {
  if (!token) {
    throw new Error("You must be signed in to use the cart");
  }

  return token;
}

export async function getCart(): Promise<CartResponse> {
  const token = requireToken(await getToken());
  return api.get<CartResponse>("/cart", token);
}

export async function addToCart(
  productId: string,
  quantity: number
): Promise<CartActionResult> {
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      error: "Please sign in to add items to your cart",
      unauthenticated: true,
    };
  }

  try {
    const cart = await api.post<CartResponse>(
      "/cart",
      {
        product_id: productId,
        quantity,
      },
      token
    );

    revalidatePath("/cart");
    revalidatePath("/", "layout");

    return { ok: true, cart };
  } catch (error) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to add item to cart"),
    };
  }
}

export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<CartActionResult> {
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      error: "Please sign in to update your cart",
      unauthenticated: true,
    };
  }

  try {
    const cart = await api.patch<CartResponse>(
      `/cart/${productId}`,
      { quantity },
      token
    );

    revalidatePath("/cart");
    revalidatePath("/", "layout");

    return { ok: true, cart };
  } catch (error) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to update cart item"),
    };
  }
}

export async function removeFromCart(
  productId: string
): Promise<CartActionResult> {
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      error: "Please sign in to update your cart",
      unauthenticated: true,
    };
  }

  try {
    const cart = await api.delete<CartResponse>(`/cart/${productId}`, token);

    revalidatePath("/cart");
    revalidatePath("/", "layout");

    return { ok: true, cart };
  } catch (error) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to remove item from cart"),
    };
  }
}
