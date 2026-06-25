# Step 38 — Cart server actions

**Week 2 — Auth & cart** · Prev: [Step 37](step-37.md) · Next: [Step 39](step-39.md)

## Goal

getCart, addToCart, updateCartItem, removeFromCart.

## Code

### `frontend/actions/cart.ts`

```typescript
"use server";

import { revalidatePath } from "next/cache";

import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import type { CartResponse } from "@/lib/types";

type CartActionResult =
  | { ok: true; cart: CartResponse }
  | { ok: false; error: string; unauthenticated?: boolean };

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
```

## Verify

Actions call API with token.
