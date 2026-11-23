package config

import "os"

// Config holds runtime configuration for the KHLC Go backend server.
type Config struct {
	Port          string
	Env           string
	AllowedOrigin string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() Config {
	return Config{
		Port:          getEnv("PORT", "8080"),
		Env:           getEnv("APP_ENV", "development"),
		AllowedOrigin: getEnv("ALLOWED_ORIGIN", "http://localhost:3000"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
