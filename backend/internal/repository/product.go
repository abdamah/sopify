package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/abdamah/dailykode/sopify/backend/internal/models"
)

var ErrProductNotFound = errors.New("product not found")

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) ListProducts(ctx context.Context) ([]models.Product, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, name, description, price, image_url, stock, created_at, updated_at
		FROM products
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := make([]models.Product, 0)
	for rows.Next() {
		var product models.Product
		if err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Description,
			&product.Price,
			&product.ImageURL,
			&product.Stock,
			&product.CreatedAt,
			&product.UpdatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, rows.Err()
}

func (r *ProductRepository) GetProductByID(ctx context.Context, id string) (*models.Product, error) {
	var product models.Product
	err := r.db.QueryRowContext(ctx, `
		SELECT id, name, description, price, image_url, stock, created_at, updated_at
		FROM products
		WHERE id = $1
	`, id).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.ImageURL,
		&product.Stock,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrProductNotFound
	}
	if err != nil {
		return nil, err
	}

	return &product, nil
}

func (r *ProductRepository) CreateProduct(ctx context.Context, input models.CreateProductInput) (*models.Product, error) {
	var product models.Product
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO products (name, description, price, stock)
		VALUES ($1, $2, $3, $4)
		RETURNING id, name, description, price, image_url, stock, created_at, updated_at
	`, input.Name, input.Description, input.Price, input.Stock).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.ImageURL,
		&product.Stock,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &product, nil
}

func (r *ProductRepository) UpdateProduct(ctx context.Context, id string, input models.CreateProductInput) (*models.Product, error) {
	var product models.Product
	err := r.db.QueryRowContext(ctx, `
		UPDATE products
		SET name = $2,
		    description = $3,
		    price = $4,
		    stock = $5,
		    updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, description, price, image_url, stock, created_at, updated_at
	`, id, input.Name, input.Description, input.Price, input.Stock).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.ImageURL,
		&product.Stock,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrProductNotFound
	}
	if err != nil {
		return nil, err
	}

	return &product, nil
}

func (r *ProductRepository) DeleteProduct(ctx context.Context, id string) error {
	row, err := r.db.ExecContext(ctx, `DELETE FROM products WHERE id = $1`, id)
	if err != nil {
		return err
	}

	rowsAffected, err := row.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrProductNotFound
	}

	return nil
}
