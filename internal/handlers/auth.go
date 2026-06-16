package handlers

import (
	"errors"
	"log"
	"strings"

	"github.com/abdamah/dailykode/sopify/backend/internal/auth"
	"github.com/abdamah/dailykode/sopify/backend/internal/middleware"
	"github.com/abdamah/dailykode/sopify/backend/internal/models"
	"github.com/abdamah/dailykode/sopify/backend/internal/repository"
	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	userRepo   *repository.UserRepository
	jwtService *auth.JWTService
}

func NewAuthHandler(userRepo *repository.UserRepository, jwtService *auth.JWTService) *AuthHandler {
	return &AuthHandler{
		userRepo:   userRepo,
		jwtService: jwtService,
	}
}

func (h *AuthHandler) Register(c fiber.Ctx) error {
	var input models.RegisterInput
	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	if errMsg := validateAuthInput(input.Email, input.Password); errMsg != "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": errMsg,
		})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[api] hash password: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create user",
		})
	}

	user, err := h.userRepo.CreateWithPassword(c.Context(), input.Email, string(hash))
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "email already registered",
			})
		}
		log.Printf("[api] register user: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create user",
		})
	}

	token, err := h.jwtService.Sign(user.ID, user.Email, user.Role)
	if err != nil {
		log.Printf("[api] sign token: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create token",
		})
	}

	user, err = h.userRepo.SaveToken(c.Context(), user.ID, token)
	if err != nil {
		log.Printf("[api] save token: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create token",
		})
	}

	user.Password = ""
	user.Token = ""
	return c.Status(fiber.StatusCreated).JSON(models.AuthResponse{
		Token: token,
		User:  *user,
	})
}

func (h *AuthHandler) Login(c fiber.Ctx) error {
	var input models.LoginInput
	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	if input.Email == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "email and password are required",
		})
	}

	user, err := h.userRepo.GetByEmail(c.Context(), input.Email)
	if errors.Is(err, repository.ErrUserNotFound) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid email or password",
		})
	}
	if errors.Is(err, repository.ErrUserInactive) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "account inactive",
		})
	}
	if err != nil {
		log.Printf("[api] get user by email: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to login",
		})
	}
	if user.Password == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid email or password",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid email or password",
		})
	}

	token, err := h.jwtService.Sign(user.ID, user.Email, user.Role)
	if err != nil {
		log.Printf("[api] sign token: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create token",
		})
	}

	user, err = h.userRepo.SaveToken(c.Context(), user.ID, token)
	if errors.Is(err, repository.ErrUserInactive) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "account inactive",
		})
	}
	if err != nil {
		log.Printf("[api] save token: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to login",
		})
	}

	user.Password = ""
	user.Token = ""
	return c.JSON(models.AuthResponse{
		Token: token,
		User:  *user,
	})
}

func (h *AuthHandler) Logout(c fiber.Ctx) error {
	user, ok := middleware.UserFromContext(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	if err := h.userRepo.ClearToken(c.Context(), user.ID); err != nil {
		log.Printf("[api] clear token for user %s: %v", user.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to logout",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func validateAuthInput(email, password string) string {
	switch {
	case email == "":
		return "email is required"
	case password == "":
		return "password is required"
	case len(password) < 8:
		return "password must be at least 8 characters"
	}
	return ""
}
