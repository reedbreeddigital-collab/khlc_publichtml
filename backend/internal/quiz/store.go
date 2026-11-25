package quiz

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"
)

var (
	ErrNotFound = errors.New("not found")
	ErrConflict = errors.New("conflict")
)

// Store defines persistence operations for the Evolve Quiz Engine.
type Store interface {
	// Quizzes
	ListQuizzes(ctx context.Context) ([]QuizWithStats, error)
	GetQuiz(ctx context.Context, id string) (*Quiz, error)
	GetActiveQuizForLevel(ctx context.Context, level string) (*Quiz, error)
	CreateQuiz(ctx context.Context, q Quiz) (*Quiz, error)
	UpdateQuiz(ctx context.Context, q Quiz) (*Quiz, error)
	DeleteQuiz(ctx context.Context, id string) error

	// Questions
	ListQuestions(ctx context.Context, levelScope, topic, quizID string) ([]Question, error)
	GetQuestionsForQuiz(ctx context.Context, quizID, level string) ([]Question, error)
	CreateQuestion(ctx context.Context, q Question) (*Question, error)
	UpdateQuestion(ctx context.Context, q Question) (*Question, error)
	DeleteQuestion(ctx context.Context, id string) error

	// Students
	ListStudents(ctx context.Context, level string) ([]StudentWithAttempt, error)
	GetStudentByID(ctx context.Context, id string) (*Student, error)
	GetStudentByExamCode(ctx context.Context, examCode string) (*Student, error)
	CreateStudent(ctx context.Context, s Student) (*Student, error)
	DeleteStudent(ctx context.Context, id string) error
	ImportRegisteredPupils(ctx context.Context) ([]Student, error)

	// Attempts & Answers
	ListAttempts(ctx context.Context, quizID string) ([]AdminAttemptView, error)
	GetAttempt(ctx context.Context, id string) (*QuizAttempt, error)
	GetAttemptByQuizAndStudent(ctx context.Context, quizID, studentID string) (*QuizAttempt, error)
	CreateAttempt(ctx context.Context, a QuizAttempt) (*QuizAttempt, error)
	UpdateAttempt(ctx context.Context, a QuizAttempt) (*QuizAttempt, error)
	DeleteAttempt(ctx context.Context, id string) error

	UpsertAnswer(ctx context.Context, ans AttemptAnswer) error
	ListAnswers(ctx context.Context, attemptID string) ([]AttemptAnswer, error)
	UpdateAnswerCorrectness(ctx context.Context, attemptID, questionID string, isCorrect bool) error

	// Results
	BuildPublicResults(ctx context.Context, filterLevel, query string) (*ResultsResponse, error)
}

// HashPin computes a deterministic SHA-256 hex digest of a student's PIN.
func HashPin(pin string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(pin)))
	return hex.EncodeToString(sum[:])
}

// MemoryStore provides a thread-safe in-memory implementation of Store (for unit tests & offline dev).
type MemoryStore struct {
	mu        sync.RWMutex
	quizzes   map[string]Quiz
	questions map[string]Question
	students  map[string]Student
	attempts  map[string]QuizAttempt
	answers   map[string]map[string]AttemptAnswer // attemptID -> questionID -> answer
}

// NewMemoryStore initializes an empty in-memory Store.
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		quizzes:   make(map[string]Quiz),
		questions: make(map[string]Question),
		students:  make(map[string]Student),
		attempts:  make(map[string]QuizAttempt),
		answers:   make(map[string]map[string]AttemptAnswer),
	}
}

