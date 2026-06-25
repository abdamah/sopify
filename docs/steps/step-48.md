# Step 48 — Stripe env vars

**Week 4 — Stripe & orders** · Prev: [Step 47](step-47.md) · Next: [Step 49](step-49.md)

## Goal

Configure Stripe keys.

## Commands

- Add to backend/.env: FRONTEND_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
```bash
go get github.com/stripe/stripe-go/v82
```


## Verify

Env loads without error.
