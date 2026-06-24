import "server-only";

import axios, { type AxiosRequestConfig } from "axios";

function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  return baseUrl;
}

function getJsonHeaders(token?: string): AxiosRequestConfig["headers"] {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getAuthHeaders(token?: string): AxiosRequestConfig["headers"] {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  async get<T>(path: string, token?: string): Promise<T> {
    const res = await axios.get<T>(`${getBaseUrl()}${path}`, {
      headers: getJsonHeaders(token),
    });

    return res.data;
  },

  async post<T>(path: string, body?: unknown, token?: string): Promise<T> {
    const res = await axios.post<T>(`${getBaseUrl()}${path}`, body, {
      headers: getJsonHeaders(token),
    });

    return res.data;
  },

  async postForm<T>(path: string, body: FormData, token?: string): Promise<T> {
    const res = await axios.post<T>(`${getBaseUrl()}${path}`, body, {
      headers: getAuthHeaders(token),
    });

    return res.data;
  },

  async put<T>(path: string, body?: unknown, token?: string): Promise<T> {
    const res = await axios.put<T>(`${getBaseUrl()}${path}`, body, {
      headers: getJsonHeaders(token),
    });

    return res.data;
  },

  async patch<T>(path: string, body?: unknown, token?: string): Promise<T> {
    const res = await axios.patch<T>(`${getBaseUrl()}${path}`, body, {
      headers: getJsonHeaders(token),
    });

    return res.data;
  },

  async patchForm<T>(path: string, body: FormData, token?: string): Promise<T> {
    const res = await axios.patch<T>(`${getBaseUrl()}${path}`, body, {
      headers: getAuthHeaders(token),
    });

    return res.data;
  },

  async delete<T>(path: string, token?: string): Promise<T> {
    const res = await axios.delete<T>(`${getBaseUrl()}${path}`, {
      headers: getJsonHeaders(token),
    });

    return res.data;
  },
};
