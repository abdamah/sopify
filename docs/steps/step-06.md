# Step 6 — Products migration

**Week 1 — Products** · Prev: [Step 5](step-05.md) · Next: [Step 7](step-07.md)

## Goal

Create the products table.

## Commands

```bash
make migrate
```


## Code

### `backend/migrations/001_create_products.sql`

```sql
CREATE TABLE IF NOT EXISTS products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    image_url   TEXT NOT NULL DEFAULT '',
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);
```

## Verify

Table `products` exists after migrate.
