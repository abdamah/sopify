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

setup: migrate seed
