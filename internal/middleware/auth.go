package middleware

import (
	"log"
	"strings"

	"github.com/abdamah/dailykode/sopify/backend/internal/auth"
	"github.com/abdamah/dailykode/sopify/backend/internal/models"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
)

const userLocalKey = "user"

type AuthMiddleware struct {
	verifier *auth.Verifier
	userRepo *repository.UserRepository
}

func NewAuthMiddleware(verifier *auth.Verifier, userRepo *repository.UserRepository) *AuthMiddleware {
	return &AuthMiddleware{
		verifier: verifier,
		userRepo: userRepo,
	}
}

func UserFromContext(c fiber.Ctx) (*models.User, bool) {
	user, ok := c.Locals(userLocalKey).(*models.User)
	return user, ok
}

func (m *AuthMiddleware) RequireAuth(c fiber.Ctx) error {
	token := bearerToken(c.Get("Authorization"))
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "missing or invalid authorization header",
		})
	}

	claims, err := m.verifier.Verify(token)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid token",
		})
	}

	user, err := m.userRepo.FindOrCreateByClerkID(c.Context(), claims.ClerkID, claims.Email, claims.Role)
	if err != nil {
		log.Printf("[api] find or create user %s: %v", claims.ClerkID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to load user",
		})
	}

	c.Locals(userLocalKey, user)
	return c.Next()
}

func (m *AuthMiddleware) RequireAdmin(c fiber.Ctx) error {
	user, ok := UserFromContext(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}
	if user.Role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "admin access required",
		})
	}

	return c.Next()
}

func bearerToken(header string) string {
	const prefix = "Bearer "
	if !strings.HasPrefix(header, prefix) {
		return ""
	}

	return strings.TrimSpace(strings.TrimPrefix(header, prefix))
}
