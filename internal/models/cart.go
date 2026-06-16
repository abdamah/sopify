package models

type CartItem struct {
	ID        string  `json:"id"`
	Quantity  int     `json:"quantity"`
	Product   Product `json:"product"`
	LineTotal float64 `json:"line_total"`
}

type CartResponse struct {
	Items []CartItem `json:"items"`
	Total float64    `json:"total"`
}

type AddCartItemInput struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}