func (m *MemoryStore) ListQuizzes(_ context.Context) ([]QuizWithStats, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	out := make([]QuizWithStats, 0, len(m.quizzes))
	for _, q := range m.quizzes {
		if q.Topics == nil {
			q.Topics = make([]string, 0)
		}
		stats := QuizWithStats{Quiz: q}
		matching := make([]Question, 0)
		for _, ques := range m.questions {
			if !ques.Active {
				continue
			}
			if ques.QuizID == q.ID || (ques.QuizID == "" && (ques.LevelScope == "shared" || ques.LevelScope == q.Level)) {
				matching = append(matching, ques)
			}
		}
		matching = filterQuestionsByTopics(matching, q.Topics)
		stats.QuestionCount = len(matching)
		if q.QuestionLimit > 0 && q.QuestionLimit < stats.QuestionCount {
			stats.QuestionCount = q.QuestionLimit
		}
		for _, a := range m.attempts {
			if a.QuizID == q.ID {
				stats.AttemptCount++
				if a.Status == "submitted" || a.Status == "expired" {
					stats.SubmittedCount++
				}
				if a.Passed {
					stats.PassedCount++
				}
			}
		}
		out = append(out, stats)
	}

	sort.Slice(out, func(i, j int) bool {
		return out[i].CreatedAt.After(out[j].CreatedAt)
	})
	return out, nil
}

func (m *MemoryStore) GetQuiz(_ context.Context, id string) (*Quiz, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	q, ok := m.quizzes[id]
	if !ok {
		return nil, ErrNotFound
	}
	return &q, nil
}

func (m *MemoryStore) GetActiveQuizForLevel(_ context.Context, level string) (*Quiz, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var candidates []Quiz
	for _, q := range m.quizzes {
		if q.Level == level {
			candidates = append(candidates, q)
		}
	}
	if len(candidates) == 0 {
		return nil, ErrNotFound
	}
	sort.Slice(candidates, func(i, j int) bool {
		rank := func(s string) int {
			switch s {
			case "live":
				return 0
			case "scheduled":
				return 1
			case "closed":
				return 2
			default:
				return 3
			}
		}
		if rank(candidates[i].Status) != rank(candidates[j].Status) {
			return rank(candidates[i].Status) < rank(candidates[j].Status)
		}
		return candidates[i].UpdatedAt.After(candidates[j].UpdatedAt)
	})
	res := candidates[0]
	return &res, nil
}

func (m *MemoryStore) CreateQuiz(_ context.Context, q Quiz) (*Quiz, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.quizzes[q.ID] = q
	return &q, nil
}

func (m *MemoryStore) UpdateQuiz(_ context.Context, q Quiz) (*Quiz, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.quizzes[q.ID]; !ok {
		return nil, ErrNotFound
	}
	m.quizzes[q.ID] = q
	return &q, nil
}

func (m *MemoryStore) DeleteQuiz(_ context.Context, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.quizzes[id]; !ok {
		return ErrNotFound
	}
	delete(m.quizzes, id)
	for aid, a := range m.attempts {
		if a.QuizID == id {
			delete(m.attempts, aid)
			delete(m.answers, aid)
		}
	}
	return nil
}

func (m *MemoryStore) ListQuestions(_ context.Context, levelScope, topic, quizID string) ([]Question, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	out := make([]Question, 0)
	for _, q := range m.questions {
		if levelScope != "" && q.LevelScope != levelScope {
			continue
		}
		if topic != "" && !strings.EqualFold(q.Topic, topic) {
			continue
		}
		if quizID != "" && q.QuizID != quizID {
			continue
		}
		out = append(out, q)
	}
	sort.Slice(out, func(i, j int) bool {
		return out[i].CreatedAt.After(out[j].CreatedAt)
	})
	return out, nil
}

func (m *MemoryStore) GetQuestionsForQuiz(_ context.Context, quizID, level string) ([]Question, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	out := make([]Question, 0)
	for _, q := range m.questions {
		if !q.Active {
			continue
		}
		if q.QuizID == quizID || (q.QuizID == "" && (q.LevelScope == "shared" || q.LevelScope == level)) {
			out = append(out, q)
		}
	}
	sort.Slice(out, func(i, j int) bool {
		return out[i].ID < out[j].ID
	})
	return out, nil
}

func (m *MemoryStore) CreateQuestion(_ context.Context, q Question) (*Question, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.questions[q.ID] = q
	return &q, nil
}

