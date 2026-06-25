# Step 44 — Multipart product upload

**Week 3 — Admin** · Prev: [Step 43](step-43.md) · Next: [Step 45](step-45.md)

## Goal

Accept image file on create/update.

## Notes

Update product handlers for form-data. PATCH with empty image keeps existing image_url.

## Verify

Postman → Create product (with image) → image URL works.
