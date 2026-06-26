# Sopify

A simple ecommerce learning project — browse products, cart, Stripe checkout, and admin panel.

**Stack:** Go · Fiber v3 · PostgreSQL · JWT · Stripe · Next.js · TypeScript · Tailwind

```
sopify/
├── backend/     # REST API (port 8080)
├── frontend/    # Storefront UI (port 3000)
└── docs/        # Course materials & teaching steps
```

## Prerequisites

Go 1.25+ · Node 20+ · PostgreSQL · [Postman](https://www.postman.com/) · [Stripe CLI](https://stripe.com/docs/stripe-cli) (for payments)

## Quick start

### Backend

```bash
cd backend
cp .env.example .env          # set DATABASE_URL, JWT_SECRET
make setup                    # migrate + seed
make run
```

Postman → import `docs/backend/Sopify.postman_collection.json` → run **Health check**.

### Frontend

```bash
cd frontend
cp docs/frontend/assets/.env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Stripe (local checkout)

```bash
stripe listen --forward-to localhost:8080/webhooks/stripe
```

Copy `whsec_...` into `backend/.env` as `STRIPE_WEBHOOK_SECRET`, then restart the API.

**Test card:** `4242 4242 4242 4242`

## Seed admin

| Email | Password |
|-------|----------|
| `admin@sopify.com` | `Abc123@@` |

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080 |
| Health | http://localhost:8080/health |

## Docs

| Doc | For |
|-----|-----|
| [docs/steps/](docs/steps/) | Step-by-step build guide (with code) |
| [docs/INSTRUCTOR_GUIDE.md](docs/INSTRUCTOR_GUIDE.md) | 1-month course plan |
| [docs/backend/CHEATSHEET.md](docs/backend/CHEATSHEET.md) | Backend + Postman reference |
| [docs/frontend/CHEATSHEET.md](docs/frontend/CHEATSHEET.md) | Frontend reference |
| [backend/backend_plan.md](backend/backend_plan.md) | Backend roadmap |
| [frontend/frontend_plan.md](frontend/frontend_plan.md) | Frontend roadmap |
