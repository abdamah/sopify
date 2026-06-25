package repository

import (
	"context"
	"database/sql"

	"github.com/abdamah/dailykode/sopify/backend/internal/models"
)

type OrderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

type CreateOrderInput struct {
	UserID          string
	Total           float64
	Status          string
	StripeSessionID string
	Items           []models.OrderItem
}

func (r *OrderRepository) Create(ctx context.Context, input CreateOrderInput) (*models.Order, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var order models.Order
	err = tx.QueryRowContext(ctx, `
		INSERT INTO orders (user_id, total, status, stripe_session_id)
		VALUES ($1, $2, $3, NULLIF($4, ''))
		RETURNING id, user_id, total, status, COALESCE(stripe_session_id, ''), created_at, updated_at
	`, input.UserID, input.Total, input.Status, input.StripeSessionID).Scan(
		&order.ID,
		&order.UserID,
		&order.Total,
		&order.Status,
		&order.StripeSessionID,
		&order.CreatedAt,
		&order.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	order.Items = make([]models.OrderItem, 0, len(input.Items))
	for _, item := range input.Items {
		var saved models.OrderItem
		err := tx.QueryRowContext(ctx, `
			INSERT INTO order_items (order_id, product_id, quantity, price)
			VALUES ($1, $2, $3, $4)
			RETURNING id, order_id, product_id, quantity, price, created_at
		`, order.ID, item.ProductID, item.Quantity, item.Price).Scan(
			&saved.ID,
			&saved.OrderID,
			&saved.ProductID,
			&saved.Quantity,
			&saved.Price,
			&saved.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		order.Items = append(order.Items, saved)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *OrderRepository) GetByStripeSessionID(ctx context.Context, sessionID string) (*models.Order, error) {
	var order models.Order
	err := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, total, status, COALESCE(stripe_session_id, ''), created_at, updated_at
		FROM orders
		WHERE stripe_session_id = $1
	`, sessionID).Scan(
		&order.ID,
		&order.UserID,
		&order.Total,
		&order.Status,
		&order.StripeSessionID,
		&order.CreatedAt,
		&order.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *OrderRepository) ListAllWithItems(ctx context.Context) ([]models.Order, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT
			o.id,
			o.user_id,
			u.email,
			o.total,
			o.status,
			COALESCE(o.stripe_session_id, ''),
			o.created_at,
			o.updated_at
		FROM orders o
		INNER JOIN users u ON u.id = o.user_id
		ORDER BY o.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := make([]models.Order, 0)
	orderIndex := make(map[string]int)

	for rows.Next() {
		var order models.Order
		if err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.UserEmail,
			&order.Total,
			&order.Status,
			&order.StripeSessionID,
			&order.CreatedAt,
			&order.UpdatedAt,
		); err != nil {
			return nil, err
		}

		order.Items = make([]models.OrderItem, 0)
		orderIndex[order.ID] = len(orders)
		orders = append(orders, order)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(orders) == 0 {
		return orders, nil
	}

	itemRows, err := r.db.QueryContext(ctx, `
		SELECT
			oi.id,
			oi.order_id,
			oi.product_id,
			p.name,
			oi.quantity,
			oi.price,
			oi.created_at
		FROM order_items oi
		INNER JOIN products p ON p.id = oi.product_id
		ORDER BY oi.order_id, oi.created_at
	`)
	if err != nil {
		return nil, err
	}
	defer itemRows.Close()

	for itemRows.Next() {
		var item models.OrderItem
		if err := itemRows.Scan(
			&item.ID,
			&item.OrderID,
			&item.ProductID,
			&item.ProductName,
			&item.Quantity,
			&item.Price,
			&item.CreatedAt,
		); err != nil {
			return nil, err
		}

		idx, ok := orderIndex[item.OrderID]
		if !ok {
			continue
		}
		orders[idx].Items = append(orders[idx].Items, item)
	}

	return orders, itemRows.Err()
}

func (r *OrderRepository) MarkPaid(ctx context.Context, orderID string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE orders
		SET status = 'paid',
		    updated_at = NOW()
		WHERE id = $1
	`, orderID)
	return err
}
