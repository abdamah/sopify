package models

import "time"

type Order struct {
	ID              string      `json:"id"`
	UserID          string      `json:"user_id"`
	UserEmail       string      `json:"user_email,omitempty"`
	Total           float64     `json:"total"`
	Status          string      `json:"status"`
	StripeSessionID string      `json:"stripe_session_id,omitempty"`
	Items           []OrderItem `json:"items,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}

type OrderItem struct {
	ID          string    `json:"id"`
	OrderID     string    `json:"order_id"`
	ProductID   string    `json:"product_id"`
	ProductName string    `json:"product_name,omitempty"`
	Quantity    int       `json:"quantity"`
	Price       float64   `json:"price"`
	CreatedAt   time.Time `json:"created_at"`
}

type CheckoutResponse struct {
	URL string `json:"url"`
}
