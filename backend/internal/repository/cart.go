package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/abdamah/dailykode/sopify/backend/internal/models"
)

var ErrCartItemNotFound = errors.New("cart item not found")

type CartRepository struct {
	db *sql.DB
}

func NewCartRepository(db *sql.DB) *CartRepository {
	return &CartRepository{db: db}
}

func (r *CartRepository) ListByUserID(ctx context.Context, userID string) ([]models.CartItem, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT
			ci.id,
			ci.quantity,
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
		FROM cart_items ci
		INNER JOIN products p ON p.id = ci.product_id
		INNER JOIN categories c ON c.id = p.category_id
		WHERE ci.user_id = $1
		ORDER BY ci.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.CartItem, 0)
	for rows.Next() {
		var item models.CartItem
		if err := rows.Scan(
			&item.ID,
			&item.Quantity,
			&item.Product.ID,
			&item.Product.Name,
			&item.Product.Description,
			&item.Product.Price,
			&item.Product.ImageURL,
			&item.Product.Stock,
			&item.Product.CategoryID,
			&item.Product.CreatedAt,
			&item.Product.UpdatedAt,
			&item.Product.Category.ID,
			&item.Product.Category.Name,
			&item.Product.Category.Slug,
			&item.Product.Category.CreatedAt,
		); err != nil {
			return nil, err
		}
		item.LineTotal = item.Product.Price * float64(item.Quantity)
		items = append(items, item)
	}

	return items, rows.Err()
}

func (r *CartRepository) GetItemQuantity(ctx context.Context, userID, productID string) (int, error) {
	var quantity int
	err := r.db.QueryRowContext(ctx, `
		SELECT quantity
		FROM cart_items
		WHERE user_id = $1 AND product_id = $2
	`, userID, productID).Scan(&quantity)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}

	return quantity, nil
}

func (r *CartRepository) AddItem(ctx context.Context, userID, productID string, quantity int) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO cart_items (user_id, product_id, quantity)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, product_id) DO UPDATE
		SET quantity = cart_items.quantity + EXCLUDED.quantity,
		    updated_at = NOW()
	`, userID, productID, quantity)
	return err
}

func (r *CartRepository) UpdateItemQuantity(ctx context.Context, userID, productID string, quantity int) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE cart_items
		SET quantity = $3,
		    updated_at = NOW()
		WHERE user_id = $1 AND product_id = $2
	`, userID, productID, quantity)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrCartItemNotFound
	}

	return nil
}

func (r *CartRepository) ClearByUserID(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx, `
		DELETE FROM cart_items
		WHERE user_id = $1
	`, userID)
	return err
}

func (r *CartRepository) DeleteItem(ctx context.Context, userID, productID string) error {
	result, err := r.db.ExecContext(ctx, `
		DELETE FROM cart_items
		WHERE user_id = $1 AND product_id = $2
	`, userID, productID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrCartItemNotFound
	}

	return nil
}
