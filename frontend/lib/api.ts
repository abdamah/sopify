import "server-only";

import axios, { type AxiosRequestConfig } from "axios";

function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  return baseUrl;
}

function getHeaders(token?: string): AxiosRequestConfig["headers"] {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  async get<T>(path: string, token?: string): Promise<T> {
    const res = await axios.get<T>(`${getBaseUrl()}${path}`, {
      headers: getHeaders(token),
    });

    return res.data;
  },

  async post<T>(path: string, body?: unknown, token?: string): Promise<T> {
    const res = await axios.post<T>(`${getBaseUrl()}${path}`, body, {
      headers: getHeaders(token),
    });

    return res.data;
  },

  async put<T>(path: string, body?: unknown, token?: string): Promise<T> {
    const res = await axios.put<T>(`${getBaseUrl()}${path}`, body, {
      headers: getHeaders(token),
    });

    return res.data;
  },



  async delete<T>(path: string, token?: string): Promise<T> {
    const res = await axios.delete<T>(`${getBaseUrl()}${path}`, {
      headers: getHeaders(token),
    });

    return res.data;
  },
};
