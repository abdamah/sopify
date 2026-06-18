"use server";

import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";
import type { CartResponse } from "@/lib/types";

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
): Promise<CartResponse> {
  const token = requireToken(await getToken());

  return api.post<CartResponse>(
    "/cart",
    {
      product_id: productId,
      quantity,
    },
    token
  );
}

export async function removeFromCart(
  productId: string
): Promise<CartResponse> {
  const token = requireToken(await getToken());
  return api.delete<CartResponse>(`/cart/${productId}`, token);
}
