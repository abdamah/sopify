# Step 18 — Products server actions

**Week 1 — Products** · Prev: [Step 17](step-17.md) · Next: [Step 19](step-19.md)

## Goal

getProducts and getProductById.

## Code

### `frontend/actions/products.ts`

```typescript
"use server";

import axios from "axios";

import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  return api.get<Product[]>("/products");
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await api.get<Product>(`/products/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}
```

## Verify

Actions return data from API.
