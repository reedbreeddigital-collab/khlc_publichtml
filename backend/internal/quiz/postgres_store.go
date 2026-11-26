package quiz

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PostgresStore implements Store against Neon Lakebase Postgres via pgxpool.
type PostgresStore struct {
	pool *pgxpool.Pool
}

// NewPostgresStore creates a Postgres-backed quiz Store.
func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool}
}

func (p *PostgresStore) ListQuizzes(ctx context.Context) ([]QuizWithStats, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT q.id, q.title, q.edition, q.level, q.topics, q.question_limit, q.duration_minutes, q.starts_at, q.ends_at,
		       q.max_score, q.pass_mark, q.shuffle_questions, q.shuffle_options, q.status,
		       q.results_published, q.created_at, q.updated_at,
		       (SELECT COUNT(*) FROM questions qs
		         WHERE qs.active = TRUE
		           AND (qs.quiz_id = q.id OR (qs.quiz_id = '' AND (qs.level_scope = 'shared' OR qs.level_scope = q.level)))
		           AND (jsonb_array_length(q.topics) = 0 OR EXISTS (
		             SELECT 1 FROM jsonb_array_elements_text(q.topics) AS t(val)
		             WHERE LOWER(t.val) = LOWER(qs.topic)
		           ))) AS question_count,
		       (SELECT COUNT(*) FROM quiz_attempts a WHERE a.quiz_id = q.id) AS attempt_count,
		       (SELECT COUNT(*) FROM quiz_attempts a WHERE a.quiz_id = q.id AND a.status IN ('submitted', 'expired')) AS submitted_count,
		       (SELECT COUNT(*) FROM quiz_attempts a WHERE a.quiz_id = q.id AND a.passed = TRUE) AS passed_count
		FROM quizzes q
		ORDER BY q.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]QuizWithStats, 0)
	for rows.Next() {
		var item QuizWithStats
		var topicsRaw []byte
		if err := rows.Scan(
			&item.ID, &item.Title, &item.Edition, &item.Level, &topicsRaw, &item.QuestionLimit, &item.DurationMinutes,
			&item.StartsAt, &item.EndsAt, &item.MaxScore, &item.PassMark,
			&item.ShuffleQuestions, &item.ShuffleOptions, &item.Status,
			&item.ResultsPublished, &item.CreatedAt, &item.UpdatedAt,
			&item.QuestionCount, &item.AttemptCount, &item.SubmittedCount, &item.PassedCount,
		); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(topicsRaw, &item.Topics)
		if item.Topics == nil {
			item.Topics = make([]string, 0)
		}
		if item.QuestionLimit > 0 && item.QuestionLimit < item.QuestionCount {
			item.QuestionCount = item.QuestionLimit
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (p *PostgresStore) GetQuiz(ctx context.Context, id string) (*Quiz, error) {
	var q Quiz
	var topicsRaw []byte
	err := p.pool.QueryRow(ctx, `
		SELECT id, title, edition, level, topics, question_limit, duration_minutes, starts_at, ends_at,
		       max_score, pass_mark, shuffle_questions, shuffle_options, status,
		       results_published, created_at, updated_at
		FROM quizzes WHERE id = $1
	`, id).Scan(
		&q.ID, &q.Title, &q.Edition, &q.Level, &topicsRaw, &q.QuestionLimit, &q.DurationMinutes,
		&q.StartsAt, &q.EndsAt, &q.MaxScore, &q.PassMark,
		&q.ShuffleQuestions, &q.ShuffleOptions, &q.Status,
		&q.ResultsPublished, &q.CreatedAt, &q.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(topicsRaw, &q.Topics)
	if q.Topics == nil {
		q.Topics = make([]string, 0)
	}
	return &q, nil
}

func (p *PostgresStore) GetActiveQuizForLevel(ctx context.Context, level string) (*Quiz, error) {
	var q Quiz
	var topicsRaw []byte
	err := p.pool.QueryRow(ctx, `
		SELECT id, title, edition, level, topics, question_limit, duration_minutes, starts_at, ends_at,
		       max_score, pass_mark, shuffle_questions, shuffle_options, status,
		       results_published, created_at, updated_at
		FROM quizzes
		WHERE level = $1
		ORDER BY CASE status
			WHEN 'live' THEN 0
			WHEN 'scheduled' THEN 1
			WHEN 'closed' THEN 2
			ELSE 3
		END, updated_at DESC
		LIMIT 1
	`, level).Scan(
		&q.ID, &q.Title, &q.Edition, &q.Level, &topicsRaw, &q.QuestionLimit, &q.DurationMinutes,
		&q.StartsAt, &q.EndsAt, &q.MaxScore, &q.PassMark,
		&q.ShuffleQuestions, &q.ShuffleOptions, &q.Status,
		&q.ResultsPublished, &q.CreatedAt, &q.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(topicsRaw, &q.Topics)
	if q.Topics == nil {
		q.Topics = make([]string, 0)
	}
	return &q, nil
}

func (p *PostgresStore) CreateQuiz(ctx context.Context, q Quiz) (*Quiz, error) {
	if q.Topics == nil {
		q.Topics = make([]string, 0)
	}
	topicsJSON, _ := json.Marshal(q.Topics)
	_, err := p.pool.Exec(ctx, `
		INSERT INTO quizzes (
			id, title, edition, level, topics, question_limit, duration_minutes, starts_at, ends_at,
			max_score, pass_mark, shuffle_questions, shuffle_options, status,
			results_published, created_at, updated_at
		) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
	`,
		q.ID, q.Title, q.Edition, q.Level, string(topicsJSON), q.QuestionLimit, q.DurationMinutes, q.StartsAt, q.EndsAt,
		q.MaxScore, q.PassMark, q.ShuffleQuestions, q.ShuffleOptions, q.Status,
		q.ResultsPublished, q.CreatedAt, q.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &q, nil
}

func (p *PostgresStore) UpdateQuiz(ctx context.Context, q Quiz) (*Quiz, error) {
	if q.Topics == nil {
		q.Topics = make([]string, 0)
	}
	topicsJSON, _ := json.Marshal(q.Topics)
	tag, err := p.pool.Exec(ctx, `
		UPDATE quizzes
		SET title=$2, edition=$3, level=$4, topics=$5::jsonb, question_limit=$6, duration_minutes=$7, starts_at=$8, ends_at=$9,
		    max_score=$10, pass_mark=$11, shuffle_questions=$12, shuffle_options=$13,
		    status=$14, results_published=$15, updated_at=$16
		WHERE id=$1
	`,
		q.ID, q.Title, q.Edition, q.Level, string(topicsJSON), q.QuestionLimit, q.DurationMinutes, q.StartsAt, q.EndsAt,
		q.MaxScore, q.PassMark, q.ShuffleQuestions, q.ShuffleOptions,
		q.Status, q.ResultsPublished, q.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if tag.RowsAffected() == 0 {
		return nil, ErrNotFound
	}
	return &q, nil
}

func (p *PostgresStore) DeleteQuiz(ctx context.Context, id string) error {
	tag, err := p.pool.Exec(ctx, `DELETE FROM quizzes WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (p *PostgresStore) ListQuestions(ctx context.Context, levelScope, topic, quizID string) ([]Question, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT id, quiz_id, level_scope, topic, prompt, option_a, option_b, option_c, option_d,
		       correct_option, points, active, created_at
		FROM questions
		WHERE ($1 = '' OR level_scope = $1)
		  AND ($2 = '' OR LOWER(topic) = LOWER($2))
		  AND ($3 = '' OR quiz_id = $3)
		ORDER BY created_at DESC
		LIMIT 500
	`, levelScope, topic, quizID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Question, 0)
	for rows.Next() {
		var q Question
		if err := rows.Scan(
			&q.ID, &q.QuizID, &q.LevelScope, &q.Topic, &q.Prompt,
			&q.OptionA, &q.OptionB, &q.OptionC, &q.OptionD,
			&q.CorrectOption, &q.Points, &q.Active, &q.CreatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, q)
	}
	return out, rows.Err()
}

func (p *PostgresStore) GetQuestionsForQuiz(ctx context.Context, quizID, level string) ([]Question, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT id, quiz_id, level_scope, topic, prompt, option_a, option_b, option_c, option_d,
		       correct_option, points, active, created_at
		FROM questions
		WHERE active = TRUE
		  AND (quiz_id = $1 OR (quiz_id = '' AND (level_scope = 'shared' OR level_scope = $2)))
		ORDER BY id ASC
	`, quizID, level)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Question, 0)
	for rows.Next() {
		var q Question
		if err := rows.Scan(
			&q.ID, &q.QuizID, &q.LevelScope, &q.Topic, &q.Prompt,
			&q.OptionA, &q.OptionB, &q.OptionC, &q.OptionD,
			&q.CorrectOption, &q.Points, &q.Active, &q.CreatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, q)
	}
	return out, rows.Err()
}

func (p *PostgresStore) CreateQuestion(ctx context.Context, q Question) (*Question, error) {
	_, err := p.pool.Exec(ctx, `
		INSERT INTO questions (
			id, quiz_id, level_scope, topic, prompt, option_a, option_b, option_c, option_d,
			correct_option, points, active, created_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
	`,
		q.ID, q.QuizID, q.LevelScope, q.Topic, q.Prompt,
		q.OptionA, q.OptionB, q.OptionC, q.OptionD,
		q.CorrectOption, q.Points, q.Active, q.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &q, nil
}

func (p *PostgresStore) UpdateQuestion(ctx context.Context, q Question) (*Question, error) {
	tag, err := p.pool.Exec(ctx, `
		UPDATE questions
		SET quiz_id=$2, level_scope=$3, topic=$4, prompt=$5,
		    option_a=$6, option_b=$7, option_c=$8, option_d=$9,
		    correct_option=$10, points=$11, active=$12
		WHERE id=$1
	`,
		q.ID, q.QuizID, q.LevelScope, q.Topic, q.Prompt,
		q.OptionA, q.OptionB, q.OptionC, q.OptionD,
		q.CorrectOption, q.Points, q.Active,
	)
	if err != nil {
		return nil, err
	}
	if tag.RowsAffected() == 0 {
		return nil, ErrNotFound
	}
	return &q, nil
}

func (p *PostgresStore) DeleteQuestion(ctx context.Context, id string) error {
	tag, err := p.pool.Exec(ctx, `DELETE FROM questions WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (p *PostgresStore) ListStudents(ctx context.Context, level string) ([]StudentWithAttempt, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT s.id, s.exam_code, s.pin_code, s.pin_hash, s.full_name, s.school_name,
		       s.school_location, s.level, s.class_name, s.registration_ref,
		       s.phase2_video_url, s.phase2_video_updated_at, s.created_at,
		       a.id, a.quiz_id, a.started_at, a.expires_at, a.submitted_at,
		       a.time_taken_seconds, a.raw_correct, a.total_questions,
		       a.score_out_of_1000, a.passed, a.tab_switch_count, a.status
		FROM students s
		LEFT JOIN LATERAL (
			SELECT id, quiz_id, started_at, expires_at, submitted_at,
			       time_taken_seconds, raw_correct, total_questions,
			       score_out_of_1000, passed, tab_switch_count, status
			FROM quiz_attempts
			WHERE student_id = s.id
			ORDER BY started_at DESC
			LIMIT 1
		) a ON TRUE
		WHERE ($1 = '' OR s.level = $1)
		ORDER BY s.created_at DESC
		LIMIT 500
	`, level)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanStudentsWithAttempts(rows)
}

func (p *PostgresStore) ListStudentsByRegistrationRef(ctx context.Context, ref string) ([]StudentWithAttempt, error) {
	normRef := strings.ToUpper(strings.TrimSpace(ref))
	if normRef == "" {
		return []StudentWithAttempt{}, nil
	}
	rows, err := p.pool.Query(ctx, `
		SELECT s.id, s.exam_code, s.pin_code, s.pin_hash, s.full_name, s.school_name,
		       s.school_location, s.level, s.class_name, s.registration_ref,
		       s.phase2_video_url, s.phase2_video_updated_at, s.created_at,
		       a.id, a.quiz_id, a.started_at, a.expires_at, a.submitted_at,
		       a.time_taken_seconds, a.raw_correct, a.total_questions,
		       a.score_out_of_1000, a.passed, a.tab_switch_count, a.status
		FROM students s
		LEFT JOIN LATERAL (
			SELECT id, quiz_id, started_at, expires_at, submitted_at,
			       time_taken_seconds, raw_correct, total_questions,
			       score_out_of_1000, passed, tab_switch_count, status
			FROM quiz_attempts
			WHERE student_id = s.id
			ORDER BY started_at DESC
			LIMIT 1
		) a ON TRUE
		WHERE UPPER(s.registration_ref) = $1
		ORDER BY s.created_at ASC
	`, normRef)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanStudentsWithAttempts(rows)
}

func scanStudentsWithAttempts(rows pgx.Rows) ([]StudentWithAttempt, error) {
	out := make([]StudentWithAttempt, 0)
	for rows.Next() {
		var s Student
		var aID, aQuizID, aStatus *string
		var aStart, aExp, aSub *time.Time
		var aTime, aRaw, aTotal, aScore, aTabs *int
		var aPassed *bool

		if err := rows.Scan(
			&s.ID, &s.ExamCode, &s.PinCode, &s.PinHash, &s.FullName, &s.SchoolName,
			&s.SchoolLocation, &s.Level, &s.ClassName, &s.RegistrationRef,
			&s.Phase2VideoURL, &s.Phase2VideoUpdatedAt, &s.CreatedAt,
			&aID, &aQuizID, &aStart, &aExp, &aSub,
			&aTime, &aRaw, &aTotal, &aScore, &aPassed, &aTabs, &aStatus,
		); err != nil {
			return nil, err
		}

		item := StudentWithAttempt{Student: s}
		if aID != nil && *aID != "" {
			att := &QuizAttempt{
				ID:        *aID,
				QuizID:    derefStr(aQuizID),
				StudentID: s.ID,
				Status:    derefStr(aStatus),
			}
			if aStart != nil {
				att.StartedAt = *aStart
			}
			if aExp != nil {
				att.ExpiresAt = *aExp
			}
			att.SubmittedAt = aSub
			if aTime != nil {
				att.TimeTakenSeconds = *aTime
			}
			if aRaw != nil {
				att.RawCorrect = *aRaw
			}
			if aTotal != nil {
				att.TotalQuestions = *aTotal
			}
			if aScore != nil {
				att.ScoreOutOf1000 = *aScore
			}
			if aPassed != nil {
				att.Passed = *aPassed
			}
			if aTabs != nil {
				att.TabSwitchCount = *aTabs
			}
			item.LatestAttempt = att
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (p *PostgresStore) GetStudentByID(ctx context.Context, id string) (*Student, error) {
	var s Student
	err := p.pool.QueryRow(ctx, `
		SELECT id, exam_code, pin_code, pin_hash, full_name, school_name,
		       school_location, level, class_name, registration_ref,
		       phase2_video_url, phase2_video_updated_at, created_at
		FROM students WHERE id = $1
	`, id).Scan(
		&s.ID, &s.ExamCode, &s.PinCode, &s.PinHash, &s.FullName, &s.SchoolName,
		&s.SchoolLocation, &s.Level, &s.ClassName, &s.RegistrationRef,
		&s.Phase2VideoURL, &s.Phase2VideoUpdatedAt, &s.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (p *PostgresStore) GetStudentByExamCode(ctx context.Context, examCode string) (*Student, error) {
	var s Student
	err := p.pool.QueryRow(ctx, `
		SELECT id, exam_code, pin_code, pin_hash, full_name, school_name,
		       school_location, level, class_name, registration_ref,
		       phase2_video_url, phase2_video_updated_at, created_at
		FROM students WHERE UPPER(exam_code) = UPPER($1)
	`, strings.TrimSpace(examCode)).Scan(
		&s.ID, &s.ExamCode, &s.PinCode, &s.PinHash, &s.FullName, &s.SchoolName,
		&s.SchoolLocation, &s.Level, &s.ClassName, &s.RegistrationRef,
		&s.Phase2VideoURL, &s.Phase2VideoUpdatedAt, &s.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (p *PostgresStore) CreateStudent(ctx context.Context, s Student) (*Student, error) {
	_, err := p.pool.Exec(ctx, `
		INSERT INTO students (
			id, exam_code, pin_code, pin_hash, full_name, school_name,
			school_location, level, class_name, registration_ref,
			phase2_video_url, phase2_video_updated_at, created_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
	`,
		s.ID, s.ExamCode, s.PinCode, s.PinHash, s.FullName, s.SchoolName,
		s.SchoolLocation, s.Level, s.ClassName, s.RegistrationRef,
		s.Phase2VideoURL, s.Phase2VideoUpdatedAt, s.CreatedAt,
	)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "23505") {
			return nil, ErrConflict
		}
		return nil, err
	}
	return &s, nil
}

func (p *PostgresStore) UpdateStudentPhase2Video(ctx context.Context, id, registrationRef, videoURL string) (*Student, error) {
	cleanURL := strings.TrimSpace(videoURL)
	var updatedAt *time.Time
	if cleanURL != "" {
		now := time.Now().UTC()
		updatedAt = &now
	}

	var s Student
	err := p.pool.QueryRow(ctx, `
		UPDATE students
		SET phase2_video_url = $3,
		    phase2_video_updated_at = $4
		WHERE id = $1
		  AND ($2 = '' OR UPPER(registration_ref) = UPPER($2))
		RETURNING id, exam_code, pin_code, pin_hash, full_name, school_name,
		          school_location, level, class_name, registration_ref,
		          phase2_video_url, phase2_video_updated_at, created_at
	`, id, strings.TrimSpace(registrationRef), cleanURL, updatedAt).Scan(
		&s.ID, &s.ExamCode, &s.PinCode, &s.PinHash, &s.FullName, &s.SchoolName,
		&s.SchoolLocation, &s.Level, &s.ClassName, &s.RegistrationRef,
		&s.Phase2VideoURL, &s.Phase2VideoUpdatedAt, &s.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (p *PostgresStore) DeleteStudent(ctx context.Context, id string) error {
	tag, err := p.pool.Exec(ctx, `DELETE FROM students WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// ImportRegisteredPupils scans evolve_registrations and creates Student credentials for any unimported pupils.
func (p *PostgresStore) ImportRegisteredPupils(ctx context.Context) ([]Student, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT reference_id, school_name, school_location, test_pupils
		FROM evolve_registrations
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	type regPupil struct {
		Name      string `json:"name"`
		Level     string `json:"level"`
		ClassName string `json:"className"`
	}

	created := make([]Student, 0)
	for rows.Next() {
		var refID, schoolName, schoolLoc string
		var pupilsRaw []byte
		if err := rows.Scan(&refID, &schoolName, &schoolLoc, &pupilsRaw); err != nil {
			return nil, err
		}
		var pupils []regPupil
		_ = json.Unmarshal(pupilsRaw, &pupils)

		for _, pup := range pupils {
			name := strings.TrimSpace(pup.Name)
			if name == "" {
				continue
			}
			lvl := normalizeLevel(pup.Level)

			// Skip if pupil already exists for same registration_ref + full_name
			var exists int
			_ = p.pool.QueryRow(ctx, `
				SELECT COUNT(*) FROM students
				WHERE registration_ref = $1 AND LOWER(full_name) = LOWER($2)
			`, refID, name).Scan(&exists)
			if exists > 0 {
				continue
			}

			pin := generatePinCode()
			stu := Student{
				ID:              fmt.Sprintf("stu_%d_%s", time.Now().UTC().UnixNano(), randomDigits(3)),
				ExamCode:        generateExamCode(lvl),
				PinCode:         pin,
				PinHash:         HashPin(pin),
				FullName:        name,
				SchoolName:      schoolName,
				SchoolLocation:  schoolLoc,
				Level:           lvl,
				ClassName:       strings.TrimSpace(pup.ClassName),
				RegistrationRef: refID,
				CreatedAt:       time.Now().UTC(),
			}
			if _, err := p.CreateStudent(ctx, stu); err == nil {
				created = append(created, stu)
			}
		}
	}
	return created, rows.Err()
}

func (p *PostgresStore) ListAttempts(ctx context.Context, quizID string) ([]AdminAttemptView, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT a.id, a.quiz_id, a.student_id, a.question_order, a.started_at, a.expires_at,
		       a.submitted_at, a.time_taken_seconds, a.raw_correct, a.total_questions,
		       a.score_out_of_1000, a.passed, a.tab_switch_count, a.status,
		       s.exam_code, s.full_name, s.school_name, s.level, q.title
		FROM quiz_attempts a
		JOIN students s ON s.id = a.student_id
		JOIN quizzes q ON q.id = a.quiz_id
		WHERE ($1 = '' OR a.quiz_id = $1)
		ORDER BY a.started_at DESC
		LIMIT 500
	`, quizID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]AdminAttemptView, 0)
	for rows.Next() {
		var view AdminAttemptView
		var orderRaw []byte
		if err := rows.Scan(
			&view.ID, &view.QuizID, &view.StudentID, &orderRaw, &view.StartedAt, &view.ExpiresAt,
			&view.SubmittedAt, &view.TimeTakenSeconds, &view.RawCorrect, &view.TotalQuestions,
			&view.ScoreOutOf1000, &view.Passed, &view.TabSwitchCount, &view.Status,
			&view.ExamCode, &view.FullName, &view.SchoolName, &view.Level, &view.QuizTitle,
		); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(orderRaw, &view.QuestionOrder)
		out = append(out, view)
	}
	return out, rows.Err()
}

func (p *PostgresStore) GetAttempt(ctx context.Context, id string) (*QuizAttempt, error) {
	var a QuizAttempt
	var orderRaw []byte
	err := p.pool.QueryRow(ctx, `
		SELECT id, quiz_id, student_id, question_order, started_at, expires_at,
		       submitted_at, time_taken_seconds, raw_correct, total_questions,
		       score_out_of_1000, passed, tab_switch_count, status
		FROM quiz_attempts WHERE id = $1
	`, id).Scan(
		&a.ID, &a.QuizID, &a.StudentID, &orderRaw, &a.StartedAt, &a.ExpiresAt,
		&a.SubmittedAt, &a.TimeTakenSeconds, &a.RawCorrect, &a.TotalQuestions,
		&a.ScoreOutOf1000, &a.Passed, &a.TabSwitchCount, &a.Status,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(orderRaw, &a.QuestionOrder)
	return &a, nil
}

func (p *PostgresStore) GetAttemptByQuizAndStudent(ctx context.Context, quizID, studentID string) (*QuizAttempt, error) {
	var a QuizAttempt
	var orderRaw []byte
	err := p.pool.QueryRow(ctx, `
		SELECT id, quiz_id, student_id, question_order, started_at, expires_at,
		       submitted_at, time_taken_seconds, raw_correct, total_questions,
		       score_out_of_1000, passed, tab_switch_count, status
		FROM quiz_attempts
		WHERE quiz_id = $1 AND student_id = $2
		ORDER BY started_at DESC
		LIMIT 1
	`, quizID, studentID).Scan(
		&a.ID, &a.QuizID, &a.StudentID, &orderRaw, &a.StartedAt, &a.ExpiresAt,
		&a.SubmittedAt, &a.TimeTakenSeconds, &a.RawCorrect, &a.TotalQuestions,
		&a.ScoreOutOf1000, &a.Passed, &a.TabSwitchCount, &a.Status,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(orderRaw, &a.QuestionOrder)
	return &a, nil
}

func (p *PostgresStore) CreateAttempt(ctx context.Context, a QuizAttempt) (*QuizAttempt, error) {
	orderJSON, _ := json.Marshal(a.QuestionOrder)
	_, err := p.pool.Exec(ctx, `
		INSERT INTO quiz_attempts (
			id, quiz_id, student_id, question_order, started_at, expires_at,
			submitted_at, time_taken_seconds, raw_correct, total_questions,
			score_out_of_1000, passed, tab_switch_count, status
		) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
	`,
		a.ID, a.QuizID, a.StudentID, string(orderJSON), a.StartedAt, a.ExpiresAt,
		a.SubmittedAt, a.TimeTakenSeconds, a.RawCorrect, a.TotalQuestions,
		a.ScoreOutOf1000, a.Passed, a.TabSwitchCount, a.Status,
	)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (p *PostgresStore) UpdateAttempt(ctx context.Context, a QuizAttempt) (*QuizAttempt, error) {
	orderJSON, _ := json.Marshal(a.QuestionOrder)
	tag, err := p.pool.Exec(ctx, `
		UPDATE quiz_attempts
		SET question_order=$2::jsonb, submitted_at=$3, time_taken_seconds=$4,
		    raw_correct=$5, total_questions=$6, score_out_of_1000=$7,
		    passed=$8, tab_switch_count=$9, status=$10
		WHERE id=$1
	`,
		a.ID, string(orderJSON), a.SubmittedAt, a.TimeTakenSeconds,
		a.RawCorrect, a.TotalQuestions, a.ScoreOutOf1000,
		a.Passed, a.TabSwitchCount, a.Status,
	)
	if err != nil {
		return nil, err
	}
	if tag.RowsAffected() == 0 {
		return nil, ErrNotFound
	}
	return &a, nil
}

func (p *PostgresStore) DeleteAttempt(ctx context.Context, id string) error {
	tag, err := p.pool.Exec(ctx, `DELETE FROM quiz_attempts WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (p *PostgresStore) UpsertAnswer(ctx context.Context, ans AttemptAnswer) error {
	_, err := p.pool.Exec(ctx, `
		INSERT INTO attempt_answers (attempt_id, question_id, selected_option, is_correct, answered_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (attempt_id, question_id)
		DO UPDATE SET selected_option = EXCLUDED.selected_option, answered_at = EXCLUDED.answered_at
	`, ans.AttemptID, ans.QuestionID, ans.SelectedOption, ans.IsCorrect, ans.AnsweredAt)
	return err
}

func (p *PostgresStore) ListAnswers(ctx context.Context, attemptID string) ([]AttemptAnswer, error) {
	rows, err := p.pool.Query(ctx, `
		SELECT attempt_id, question_id, selected_option, is_correct, answered_at
		FROM attempt_answers
		WHERE attempt_id = $1
	`, attemptID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]AttemptAnswer, 0)
	for rows.Next() {
		var a AttemptAnswer
		if err := rows.Scan(&a.AttemptID, &a.QuestionID, &a.SelectedOption, &a.IsCorrect, &a.AnsweredAt); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

func (p *PostgresStore) UpdateAnswerCorrectness(ctx context.Context, attemptID, questionID string, isCorrect bool) error {
	_, err := p.pool.Exec(ctx, `
		UPDATE attempt_answers SET is_correct = $3
		WHERE attempt_id = $1 AND question_id = $2
	`, attemptID, questionID, isCorrect)
	return err
}

func (p *PostgresStore) BuildPublicResults(ctx context.Context, filterLevel, query string) (*ResultsResponse, error) {
	levels := []string{"junior", "intermediate", "senior"}
	if filterLevel != "" {
		levels = []string{filterLevel}
	}

	resp := &ResultsResponse{
		Edition:     "Evolve 8.0",
		GeneratedAt: time.Now().UTC(),
		Levels:      make([]LevelResults, 0, len(levels)),
	}
	normQuery := strings.ToLower(strings.TrimSpace(query))

	for _, lvl := range levels {
		lr := LevelResults{
			Level:       lvl,
			PassMark:    700,
			MaxScore:    1000,
			Podium:      make([]LeaderboardEntry, 0),
			Leaderboard: make([]LeaderboardEntry, 0),
		}

		var q Quiz
		err := p.pool.QueryRow(ctx, `
			SELECT id, title, edition, level, duration_minutes, starts_at, ends_at,
			       max_score, pass_mark, shuffle_questions, shuffle_options, status,
			       results_published, created_at, updated_at
			FROM quizzes
			WHERE level = $1
			ORDER BY results_published DESC, updated_at DESC
			LIMIT 1
		`, lvl).Scan(
			&q.ID, &q.Title, &q.Edition, &q.Level, &q.DurationMinutes,
			&q.StartsAt, &q.EndsAt, &q.MaxScore, &q.PassMark,
			&q.ShuffleQuestions, &q.ShuffleOptions, &q.Status,
			&q.ResultsPublished, &q.CreatedAt, &q.UpdatedAt,
		)
		if err != nil && !errors.Is(err, pgx.ErrNoRows) {
			return nil, err
		}

		if q.ID != "" {
			lr.QuizID = q.ID
			lr.QuizTitle = q.Title
			lr.ResultsPublished = q.ResultsPublished
			lr.PassMark = q.PassMark
			lr.MaxScore = q.MaxScore

			if q.ResultsPublished {
				rows, err := p.pool.Query(ctx, `
					SELECT s.exam_code, s.full_name, s.school_name, s.school_location,
					       s.level, s.class_name, a.score_out_of_1000, a.raw_correct,
					       a.total_questions, a.time_taken_seconds, a.passed
					FROM quiz_attempts a
					JOIN students s ON s.id = a.student_id
					WHERE a.quiz_id = $1 AND a.status IN ('submitted', 'expired')
					ORDER BY a.score_out_of_1000 DESC, a.time_taken_seconds ASC, a.submitted_at ASC
				`, q.ID)
				if err != nil {
					return nil, err
				}

				allSubmitted := make([]LeaderboardEntry, 0)
				for rows.Next() {
					var e LeaderboardEntry
					if err := rows.Scan(
						&e.ExamCode, &e.FullName, &e.SchoolName, &e.SchoolLocation,
						&e.Level, &e.ClassName, &e.ScoreOutOf1000, &e.RawCorrect,
						&e.TotalQuestions, &e.TimeTakenSeconds, &e.Passed,
					); err != nil {
						rows.Close()
						return nil, err
					}
					allSubmitted = append(allSubmitted, e)
				}
				rows.Close()

				// Ensure deterministic ordering
				sort.SliceStable(allSubmitted, func(i, j int) bool {
					if allSubmitted[i].ScoreOutOf1000 != allSubmitted[j].ScoreOutOf1000 {
						return allSubmitted[i].ScoreOutOf1000 > allSubmitted[j].ScoreOutOf1000
					}
					return allSubmitted[i].TimeTakenSeconds < allSubmitted[j].TimeTakenSeconds
				})

				lr.TotalParticipants = len(allSubmitted)
				rank := 0
				for _, entry := range allSubmitted {
					if entry.Passed {
						rank++
						entry.Rank = rank
						entry.Finalist = rank <= 20
						lr.TotalPassed++

						if len(lr.Podium) < 3 {
							lr.Podium = append(lr.Podium, entry)
						}
						if normQuery == "" ||
							strings.Contains(strings.ToLower(entry.ExamCode), normQuery) ||
							strings.Contains(strings.ToLower(entry.SchoolName), normQuery) ||
							strings.Contains(strings.ToLower(entry.FullName), normQuery) {
							lr.Leaderboard = append(lr.Leaderboard, entry)
						}
					}

					if normQuery != "" && strings.EqualFold(entry.ExamCode, normQuery) {
						cp := entry
						resp.Lookup = &cp
						if entry.Passed {
							resp.LookupNote = fmt.Sprintf("Qualified! Ranked #%d nationally in %s.", entry.Rank, strings.ToUpper(lvl))
						} else {
							resp.LookupNote = fmt.Sprintf("Scored %d / %d. Pass mark for official national ranking is %d.", entry.ScoreOutOf1000, q.MaxScore, q.PassMark)
						}
					}
				}
			}
		}

		resp.Levels = append(resp.Levels, lr)
	}

	return resp, nil
}

func derefStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func normalizeLevel(raw string) string {
	v := strings.ToLower(strings.TrimSpace(raw))
	switch {
	case strings.Contains(v, "jun"), strings.Contains(v, "primary"):
		return "junior"
	case strings.Contains(v, "inter"), strings.Contains(v, "jss"):
		return "intermediate"
	case strings.Contains(v, "sen"), strings.Contains(v, "ss"):
		return "senior"
	default:
		return "junior"
	}
}

func generateExamCode(level string) string {
	prefix := "JUN"
	switch level {
	case "intermediate":
		prefix = "INT"
	case "senior":
		prefix = "SEN"
	}
	return fmt.Sprintf("EV8-%s-%s", prefix, randomDigits(4))
}

func generatePinCode() string {
	return randomDigits(6)
}

func randomDigits(n int) string {
	var b strings.Builder
	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			b.WriteByte('5')
		} else {
			b.WriteByte(byte('0' + num.Int64()))
		}
	}
	return b.String()
}
