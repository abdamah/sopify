package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"

	"github.com/abdamah/dailykode/sopify/backend/internal/config"
	"github.com/abdamah/dailykode/sopify/backend/internal/models"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/webhook"
)

type StripeWebhookHandler struct {
	orderRepo   *repository.OrderRepository
	cartRepo    *repository.CartRepository
	productRepo *repository.ProductRepository
	cfg         *config.Config
}

func NewStripeWebhookHandler(
	orderRepo *repository.OrderRepository,
	cartRepo *repository.CartRepository,
	productRepo *repository.ProductRepository,
	cfg *config.Config,
) *StripeWebhookHandler {
	return &StripeWebhookHandler{
		orderRepo:   orderRepo,
		cartRepo:    cartRepo,
		productRepo: productRepo,
		cfg:         cfg,
	}
}

func (h *StripeWebhookHandler) Handle(c fiber.Ctx) error {
	if h.cfg.StripeWebhookSecret == "" {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "stripe webhooks are not configured",
		})
	}

	payload := c.Body()
	signature := c.Get("Stripe-Signature")

	event, err := webhook.ConstructEventWithOptions(
		payload,
		signature,
		h.cfg.StripeWebhookSecret,
		webhook.ConstructEventOptions{
			IgnoreAPIVersionMismatch: true,
		},
	)
	if err != nil {
		log.Printf("[webhook] invalid stripe signature: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid signature",
		})
	}

	switch event.Type {
	case "checkout.session.completed":
		if err := h.handleCheckoutCompleted(c.Context(), event); err != nil {
			log.Printf("[webhook] checkout.session.completed: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to process checkout session",
			})
		}
	default:
		log.Printf("[webhook] ignored event type: %s", event.Type)
	}

	return c.SendStatus(fiber.StatusOK)
}

func (h *StripeWebhookHandler) handleCheckoutCompleted(ctx context.Context, event stripe.Event) error {
	var session stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
		return err
	}

	if session.ID == "" {
		return errors.New("checkout session id is missing")
	}

	existing, err := h.orderRepo.GetByStripeSessionID(ctx, session.ID)
	if err == nil {
		if clearErr := h.cartRepo.ClearByUserID(ctx, existing.UserID); clearErr != nil {
			return clearErr
		}
		return nil
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return err
	}

	userID := session.Metadata["user_id"]
	if userID == "" {
		return errors.New("checkout session metadata user_id is missing")
	}

	items, err := h.cartRepo.ListByUserID(ctx, userID)
	if err != nil {
		return err
	}
	if len(items) == 0 {
		return errors.New("cart is empty for completed checkout session")
	}

	orderItems := make([]models.OrderItem, 0, len(items))
	var total float64
	for _, item := range items {
		total += item.LineTotal
		orderItems = append(orderItems, models.OrderItem{
			ProductID: item.Product.ID,
			Quantity:  item.Quantity,
			Price:     item.Product.Price,
		})
	}

	_, err = h.orderRepo.Create(ctx, repository.CreateOrderInput{
		UserID:          userID,
		Total:           total,
		Status:          "paid",
		StripeSessionID: session.ID,
		Items:           orderItems,
	})
	if err != nil {
		return err
	}

	for _, item := range orderItems {
		if err := h.productRepo.DecrementStock(ctx, item.ProductID, item.Quantity); err != nil {
			return err
		}
	}

	if err := h.cartRepo.ClearByUserID(ctx, userID); err != nil {
		return err
	}

	log.Printf("[webhook] order created for user %s session %s", userID, session.ID)
	return nil
}