func (m *MemoryStore) UpdateQuestion(_ context.Context, q Question) (*Question, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.questions[q.ID]; !ok {
		return nil, ErrNotFound
	}
	m.questions[q.ID] = q
	return &q, nil
}

func (m *MemoryStore) DeleteQuestion(_ context.Context, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.questions[id]; !ok {
		return ErrNotFound
	}
	delete(m.questions, id)
	return nil
}

func (m *MemoryStore) ListStudents(_ context.Context, level string) ([]StudentWithAttempt, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	out := make([]StudentWithAttempt, 0)
	for _, s := range m.students {
		if level != "" && s.Level != level {
			continue
		}
		var latest *QuizAttempt
		for _, a := range m.attempts {
			if a.StudentID == s.ID {
				if latest == nil || a.StartedAt.After(latest.StartedAt) {
					cp := a
					latest = &cp
				}
			}
		}
		out = append(out, StudentWithAttempt{Student: s, LatestAttempt: latest})
	}
	sort.Slice(out, func(i, j int) bool {
		return out[i].CreatedAt.After(out[j].CreatedAt)
	})
	return out, nil
}

func (m *MemoryStore) GetStudentByID(_ context.Context, id string) (*Student, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	s, ok := m.students[id]
	if !ok {
		return nil, ErrNotFound
	}
	return &s, nil
}

func (m *MemoryStore) GetStudentByExamCode(_ context.Context, examCode string) (*Student, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	norm := strings.ToUpper(strings.TrimSpace(examCode))
	for _, s := range m.students {
		if strings.ToUpper(s.ExamCode) == norm {
			cp := s
			return &cp, nil
		}
	}
	return nil, ErrNotFound
}

func (m *MemoryStore) CreateStudent(_ context.Context, s Student) (*Student, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, existing := range m.students {
		if strings.EqualFold(existing.ExamCode, s.ExamCode) {
			return nil, ErrConflict
		}
	}
	m.students[s.ID] = s
	return &s, nil
}

func (m *MemoryStore) DeleteStudent(_ context.Context, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.students[id]; !ok {
		return ErrNotFound
	}
	delete(m.students, id)
	for aid, a := range m.attempts {
		if a.StudentID == id {
			delete(m.attempts, aid)
			delete(m.answers, aid)
		}
	}
	return nil
}

func (m *MemoryStore) ImportRegisteredPupils(_ context.Context) ([]Student, error) {
	return []Student{}, nil
}

func (m *MemoryStore) ListAttempts(_ context.Context, quizID string) ([]AdminAttemptView, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	out := make([]AdminAttemptView, 0)
	for _, a := range m.attempts {
		if quizID != "" && a.QuizID != quizID {
			continue
		}
		stu := m.students[a.StudentID]
		qz := m.quizzes[a.QuizID]
		out = append(out, AdminAttemptView{
			QuizAttempt: a,
			ExamCode:    stu.ExamCode,
			FullName:    stu.FullName,
			SchoolName:  stu.SchoolName,
			Level:       stu.Level,
			QuizTitle:   qz.Title,
		})
	}
	sort.Slice(out, func(i, j int) bool {
		return out[i].StartedAt.After(out[j].StartedAt)
	})
	return out, nil
}

func (m *MemoryStore) GetAttempt(_ context.Context, id string) (*QuizAttempt, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	a, ok := m.attempts[id]
	if !ok {
		return nil, ErrNotFound
	}
	return &a, nil
}

func (m *MemoryStore) GetAttemptByQuizAndStudent(_ context.Context, quizID, studentID string) (*QuizAttempt, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var latest *QuizAttempt
	for _, a := range m.attempts {
		if a.QuizID == quizID && a.StudentID == studentID {
			if latest == nil || a.StartedAt.After(latest.StartedAt) {
				cp := a
				latest = &cp
			}
		}
	}
	if latest == nil {
		return nil, ErrNotFound
	}
	return latest, nil
}

func (m *MemoryStore) CreateAttempt(_ context.Context, a QuizAttempt) (*QuizAttempt, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.attempts[a.ID] = a
	return &a, nil
}

