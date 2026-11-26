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

	"github.com/jackc/pgx/v5/pgxpool"

	"khlc-backend/internal/config"
	"khlc-backend/internal/db"
	"khlc-backend/internal/handlers"
	"khlc-backend/internal/mailer"
	"khlc-backend/internal/middleware"
	"khlc-backend/internal/quiz"
)

func main() {
	cfg := config.Load()
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	var pool *pgxpool.Pool
	if cfg.DatabaseURL != "" {
		initCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		if err := db.Migrate(initCtx, cfg.DatabaseURLUnpooled, cfg.DatabaseURL); err != nil {
			cancel()
			logger.Error("database migration failed", "err", err)
			os.Exit(1)
		}
		var err error
		pool, err = db.Connect(initCtx, cfg.DatabaseURL)
		if err != nil {
			cancel()
			logger.Error("database connection failed", "err", err)
			os.Exit(1)
		}
		if err := db.SeedQuizDefaults(initCtx, pool); err != nil {
			logger.Warn("default quiz seed skipped or failed", "err", err)
		}
		cancel()
		defer pool.Close()
		logger.Info("connected to Neon Lakebase Postgres and verified schema")
	} else {
		logger.Warn("DATABASE_URL is not set — running with volatile in-memory storage")
	}

	mux := http.NewServeMux()
	enquiryHandler := handlers.NewEnquiryHandler(pool)
	crmHandler := handlers.NewCrmHandler(pool)
	projectHandler := handlers.NewProjectHandler(pool)

	var quizStore quiz.Store
	if pool != nil {
		quizStore = quiz.NewPostgresStore(pool)
	} else {
		quizStore = quiz.NewMemoryStore()
	}

	smtpMailer := mailer.New(mailer.Config{
		Host:        cfg.SMTPHost,
		Port:        cfg.SMTPPort,
		User:        cfg.SMTPUser,
		Pass:        cfg.SMTPPass,
		From:        cfg.SMTPFrom,
		FrontendURL: cfg.FrontendURL,
	})
	evolveHandler := handlers.NewEvolveHandler(pool).
		WithQuizStore(quizStore).
		WithMailer(smtpMailer, logger)

	quizHandler := quiz.NewHandler(quizStore, cfg.AdminEmail, cfg.AdminPassword, cfg.AdminJWTSecret)
	protectAdmin := func(next http.HandlerFunc) http.HandlerFunc {
		return middleware.RequireAdmin(cfg.AdminJWTSecret, next)
	}

	// Health & Core KHLC routes
	mux.HandleFunc("GET /api/v1/health", handlers.NewHealthHandler(pool))
	mux.HandleFunc("POST /api/v1/enquiries", enquiryHandler.CreateEnquiry)
	mux.HandleFunc("GET /api/v1/enquiries", enquiryHandler.ListEnquiries)
	mux.HandleFunc("POST /api/v1/newsletter", enquiryHandler.SubscribeNewsletter)
	mux.HandleFunc("POST /api/v1/evolve/registrations", evolveHandler.CreateRegistration)
	mux.HandleFunc("GET /api/v1/evolve/registrations", evolveHandler.ListRegistrations)
	mux.HandleFunc("POST /api/v1/evolve/projects", projectHandler.SubmitProject)
	mux.HandleFunc("GET /api/v1/evolve/projects/lookup", projectHandler.LookupProject)
	mux.HandleFunc("GET /api/v1/crm/leads", crmHandler.ListLeads)
	mux.HandleFunc("POST /api/v1/crm/leads", crmHandler.CreateLead)
	mux.HandleFunc("PATCH /api/v1/crm/leads/{id}", crmHandler.UpdateLead)
	mux.HandleFunc("DELETE /api/v1/crm/leads/{id}", crmHandler.DeleteLead)

	// Public Evolve Results, Schedule & Rankings
	mux.HandleFunc("GET /api/v1/evolve/results", quizHandler.PublicResults)
	mux.HandleFunc("GET /api/v1/evolve/schedule", quizHandler.PublicSchedule)

	// Student Timed Quiz Portal
	mux.HandleFunc("POST /api/v1/quiz/login", quizHandler.StudentLogin)
	mux.HandleFunc("POST /api/v1/quiz/sessions/start", quizHandler.StartSession)
	mux.HandleFunc("PATCH /api/v1/quiz/sessions/{id}/answer", quizHandler.SaveAnswer)
	mux.HandleFunc("POST /api/v1/quiz/sessions/{id}/submit", quizHandler.SubmitSession)

	// Admin Auth & Protected Management
	mux.HandleFunc("POST /api/v1/admin/login", quizHandler.AdminLogin)
	mux.HandleFunc("GET /api/v1/admin/newsletter", protectAdmin(enquiryHandler.ListSubscribers))
	mux.HandleFunc("GET /api/v1/admin/projects", protectAdmin(projectHandler.ListProjects))
	mux.HandleFunc("PATCH /api/v1/admin/projects/{id}", protectAdmin(projectHandler.ReviewProject))
	mux.HandleFunc("GET /api/v1/admin/quizzes", protectAdmin(quizHandler.ListQuizzes))
	mux.HandleFunc("POST /api/v1/admin/quizzes", protectAdmin(quizHandler.CreateQuiz))
	mux.HandleFunc("PATCH /api/v1/admin/quizzes/{id}", protectAdmin(quizHandler.UpdateQuiz))
	mux.HandleFunc("DELETE /api/v1/admin/quizzes/{id}", protectAdmin(quizHandler.DeleteQuiz))

	mux.HandleFunc("GET /api/v1/admin/questions", protectAdmin(quizHandler.ListQuestions))
	mux.HandleFunc("POST /api/v1/admin/questions", protectAdmin(quizHandler.CreateQuestion))
	mux.HandleFunc("PATCH /api/v1/admin/questions/{id}", protectAdmin(quizHandler.UpdateQuestion))
	mux.HandleFunc("DELETE /api/v1/admin/questions/{id}", protectAdmin(quizHandler.DeleteQuestion))
	mux.HandleFunc("POST /api/v1/admin/questions/import", protectAdmin(quizHandler.ImportQuestions))

	mux.HandleFunc("GET /api/v1/admin/students", protectAdmin(quizHandler.ListStudents))
	mux.HandleFunc("POST /api/v1/admin/students", protectAdmin(quizHandler.CreateStudent))
	mux.HandleFunc("DELETE /api/v1/admin/students/{id}", protectAdmin(quizHandler.DeleteStudent))
	mux.HandleFunc("POST /api/v1/admin/students/import-registrations", protectAdmin(quizHandler.ImportRegisteredPupils))

	mux.HandleFunc("GET /api/v1/admin/attempts", protectAdmin(quizHandler.ListAttempts))
	mux.HandleFunc("POST /api/v1/admin/attempts/{id}/reset", protectAdmin(quizHandler.ResetAttempt))

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
			"postgres_enabled", pool != nil,
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
