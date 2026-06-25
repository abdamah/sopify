# Step 29 — Cookie helpers

**Week 2 — Auth & cart** · Prev: [Step 28](step-28.md) · Next: [Step 30](step-30.md)

## Goal

Store JWT in httpOnly cookie.

## Code

### `frontend/lib/auth.ts`

```typescript
import "server-only";

import { cookies } from "next/headers";

export const TOKEN_COOKIE_NAME = "sopify_token";

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE_NAME)?.value;
}

export async function setToken(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}
```

## Verify

Cookie set after login (check in DevTools Application tab).
