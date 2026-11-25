package middleware

import (
	"log/slog"
	"net/http"
	"strings"
	"time"
)

// CORS wraps an http.Handler to apply Cross-Origin Resource Sharing headers.
// allowedOrigin may be "*", a single origin, or a comma-separated list of origins.
func CORS(allowedOrigin string, next http.Handler) http.Handler {
	origins := make([]string, 0)
	allowAll := false
	for _, part := range strings.Split(allowedOrigin, ",") {
		trimmed := strings.TrimRight(strings.TrimSpace(part), "/")
		if trimmed == "" {
			continue
		}
		if trimmed == "*" {
			allowAll = true
		}
		origins = append(origins, trimmed)
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqOrigin := strings.TrimRight(strings.TrimSpace(r.Header.Get("Origin")), "/")
		headerOrigin := ""

		if allowAll {
			headerOrigin = "*"
		} else if reqOrigin != "" {
			for _, o := range origins {
				if strings.EqualFold(o, reqOrigin) {
					headerOrigin = reqOrigin
					break
				}
			}
			// In local dev, allow localhost/127.0.0.1 variants when a localhost origin is configured
			if headerOrigin == "" && (strings.HasPrefix(reqOrigin, "http://localhost:") || strings.HasPrefix(reqOrigin, "http://127.0.0.1:")) {
				for _, o := range origins {
					if strings.HasPrefix(o, "http://localhost:") || strings.HasPrefix(o, "http://127.0.0.1:") {
						headerOrigin = reqOrigin
						break
					}
				}
			}
		} else if len(origins) > 0 {
			headerOrigin = origins[0]
		}

		if headerOrigin != "" {
			w.Header().Set("Access-Control-Allow-Origin", headerOrigin)
		}
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Student-Token")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (sr *statusRecorder) WriteHeader(code int) {
	sr.status = code
	sr.ResponseWriter.WriteHeader(code)
}

// Logger logs method, path, status code, and duration for each HTTP request.
func Logger(logger *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)
		logger.Info("http request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rec.status,
			"duration", time.Since(start).String(),
		)
	})
}
