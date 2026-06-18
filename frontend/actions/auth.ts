"use server";

import axios from "axios";

import { clearToken, getToken, setToken } from "@/lib/auth";
import { api } from "@/lib/api";
import type { AuthResponse, User } from "@/lib/types";

type AuthInput = {
  email: string;
  password: string;
};

type AuthActionResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? fallback;
  }

  return fallback;
}

export async function register(
  email: string,
  password: string
): Promise<AuthActionResult> {
  try {
    const input: AuthInput = { email, password };
    const auth = await api.post<AuthResponse>("/auth/register", input);

    await setToken(auth.token);

    return { ok: true, user: auth.user };
  } catch (error) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to register"),
    };
  }
}

export async function login(
  email: string,
  password: string
): Promise<AuthActionResult> {
  try {
    const input: AuthInput = { email, password };
    const auth = await api.post<AuthResponse>("/auth/login", input);

    await setToken(auth.token);

    return { ok: true, user: auth.user };
  } catch (error) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to login"),
    };
  }
}

export async function logout(): Promise<void> {
  const token = await getToken();

  try {
    if (token) {
      await api.post<void>("/auth/logout", undefined, token);
    }
  } finally {
    await clearToken();
  }
}

export async function getMe(): Promise<User | null> {
  const token = await getToken();
  if (!token) {
    return null;
  }

  try {
    return await api.get<User>("/me", token);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await clearToken();
      return null;
    }

    throw error;
  }
}
