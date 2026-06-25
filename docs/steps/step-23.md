# Step 23 — Users migration

**Week 2 — Auth & cart** · Prev: [Step 22](step-22.md) · Next: [Step 24](step-24.md)

## Goal

Create users table for JWT auth.

## Commands

```bash
make migrate
```


## Code

### `backend/migrations/004_recreate_users.sql`

```sql
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    active     BOOLEAN NOT NULL DEFAULT true,
    token      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
```

## Verify

make migrate succeeds.
