package handlers

import (
	"log"
	"math"

	"github.com/abdamah/dailykode/sopify/backend/internal/config"
	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"
)

type CheckoutHandler struct {
	cartRepo *repository.CartRepository
	cfg      *config.Config
}

func NewCheckoutHandler(cartRepo *repository.CartRepository, cfg *config.Config) *CheckoutHandler {
	return &CheckoutHandler{
		cartRepo: cartRepo,
		cfg:      cfg,
	}
}

func (h *CheckoutHandler) CreateSession(c fiber.Ctx) error {
	if h.cfg.StripeSecretKey == "" {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "stripe is not configured",
		})
	}

	user, ok := middleware.UserFromContext(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	items, err := h.cartRepo.ListByUserID(c.Context(), user.ID)
	if err != nil {
		log.Printf("[api] checkout list cart for user %s: %v", user.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to start checkout",
		})
	}

	if len(items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "cart is empty",
		})
	}

	stripe.Key = h.cfg.StripeSecretKey

	lineItems := make([]*stripe.CheckoutSessionLineItemParams, 0, len(items))
	for _, item := range items {
		unitAmount := int64(math.Round(item.Product.Price * 100))
		if unitAmount <= 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid product price in cart",
			})
		}

		lineItems = append(lineItems, &stripe.CheckoutSessionLineItemParams{
			Quantity: stripe.Int64(int64(item.Quantity)),
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency: stripe.String(string(stripe.CurrencyUSD)),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
					Name: stripe.String(item.Product.Name),
				},
				UnitAmount: stripe.Int64(unitAmount),
			},
		})
	}

	params := &stripe.CheckoutSessionParams{
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems:  lineItems,
		SuccessURL: stripe.String(h.cfg.FrontendURL + "/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String(h.cfg.FrontendURL + "/checkout/cancel"),
		Metadata: map[string]string{
			"user_id": user.ID,
		},
	}

	checkoutSession, err := session.New(params)
	if err != nil {
		log.Printf("[api] create stripe session for user %s: %v", user.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create checkout session",
		})
	}

	return c.JSON(fiber.Map{
		"url": checkoutSession.URL,
	})
}
