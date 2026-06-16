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

setup: migrate seed
