ifneq (,$(wildcard .env))
include .env
export
endif

.PHONY: run seed migrate setup

run:
	go run ./cmd/api

seed:
	go run ./scripts/seed

migrate:
	psql "$(DATABASE_URL)" -f migrations/001_create_products.sql
	psql "$(DATABASE_URL)" -f migrations/002_create_users.sql
	psql "$(DATABASE_URL)" -f migrations/004_recreate_users.sql
	psql "$(DATABASE_URL)" -f migrations/005_create_cart_items.sql
	psql "$(DATABASE_URL)" -f migrations/006_create_categories.sql
	psql "$(DATABASE_URL)" -f migrations/007_create_orders.sql

setup: migrate seed
