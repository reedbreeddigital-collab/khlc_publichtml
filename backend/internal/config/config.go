package config

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"
)

// Config holds runtime configuration for the KHLC Go backend server.
type Config struct {
	Port                string
	Env                 string
	AllowedOrigin       string
	DatabaseURL         string
	DatabaseURLUnpooled string
	AdminEmail          string
	AdminPassword       string
	AdminJWTSecret      string
}

// Load reads .env.local / .env files (if present) and returns runtime configuration.
func Load() Config {
	loadDotEnvFiles(
		".env.local",
		".env",
		filepath.Join("..", ".env.local"),
		filepath.Join("..", ".env"),
	)

	adminPass := getEnv("ADMIN_PASSWORD", "KHLC-Evolve8!")
	jwtSecret := getEnv("ADMIN_JWT_SECRET", "khlc-evolve8-session-secret-"+adminPass)

	return Config{
		Port:                getEnv("PORT", "8080"),
		Env:                 getEnv("APP_ENV", "development"),
		AllowedOrigin:       getEnv("ALLOWED_ORIGIN", "http://localhost:3000"),
		DatabaseURL:         os.Getenv("DATABASE_URL"),
		DatabaseURLUnpooled: os.Getenv("DATABASE_URL_UNPOOLED"),
		AdminEmail:          getEnv("ADMIN_EMAIL", "admin@kingshouselearning.com"),
		AdminPassword:       adminPass,
		AdminJWTSecret:      jwtSecret,
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

// loadDotEnvFiles loads KEY=VALUE pairs into os.Environ without overwriting existing env vars.
func loadDotEnvFiles(paths ...string) {
	for _, p := range paths {
		f, err := os.Open(p)
		if err != nil {
			continue
		}
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			line = strings.TrimPrefix(line, "export ")
			idx := strings.IndexByte(line, '=')
			if idx <= 0 {
				continue
			}
			key := strings.TrimSpace(line[:idx])
			val := strings.TrimSpace(line[idx+1:])
			if len(val) >= 2 && ((val[0] == '"' && val[len(val)-1] == '"') || (val[0] == '\'' && val[len(val)-1] == '\'')) {
				val = val[1 : len(val)-1]
			}
			if key != "" && os.Getenv(key) == "" {
				_ = os.Setenv(key, val)
			}
		}
		_ = f.Close()
	}
}
