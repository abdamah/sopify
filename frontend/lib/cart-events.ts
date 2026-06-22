import type { CartResponse } from "@/lib/types";

export function getCartItemCount(cart: CartResponse) {
  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

export function emitCartUpdated(cart: CartResponse) {
  window.dispatchEvent(
    new CustomEvent("cart-updated", {
      detail: { count: getCartItemCount(cart) },
    })
  );
}

export const CART_UPDATED_EVENT = "cart-updated";
