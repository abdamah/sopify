"use server";

import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";

type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; unauthenticated?: boolean };

export async function startCheckout(): Promise<CheckoutResult> {
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      error: "Please sign in to checkout",
      unauthenticated: true,
    };
  }

  try {
    const { url } = await api.post<{ url: string }>("/checkout", undefined, token);
    return { ok: true, url };
  } catch (error) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to start checkout"),
    };
  }
}
