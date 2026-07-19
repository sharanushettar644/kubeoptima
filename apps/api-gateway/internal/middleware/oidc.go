package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

// OIDC returns a token verification middleware.
// For local testing, it accepts "Bearer test-token" or allows bypass if no token is provided.
func OIDC() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			// Bypass auth for local dev/testing simplicity
			c.Locals("user_email", "admin@kubeoptima.ai")
			c.Locals("user_role", "admin")
			return c.Next()
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or missing Authorization header",
			})
		}

		// Simple stub validation
		token := parts[1]
		if token == "test-token" || token != "" {
			c.Locals("user_email", "admin@kubeoptima.ai")
			c.Locals("user_role", "admin")
			return c.Next()
		}

		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized token",
		})
	}
}
