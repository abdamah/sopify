# Sopify — Step-by-Step Teaching Guide

**1 month · 59 steps (0–58) · Postman (backend) · Browser (frontend)**

**Rule:** Finish **Verify** on each step before opening the next.

Each step is its own file in **[steps/](steps/)** with goal, commands, full code, and verify instructions.

---

## Quick links

| Resource | Link |
|----------|------|
| **All steps** | [steps/README.md](steps/README.md) |
| Session plan | [INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md) |
| Backend cheatsheet | [backend/CHEATSHEET.md](backend/CHEATSHEET.md) |
| Frontend cheatsheet | [frontend/CHEATSHEET.md](frontend/CHEATSHEET.md) |
| Postman collection | [backend/Sopify.postman_collection.json](backend/Sopify.postman_collection.json) |
| Frontend assets | [frontend/assets/](frontend/assets/) |

---

## Steps index

| Step | Title |
|------|-------|
| [00](steps/step-00.md) | Instructor prep |
| [01](steps/step-01.md) | Init Go module |
| [02](steps/step-02.md) | Minimal Fiber server |
| [03](steps/step-03.md) | Config from .env |
| [04](steps/step-04.md) | Health endpoint |
| [05](steps/step-05.md) | PostgreSQL connection |
| [06](steps/step-06.md) | Products migration |
| [07](steps/step-07.md) | Categories migration |
| [08](steps/step-08.md) | Product & category models |
| [09](steps/step-09.md) | Product repository |
| [10](steps/step-10.md) | Category repository |
| [11](steps/step-11.md) | Product handlers & routes |
| [12](steps/step-12.md) | Seed data |
| [13](steps/step-13.md) | CORS for Next.js |
| [14](steps/step-14.md) | Create Next.js app |
| [15](steps/step-15.md) | Copy starter assets |
| [16](steps/step-16.md) | Product types |
| [17](steps/step-17.md) | API client |
| [18](steps/step-18.md) | Products server actions |
| [19](steps/step-19.md) | Product card component |
| [20](steps/step-20.md) | Products list page |
| [21](steps/step-21.md) | Product detail page |
| [22](steps/step-22.md) | Header and layout |
| [23](steps/step-23.md) | Users migration |
| [24](steps/step-24.md) | User model & repository |
| [25](steps/step-25.md) | JWT service |
| [26](steps/step-26.md) | Auth handlers |
| [27](steps/step-27.md) | Auth middleware & /me |
| [28](steps/step-28.md) | Seed admin user |
| [29](steps/step-29.md) | Cookie helpers |
| [30](steps/step-30.md) | Auth server actions |
| [31](steps/step-31.md) | getMe session helper |
| [32](steps/step-32.md) | Login page & form |
| [33](steps/step-33.md) | Register page & form |
| [34](steps/step-34.md) | Cart migration |
| [35](steps/step-35.md) | Cart model & repository |
| [36](steps/step-36.md) | Cart handlers |
| [37](steps/step-37.md) | Cart types (frontend) |
| [38](steps/step-38.md) | Cart server actions |
| [39](steps/step-39.md) | Add to cart form |
| [40](steps/step-40.md) | Cart page |
| [41](steps/step-41.md) | Header cart link |
| [42](steps/step-42.md) | Admin product CRUD (backend) |
| [43](steps/step-43.md) | Local image storage |
| [44](steps/step-44.md) | Multipart product upload |
| [45](steps/step-45.md) | Admin server actions |
| [46](steps/step-46.md) | Admin layout guard |
| [47](steps/step-47.md) | Admin products panel |
| [48](steps/step-48.md) | Stripe env vars |
| [49](steps/step-49.md) | Checkout handler |
| [50](steps/step-50.md) | Orders migration |
| [51](steps/step-51.md) | Order repository |
| [52](steps/step-52.md) | Stripe webhook |
| [53](steps/step-53.md) | Checkout UI |
| [54](steps/step-54.md) | Orders API |
| [55](steps/step-55.md) | Health DB ping & graceful shutdown |
| [56](steps/step-56.md) | Orders UI |
| [57](steps/step-57.md) | Polish (optional) |
| [58](steps/step-58.md) | Final demo checklist |

---

## Weekly demos

| Week | Last step | Demo |
|------|-----------|------|
| 1 | 22 | Browse products as guest |
| 2 | 41 | Register → cart |
| 3 | 47 | Admin adds product with image |
| 4 | 58 | Full checkout + orders |

---

## When stuck

See [INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md) → **When students get stuck**
