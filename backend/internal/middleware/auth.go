package middleware

import (
	"errors"
	"log"
	"strings"

	"github.com/abdamah/dailykode/sopify/backend/internal/auth"
	"github.com/abdamah/dailykode/sopify/backend/internal/models"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
)

const userLocalKey = "user"

type AuthMiddleware struct {
	jwtService *auth.JWTService
	userRepo   *repository.UserRepository
}

func NewAuthMiddleware(jwtService *auth.JWTService, userRepo *repository.UserRepository) *AuthMiddleware {
	return &AuthMiddleware{
		jwtService: jwtService,
		userRepo:   userRepo,
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

	claims, err := m.jwtService.Verify(token)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid token",
		})
	}

	user, err := m.userRepo.GetByID(c.Context(), claims.UserID)
	if errors.Is(err, repository.ErrUserInactive) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "account inactive",
		})
	}
	if err != nil {
		log.Printf("[api] load user %s: %v", claims.UserID, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid token",
		})
	}
	if user.Token == "" || user.Token != token {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid token",
		})
	}

	user.Password = ""
	user.Token = ""
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
