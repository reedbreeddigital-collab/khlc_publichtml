package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// HealthResponse represents the JSON payload returned by /api/v1/health.
type HealthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Database  string `json:"database"`
	Timestamp string `json:"timestamp"`
}

// NewHealthHandler returns a health endpoint that also verifies Neon Postgres connectivity when configured.
func NewHealthHandler(pool *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		dbStatus := "in-memory"
		statusCode := http.StatusOK
		overall := "ok"

		if pool != nil {
			ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
			defer cancel()
			if err := pool.Ping(ctx); err != nil {
				dbStatus = "error"
				overall = "degraded"
				statusCode = http.StatusServiceUnavailable
			} else {
				dbStatus = "connected"
			}
		}

		writeJSON(w, statusCode, HealthResponse{
			Status:    overall,
			Service:   "khlc-backend",
			Database:  dbStatus,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		})
	}
}

// Health handles GET /api/v1/health without a database dependency (used by unit tests).
func Health(w http.ResponseWriter, r *http.Request) {
	NewHealthHandler(nil)(w, r)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
