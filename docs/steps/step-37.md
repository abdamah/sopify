# Step 37 — Cart types (frontend)

**Week 2 — Auth & cart** · Prev: [Step 36](step-36.md) · Next: [Step 38](step-38.md)

## Goal

Add `CartItem`, `CartResponse`, `User`, and `AuthResponse` to `lib/types.ts`.

## Code

### `frontend/lib/types.ts` (add to existing file)

```typescript
export type User = {
  id: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type CartItem = {
  id: string;
  quantity: number;
  product: Product;
  line_total: number;
};

export type CartResponse = {
  items: CartItem[];
  total: number;
};
```

## Verify

Types compile with no TypeScript errors.
