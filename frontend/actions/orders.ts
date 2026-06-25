"use server";

import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

export async function getMyOrders(): Promise<Order[]> {
  const token = await getToken();
  if (!token) {
    throw new Error("Please sign in to view your orders");
  }

  return api.get<Order[]>("/orders", token);
}
