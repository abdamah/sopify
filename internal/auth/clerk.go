package auth

import (
	"fmt"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
)

type ClerkClaims struct {
	ClerkID string
	Email   string
	Role    string
}

type Verifier struct {
	keyFunc keyfunc.Keyfunc
	issuer  string
}

type clerkTokenClaims struct {
	jwt.RegisteredClaims
	Email          string                 `json:"email"`
	PublicMetadata map[string]interface{} `json:"public_metadata"`
}

func NewVerifier(jwksURL, issuer string) (*Verifier, error) {
	k, err := keyfunc.NewDefault([]string{jwksURL})
	if err != nil {
		return nil, fmt.Errorf("init jwks: %w", err)
	}

	return &Verifier{
		keyFunc: k,
		issuer:  issuer,
	}, nil
}

func (v *Verifier) Verify(tokenString string) (*ClerkClaims, error) {
	claims := &clerkTokenClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, v.keyFunc.Keyfunc)
	if err != nil {
		return nil, fmt.Errorf("parse token: %w", err)
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	if claims.Subject == "" {
		return nil, fmt.Errorf("missing subject claim")
	}

	if claims.Issuer != v.issuer {
		return nil, fmt.Errorf("invalid issuer")
	}

	return &ClerkClaims{
		ClerkID: claims.Subject,
		Email:   claims.Email,
		Role:    roleFromMetadata(claims.PublicMetadata),
	}, nil
}

func roleFromMetadata(metadata map[string]any) string {
	if metadata == nil {
		return "customer"
	}

	role, ok := metadata["role"].(string)
	if !ok || role == "" {
		return "customer"
	}
	if role != "admin" {
		return "customer"
	}

	return "admin"
}
