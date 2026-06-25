package handlers

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/abdamah/dailykode/sopify/backend/internal/models"
	"github.com/abdamah/dailykode/sopify/backend/internal/storage"
	"github.com/gofiber/fiber/v3"
)

func parseProductForm(c fiber.Ctx, uploads *storage.LocalStorage, requireImage bool) (models.CreateProductInput, error) {
	contentType := string(c.Request().Header.ContentType())
	if !strings.HasPrefix(contentType, "multipart/form-data") {
		return models.CreateProductInput{}, fmt.Errorf("multipart form data is required")
	}

	name := strings.TrimSpace(c.FormValue("name"))
	description := strings.TrimSpace(c.FormValue("description"))
	categoryID := strings.TrimSpace(c.FormValue("category_id"))

	price, err := strconv.ParseFloat(strings.TrimSpace(c.FormValue("price")), 64)
	if err != nil {
		return models.CreateProductInput{}, fmt.Errorf("price must be a valid number")
	}

	stock, err := strconv.Atoi(strings.TrimSpace(c.FormValue("stock")))
	if err != nil {
		return models.CreateProductInput{}, fmt.Errorf("stock must be a valid number")
	}

	input := models.CreateProductInput{
		Name:        name,
		Description: description,
		Price:       price,
		Stock:       stock,
		CategoryID:  categoryID,
	}

	file, err := c.FormFile("image")
	if err != nil {
		if requireImage {
			return models.CreateProductInput{}, fmt.Errorf("image is required")
		}
		return input, nil
	}

	if file.Size == 0 || strings.TrimSpace(file.Filename) == "" {
		if requireImage {
			return models.CreateProductInput{}, fmt.Errorf("image is required")
		}
		return input, nil
	}

	imageURL, err := uploads.SaveProductImage(file)
	if err != nil {
		return models.CreateProductInput{}, err
	}

	input.ImageURL = imageURL
	return input, nil
}
