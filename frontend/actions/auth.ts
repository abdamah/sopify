"use server";

import axios from "axios";

import { clearToken, getToken, setToken } from "@/lib/auth";
import { api } from "@/lib/api";
import type { AuthResponse, User } from "@/lib/types";

type AuthInput = {
  email: string;
  password: string;
};

export async function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  const input:AuthInput = {
    email,
    password,
  };
  const auth = await api.post<AuthResponse>("/auth/register", {
 input,
  } );

  await setToken(auth.token);

  return auth;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {

  const input:AuthInput = {
    email,
    password,
  };
  const auth = await api.post<AuthResponse>("/auth/login", input);

  await setToken(auth.token);

  return auth;
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