func (m *MemoryStore) UpdateAttempt(_ context.Context, a QuizAttempt) (*QuizAttempt, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.attempts[a.ID]; !ok {
		return nil, ErrNotFound
	}
	m.attempts[a.ID] = a
	return &a, nil
}

func (m *MemoryStore) DeleteAttempt(_ context.Context, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.attempts[id]; !ok {
		return ErrNotFound
	}
	delete(m.attempts, id)
	delete(m.answers, id)
	return nil
}

func (m *MemoryStore) UpsertAnswer(_ context.Context, ans AttemptAnswer) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.answers[ans.AttemptID] == nil {
		m.answers[ans.AttemptID] = make(map[string]AttemptAnswer)
	}
	m.answers[ans.AttemptID][ans.QuestionID] = ans
	return nil
}

func (m *MemoryStore) ListAnswers(_ context.Context, attemptID string) ([]AttemptAnswer, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	bucket := m.answers[attemptID]
	out := make([]AttemptAnswer, 0, len(bucket))
	for _, ans := range bucket {
		out = append(out, ans)
	}
	return out, nil
}

func (m *MemoryStore) UpdateAnswerCorrectness(_ context.Context, attemptID, questionID string, isCorrect bool) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if bucket := m.answers[attemptID]; bucket != nil {
		if ans, ok := bucket[questionID]; ok {
			ans.IsCorrect = isCorrect
			bucket[questionID] = ans
		}
	}
	return nil
}

func (m *MemoryStore) BuildPublicResults(ctx context.Context, filterLevel, query string) (*ResultsResponse, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

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

		// Pick the published quiz for this level, or the most recent quiz
		var selected *Quiz
		for _, q := range m.quizzes {
			if q.Level != lvl {
				continue
			}
			if selected == nil || (q.ResultsPublished && !selected.ResultsPublished) || q.UpdatedAt.After(selected.UpdatedAt) {
				cp := q
				selected = &cp
			}
		}

		if selected != nil {
			lr.QuizID = selected.ID
			lr.QuizTitle = selected.Title
			lr.ResultsPublished = selected.ResultsPublished
			lr.PassMark = selected.PassMark
			lr.MaxScore = selected.MaxScore

			if selected.ResultsPublished {
				var allSubmitted []LeaderboardEntry
				for _, a := range m.attempts {
					if a.QuizID != selected.ID || (a.Status != "submitted" && a.Status != "expired") {
						continue
					}
					stu, ok := m.students[a.StudentID]
					if !ok {
						continue
					}
					lr.TotalParticipants++
					entry := LeaderboardEntry{
						ExamCode:         stu.ExamCode,
						FullName:         stu.FullName,
						SchoolName:       stu.SchoolName,
						SchoolLocation:   stu.SchoolLocation,
						Level:            stu.Level,
						ClassName:        stu.ClassName,
						ScoreOutOf1000:   a.ScoreOutOf1000,
						RawCorrect:       a.RawCorrect,
						TotalQuestions:   a.TotalQuestions,
						TimeTakenSeconds: a.TimeTakenSeconds,
						Passed:           a.Passed,
					}
					allSubmitted = append(allSubmitted, entry)
				}

				// Rank strictly by Score DESC, TimeTakenSeconds ASC
				sort.Slice(allSubmitted, func(i, j int) bool {
					if allSubmitted[i].ScoreOutOf1000 != allSubmitted[j].ScoreOutOf1000 {
						return allSubmitted[i].ScoreOutOf1000 > allSubmitted[j].ScoreOutOf1000
					}
					return allSubmitted[i].TimeTakenSeconds < allSubmitted[j].TimeTakenSeconds
				})

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
							resp.LookupNote = fmt.Sprintf("Scored %d / %d. Pass mark for official national ranking is %d.", entry.ScoreOutOf1000, selected.MaxScore, selected.PassMark)
						}
					}
				}
			}
		}

		resp.Levels = append(resp.Levels, lr)
	}

	return resp, nil
}
