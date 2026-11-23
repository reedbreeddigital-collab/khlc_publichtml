package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"khlc-backend/internal/config"
	"khlc-backend/internal/handlers"
	"khlc-backend/internal/middleware"
)

func main() {
	cfg := config.Load()
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	mux := http.NewServeMux()
	enquiryHandler := handlers.NewEnquiryHandler()

	// API v1 routes (Go 1.22+ method-aware routing)
	mux.HandleFunc("GET /api/v1/health", handlers.Health)
	mux.HandleFunc("POST /api/v1/enquiries", enquiryHandler.CreateEnquiry)
	mux.HandleFunc("GET /api/v1/enquiries", enquiryHandler.ListEnquiries)
	mux.HandleFunc("POST /api/v1/newsletter", enquiryHandler.SubscribeNewsletter)

	handler := middleware.Logger(logger, middleware.CORS(cfg.AllowedOrigin, mux))

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	// Graceful shutdown listener
	go func() {
		logger.Info("starting KHLC Go backend",
			"port", cfg.Port,
			"env", cfg.Env,
			"allowed_origin", cfg.AllowedOrigin,
		)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("server error", "err", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	logger.Info("shutting down server gracefully")
	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("graceful shutdown failed", "err", err)
	}
}
