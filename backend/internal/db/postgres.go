package db

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Connect creates a pooled PostgreSQL connection suitable for Neon Lakebase Postgres.
func Connect(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	poolCfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("parse DATABASE_URL: %w", err)
	}

	poolCfg.MaxConns = 10
	poolCfg.MinConns = 1
	poolCfg.MaxConnLifetime = 30 * time.Minute
	poolCfg.MaxConnIdleTime = 5 * time.Minute
	poolCfg.HealthCheckPeriod = 1 * time.Minute

	// PgBouncer transaction pooling (-pooler) does not persist server-side prepared statements.
	if strings.Contains(databaseURL, "-pooler") {
		poolCfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol
	}

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		return nil, fmt.Errorf("create pgx pool: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return pool, nil
}

// Migrate applies idempotent DDL migrations using the direct (unpooled) connection string when available.
func Migrate(ctx context.Context, unpooledURL, fallbackPooledURL string) error {
	targetURL := strings.TrimSpace(unpooledURL)
	if targetURL == "" {
		targetURL = strings.TrimSpace(fallbackPooledURL)
	}
	if targetURL == "" {
		return nil
	}

	connCfg, err := pgx.ParseConfig(targetURL)
	if err != nil {
		return fmt.Errorf("parse migration connection string: %w", err)
	}
	if strings.Contains(targetURL, "-pooler") {
		connCfg.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol
	}

	migCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	conn, err := pgx.ConnectConfig(migCtx, connCfg)
	if err != nil {
		return fmt.Errorf("connect for migrations: %w", err)
	}
	defer conn.Close(migCtx)

	statements := []string{
		`CREATE TABLE IF NOT EXISTS enquiries (
			id TEXT PRIMARY KEY,
			pathway TEXT NOT NULL,
			full_name TEXT NOT NULL,
			phone TEXT NOT NULL,
			email TEXT NOT NULL,
			org_detail TEXT NOT NULL DEFAULT '',
			focus TEXT NOT NULL DEFAULT '',
			message TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
			email TEXT PRIMARY KEY,
			subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS evolve_registrations (
			id TEXT PRIMARY KEY,
			reference_id TEXT NOT NULL UNIQUE,
			track TEXT NOT NULL,
			school_name TEXT NOT NULL,
			school_location TEXT NOT NULL DEFAULT '',
			school_address TEXT NOT NULL DEFAULT '',
			school_type TEXT NOT NULL DEFAULT '',
			coordinator_name TEXT NOT NULL,
			coordinator_role TEXT NOT NULL DEFAULT '',
			phone TEXT NOT NULL,
			email TEXT NOT NULL,
			device_preference TEXT NOT NULL DEFAULT '',
			test_pupils JSONB NOT NULL DEFAULT '[]'::jsonb,
			project_category TEXT NOT NULL DEFAULT '',
			project_path TEXT NOT NULL DEFAULT '',
			project_theme TEXT NOT NULL DEFAULT '',
			supervising_teacher TEXT NOT NULL DEFAULT '',
			project_team JSONB NOT NULL DEFAULT '[]'::jsonb,
			project_idea TEXT NOT NULL DEFAULT '',
			ndpa_consent BOOLEAN NOT NULL DEFAULT FALSE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS crm_leads (
			id TEXT PRIMARY KEY,
			organization TEXT NOT NULL,
			contact_name TEXT NOT NULL,
			contact_role TEXT NOT NULL DEFAULT '',
			segment TEXT NOT NULL DEFAULT '',
			stage TEXT NOT NULL DEFAULT 'new',
			priority TEXT NOT NULL DEFAULT 'Medium',
			phone TEXT NOT NULL DEFAULT '',
			email TEXT NOT NULL DEFAULT '',
			location TEXT NOT NULL DEFAULT '',
			program_interest TEXT NOT NULL DEFAULT '',
			student_count INTEGER NOT NULL DEFAULT 0,
			estimated_value_ngn INTEGER NOT NULL DEFAULT 0,
			assigned_to TEXT NOT NULL DEFAULT '',
			next_follow_up TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL DEFAULT '',
			notes TEXT NOT NULL DEFAULT '',
			activities JSONB NOT NULL DEFAULT '[]'::jsonb,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS quizzes (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			edition TEXT NOT NULL DEFAULT 'Evolve 8.0',
			level TEXT NOT NULL,
			topics JSONB NOT NULL DEFAULT '[]'::jsonb,
			question_limit INTEGER NOT NULL DEFAULT 0,
			duration_minutes INTEGER NOT NULL DEFAULT 30,
			starts_at TIMESTAMPTZ NOT NULL,
			ends_at TIMESTAMPTZ NOT NULL,
			max_score INTEGER NOT NULL DEFAULT 1000,
			pass_mark INTEGER NOT NULL DEFAULT 700,
			shuffle_questions BOOLEAN NOT NULL DEFAULT TRUE,
			shuffle_options BOOLEAN NOT NULL DEFAULT FALSE,
			status TEXT NOT NULL DEFAULT 'draft',
			results_published BOOLEAN NOT NULL DEFAULT FALSE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS topics JSONB NOT NULL DEFAULT '[]'::jsonb`,
		`ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS question_limit INTEGER NOT NULL DEFAULT 0`,
		`CREATE TABLE IF NOT EXISTS questions (
			id TEXT PRIMARY KEY,
			quiz_id TEXT NOT NULL DEFAULT '',
			level_scope TEXT NOT NULL DEFAULT 'shared',
			topic TEXT NOT NULL DEFAULT 'Digital Literacy',
			prompt TEXT NOT NULL,
			option_a TEXT NOT NULL,
			option_b TEXT NOT NULL,
			option_c TEXT NOT NULL,
			option_d TEXT NOT NULL,
			correct_option TEXT NOT NULL,
			points INTEGER NOT NULL DEFAULT 10,
			active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_questions_level_active ON questions (level_scope, active)`,
		`CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions (quiz_id)`,
		`CREATE TABLE IF NOT EXISTS students (
			id TEXT PRIMARY KEY,
			exam_code TEXT NOT NULL UNIQUE,
			pin_code TEXT NOT NULL,
			pin_hash TEXT NOT NULL,
			full_name TEXT NOT NULL,
			school_name TEXT NOT NULL,
			school_location TEXT NOT NULL DEFAULT '',
			level TEXT NOT NULL,
			class_name TEXT NOT NULL DEFAULT '',
			registration_ref TEXT NOT NULL DEFAULT '',
			phase2_video_url TEXT NOT NULL DEFAULT '',
			phase2_video_updated_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`ALTER TABLE students ADD COLUMN IF NOT EXISTS phase2_video_url TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE students ADD COLUMN IF NOT EXISTS phase2_video_updated_at TIMESTAMPTZ`,
		`CREATE INDEX IF NOT EXISTS idx_students_level ON students (level)`,
		`CREATE INDEX IF NOT EXISTS idx_students_registration_ref ON students (registration_ref)`,
		`CREATE TABLE IF NOT EXISTS quiz_attempts (
			id TEXT PRIMARY KEY,
			quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
			student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
			question_order JSONB NOT NULL DEFAULT '[]'::jsonb,
			started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			expires_at TIMESTAMPTZ NOT NULL,
			submitted_at TIMESTAMPTZ,
			time_taken_seconds INTEGER NOT NULL DEFAULT 0,
			raw_correct INTEGER NOT NULL DEFAULT 0,
			total_questions INTEGER NOT NULL DEFAULT 0,
			score_out_of_1000 INTEGER NOT NULL DEFAULT 0,
			passed BOOLEAN NOT NULL DEFAULT FALSE,
			tab_switch_count INTEGER NOT NULL DEFAULT 0,
			status TEXT NOT NULL DEFAULT 'in_progress'
		)`,
		`CREATE INDEX IF NOT EXISTS idx_attempts_quiz_student ON quiz_attempts (quiz_id, student_id)`,
		`CREATE INDEX IF NOT EXISTS idx_attempts_leaderboard ON quiz_attempts (quiz_id, status, passed, score_out_of_1000 DESC, time_taken_seconds ASC)`,
		`CREATE TABLE IF NOT EXISTS attempt_answers (
			attempt_id TEXT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
			question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
			selected_option TEXT NOT NULL,
			is_correct BOOLEAN NOT NULL DEFAULT FALSE,
			answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			PRIMARY KEY (attempt_id, question_id)
		)`,
		`CREATE TABLE IF NOT EXISTS project_submissions (
			id TEXT PRIMARY KEY,
			reference_id TEXT NOT NULL UNIQUE,
			school_name TEXT NOT NULL,
			category TEXT NOT NULL DEFAULT 'Primary',
			project_path TEXT NOT NULL DEFAULT 'Coding',
			project_theme TEXT NOT NULL DEFAULT '',
			supervising_teacher TEXT NOT NULL DEFAULT '',
			team_members JSONB NOT NULL DEFAULT '[]'::jsonb,
			problem_statement TEXT NOT NULL DEFAULT '',
			solution_summary TEXT NOT NULL DEFAULT '',
			how_it_works TEXT NOT NULL DEFAULT '',
			expected_impact TEXT NOT NULL DEFAULT '',
			milestones TEXT NOT NULL DEFAULT '',
			word_count INTEGER NOT NULL DEFAULT 0,
			video_url TEXT NOT NULL DEFAULT '',
			instructor_feedback TEXT NOT NULL DEFAULT '',
			judging_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
			total_marks INTEGER NOT NULL DEFAULT 0,
			status TEXT NOT NULL DEFAULT 'submitted',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_project_submissions_ref ON project_submissions (reference_id)`,
		`CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON project_submissions (status, total_marks DESC)`,
	}

	for _, stmt := range statements {
		if _, err := conn.Exec(migCtx, stmt); err != nil {
			return fmt.Errorf("apply migration: %w", err)
		}
	}

	return nil
}

// SeedQuizDefaults populates starter Evolve 8.0 quizzes, questions, and demo pupils if no quizzes exist yet.
func SeedQuizDefaults(ctx context.Context, pool *pgxpool.Pool) error {
	var count int
	if err := pool.QueryRow(ctx, `SELECT COUNT(*) FROM quizzes`).Scan(&count); err != nil {
		return fmt.Errorf("check quizzes count: %w", err)
	}
	if count > 0 {
		return nil
	}

	now := time.Now().UTC()
	startsAt := now.Add(-24 * time.Hour)
	endsAt := now.Add(14 * 24 * time.Hour)

	type seedQuiz struct {
		id, title, level string
	}
	quizzes := []seedQuiz{
		{"quiz_ev8_junior", "Evolve 8.0 Phase 1 — Junior National Online Test", "junior"},
		{"quiz_ev8_intermediate", "Evolve 8.0 Phase 1 — Intermediate National Online Test", "intermediate"},
		{"quiz_ev8_senior", "Evolve 8.0 Phase 1 — Senior National Online Test", "senior"},
	}

	for _, q := range quizzes {
		_, err := pool.Exec(ctx, `
			INSERT INTO quizzes (id, title, edition, level, duration_minutes, starts_at, ends_at, max_score, pass_mark, shuffle_questions, shuffle_options, status, results_published)
			VALUES ($1, $2, 'Evolve 8.0', $3, 30, $4, $5, 1000, 700, TRUE, FALSE, 'live', FALSE)
			ON CONFLICT (id) DO NOTHING
		`, q.id, q.title, q.level, startsAt, endsAt)
		if err != nil {
			return fmt.Errorf("seed quiz %s: %w", q.id, err)
		}
	}

	type seedQuestion struct {
		id, levelScope, topic, prompt, a, b, c, d, correct string
	}
	questions := []seedQuestion{
		{
			"q_ev8_shared_1", "shared", "Digital Literacy",
			"What does CPU stand for in a computer system?",
			"Central Processing Unit", "Computer Personal Utility", "Central Program Uploader", "Control Power Unit",
			"A",
		},
		{
			"q_ev8_shared_2", "shared", "Digital Literacy",
			"Which of the following is the strongest password practice for keeping a student account safe?",
			"Using your first name and birth year", "Using 12345678 so it is easy to remember", "Mixing uppercase letters, lowercase letters, numbers, and symbols", "Sharing your password with classmates",
			"C",
		},
		{
			"q_ev8_shared_3", "shared", "Coding",
			"In programming, what is a step-by-step set of instructions used to solve a problem called?",
			"A motherboard", "An algorithm", "A browser", "A firewall",
			"B",
		},
		{
			"q_ev8_shared_4", "shared", "AI",
			"Which technology allows a computer system to learn patterns from data and make predictions?",
			"Machine Learning", "Inkjet Printing", "HDMI Cabling", "Disk Defragmentation",
			"A",
		},
		{
			"q_ev8_shared_5", "shared", "Robotics",
			"In a robotics project, which component detects distance, light, or temperature from the environment?",
			"A sensor", "A speaker", "A battery holder", "A wheel axle",
			"A",
		},
		{
			"q_ev8_junior_1", "junior", "Coding",
			"In Scratch block-based coding, which block repeats actions forever until the program stops?",
			"Wait 1 second", "Forever loop", "Say Hello", "Hide sprite",
			"B",
		},
		{
			"q_ev8_junior_2", "junior", "Digital Literacy",
			"Which device is an input device used to type letters and numbers into a computer?",
			"Monitor", "Printer", "Keyboard", "Projector",
			"C",
		},
		{
			"q_ev8_junior_3", "junior", "Logic",
			"If a robot moves 2 steps forward, turns right, and repeats this 4 times, what shape path does it trace?",
			"A triangle", "A square", "A straight line", "A circle",
			"B",
		},
		{
			"q_ev8_inter_1", "intermediate", "Coding",
			"In Python, what is the output of: print(3 * (4 + 2))?",
			"14", "18", "24", "342",
			"B",
		},
		{
			"q_ev8_inter_2", "intermediate", "Robotics",
			"Which ultrasonic sensor is commonly used with Arduino boards to measure distance to an obstacle?",
			"HC-SR04", "RJ-45", "USB-C", "HDMI-2",
			"A",
		},
		{
			"q_ev8_inter_3", "intermediate", "Logic",
			"What is the binary representation of the decimal number 13?",
			"1010", "1101", "1110", "1001",
			"B",
		},
		{
			"q_ev8_senior_1", "senior", "Coding",
			"What is the time complexity of binary search on a sorted array of n elements?",
			"O(1)", "O(log n)", "O(n)", "O(n^2)",
			"B",
		},
		{
			"q_ev8_senior_2", "senior", "AI",
			"In supervised machine learning, what happens when a model memorizes training data but performs poorly on new unseen data?",
			"Overfitting", "Tokenization", "Normalization", "Encryption",
			"A",
		},
		{
			"q_ev8_senior_3", "senior", "Digital Literacy",
			"Which protocol encrypts HTTP traffic between a web browser and a server using TLS?",
			"FTP", "SMTP", "HTTPS", "Telnet",
			"C",
		},
	}

	for _, q := range questions {
		_, err := pool.Exec(ctx, `
			INSERT INTO questions (id, quiz_id, level_scope, topic, prompt, option_a, option_b, option_c, option_d, correct_option, points, active)
			VALUES ($1, '', $2, $3, $4, $5, $6, $7, $8, $9, 10, TRUE)
			ON CONFLICT (id) DO NOTHING
		`, q.id, q.levelScope, q.topic, q.prompt, q.a, q.b, q.c, q.d, q.correct)
		if err != nil {
			return fmt.Errorf("seed question %s: %w", q.id, err)
		}
	}

	type seedStudent struct {
		id, code, pin, name, school, loc, level, className, regRef string
	}
	students := []seedStudent{
		{"stu_ev8_demo_jun", "EV8-JUN-1001", "123456", "Chidinma Okafor", "Gracefield Royal Academy", "Amuwo Odofin, Lagos", "junior", "Primary 5", "EV8-DEMO-01"},
		{"stu_ev8_demo_int", "EV8-INT-2001", "123456", "Tunde Balogun", "Kingsway Model College", "Festac Town, Lagos", "intermediate", "JSS 2", "EV8-DEMO-02"},
		{"stu_ev8_demo_sen", "EV8-SEN-3001", "123456", "Amina Yusuf", "Crestview Science High", "Ikeja, Lagos", "senior", "SS 2", "EV8-DEMO-03"},
	}

	for _, s := range students {
		hash := sha256.Sum256([]byte(s.pin))
		_, err := pool.Exec(ctx, `
			INSERT INTO students (id, exam_code, pin_code, pin_hash, full_name, school_name, school_location, level, class_name, registration_ref)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
			ON CONFLICT (exam_code) DO NOTHING
		`, s.id, s.code, s.pin, hex.EncodeToString(hash[:]), s.name, s.school, s.loc, s.level, s.className, s.regRef)
		if err != nil {
			return fmt.Errorf("seed student %s: %w", s.code, err)
		}
	}

	return nil
}
