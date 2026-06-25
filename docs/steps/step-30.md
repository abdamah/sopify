# Step 30 — Auth server actions

**Week 2 — Auth & cart** · Prev: [Step 29](step-29.md) · Next: [Step 31](step-31.md)

## Goal

login, register, logout actions.

## Code

### `frontend/lib/errors.ts`

```typescript
import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? fallback;
  }

  return fallback;
}
```

### `frontend/actions/auth.ts`

```typescript
"use server";

import { clearToken, getToken, setToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import type { AuthResponse, User } from "@/lib/types";

type AuthInput = {
  email: string;
  password: string;
};

type AuthActionResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

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
```

## Verify

Forms can call actions.
