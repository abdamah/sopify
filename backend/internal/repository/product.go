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

const productSelectSQL = `
	SELECT
		p.id,
		p.name,
		p.description,
		p.price,
		p.image_url,
		p.stock,
		p.category_id,
		p.created_at,
		p.updated_at,
		c.id,
		c.name,
		c.slug,
		c.created_at
	FROM products p
	INNER JOIN categories c ON c.id = p.category_id
`

func scanProduct(scanner interface {
	Scan(dest ...any) error
}) (models.Product, error) {
	var product models.Product
	err := scanner.Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.ImageURL,
		&product.Stock,
		&product.CategoryID,
		&product.CreatedAt,
		&product.UpdatedAt,
		&product.Category.ID,
		&product.Category.Name,
		&product.Category.Slug,
		&product.Category.CreatedAt,
	)
	return product, err
}

func (r *ProductRepository) ListProducts(ctx context.Context, categorySlug string) ([]models.Product, error) {
	query := productSelectSQL
	args := []any{}

	if categorySlug != "" {
		query += ` WHERE c.slug = $1`
		args = append(args, categorySlug)
	}

	query += ` ORDER BY p.created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := make([]models.Product, 0)
	for rows.Next() {
		product, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, rows.Err()
}

func (r *ProductRepository) GetProductByID(ctx context.Context, id string) (*models.Product, error) {
	row := r.db.QueryRowContext(ctx, productSelectSQL+` WHERE p.id = $1`, id)

	product, err := scanProduct(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrProductNotFound
	}
	if err != nil {
		return nil, err
	}

	return &product, nil
}

func (r *ProductRepository) CreateProduct(ctx context.Context, input models.CreateProductInput) (*models.Product, error) {
	var id string
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO products (name, description, price, stock, category_id, image_url)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`, input.Name, input.Description, input.Price, input.Stock, input.CategoryID, input.ImageURL).Scan(&id)
	if err != nil {
		return nil, err
	}

	return r.GetProductByID(ctx, id)
}

func (r *ProductRepository) UpdateProduct(ctx context.Context, id string, input models.CreateProductInput) (*models.Product, error) {
	result, err := r.db.ExecContext(ctx, `
		UPDATE products
		SET name = $2,
		    description = $3,
		    price = $4,
		    stock = $5,
		    category_id = $6,
		    image_url = CASE WHEN $7 <> '' THEN $7 ELSE image_url END,
		    updated_at = NOW()
		WHERE id = $1
	`, id, input.Name, input.Description, input.Price, input.Stock, input.CategoryID, input.ImageURL)
	if err != nil {
		return nil, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, err
	}
	if rowsAffected == 0 {
		return nil, ErrProductNotFound
	}

	return r.GetProductByID(ctx, id)
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
