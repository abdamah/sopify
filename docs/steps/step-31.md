# Step 31 — getMe session helper

**Week 2 — Auth & cart** · Prev: [Step 30](step-30.md) · Next: [Step 32](step-32.md)

## Goal

Read current user in Server Components.

## Code

### `frontend/lib/session.ts`

```typescript
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
```

## Verify

getMe() returns user when logged in.
