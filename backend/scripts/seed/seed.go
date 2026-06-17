package main

import (
	"context"
	"database/sql"
	"fmt"
)

type seedProduct struct {
	name        string
	description string
	price       float64
	imageURL    string
	stock       int
}

var sampleProducts = []seedProduct{
	{
		name:        "Wireless Headphones",
		description: "Noise-cancelling over-ear headphones",
		price:       79.99,
		imageURL:    "https://placehold.co/400x400?text=Headphones",
		stock:       25,
	},
	{
		name:        "Mechanical Keyboard",
		description: "RGB mechanical keyboard with Cherry MX switches",
		price:       129.99,
		imageURL:    "https://placehold.co/400x400?text=Keyboard",
		stock:       15,
	},
	{
		name:        "USB-C Hub",
		description: "7-in-1 USB-C hub with HDMI and SD card reader",
		price:       49.99,
		imageURL:    "https://placehold.co/400x400?text=Hub",
		stock:       40,
	},
	{
		name:        "Laptop Stand",
		description: "Aluminum adjustable laptop stand",
		price:       34.99,
		imageURL:    "https://placehold.co/400x400?text=Stand",
		stock:       30,
	},
	{
		name:        "Webcam HD",
		description: "1080p webcam with built-in microphone",
		price:       59.99,
		imageURL:    "https://placehold.co/400x400?text=Webcam",
		stock:       20,
	},
}

func seed(ctx context.Context, db *sql.DB) error {
	if err := seedProducts(ctx, db); err != nil {
		return err
	}

	return seedAdmin(ctx, db)
}

func seedProducts(ctx context.Context, db *sql.DB) error {
	var count int
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM products`).Scan(&count); err != nil {
		return fmt.Errorf("count products: %w", err)
	}
	if count > 0 {
		return nil
	}

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin seed transaction: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareContext(ctx, `
		INSERT INTO products (name, description, price, image_url, stock)
		VALUES ($1, $2, $3, $4, $5)
	`)
	if err != nil {
		return fmt.Errorf("prepare seed insert: %w", err)
	}
	defer stmt.Close()

	for _, product := range sampleProducts {
		if _, err := stmt.ExecContext(
			ctx,
			product.name,
			product.description,
			product.price,
			product.imageURL,
			product.stock,
		); err != nil {
			return fmt.Errorf("insert product %q: %w", product.name, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit seed transaction: %w", err)
	}

	return nil
}
