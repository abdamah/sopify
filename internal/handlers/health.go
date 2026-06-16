package handlers

import "github.com/gofiber/fiber/v3"

func Health(c fiber.Ctx) error {
	return c.SendString("App is Ok!")
}
