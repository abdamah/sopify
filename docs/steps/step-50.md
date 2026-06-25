# Step 50 — Orders migration

**Week 4 — Stripe & orders** · Prev: [Step 49](step-49.md) · Next: [Step 51](step-51.md)

## Goal

orders and order_items tables.

## Commands

```bash
make migrate
```


## Code

### `backend/migrations/007_create_orders.sql`

```sql
CREATE TABLE IF NOT EXISTS orders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total             NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
    stripe_session_id TEXT UNIQUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    price      NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders (stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
```

## Verify

make migrate succeeds.
