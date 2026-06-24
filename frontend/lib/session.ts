import "server-only";

import axios from "axios";

import { getToken } from "@/lib/auth";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export async function getMe(): Promise<User | null> {
  const token = await getToken();
  if (!token) {
    return null;
  }

  try {
    return await api.get<User>("/me", token);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }

    throw error;
  }
}
