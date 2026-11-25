package quiz

import (
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

	"khlc-backend/internal/middleware"
)

// Handler exposes HTTP endpoints for the Evolve 8.0 Quiz Engine, Admin Manager, and Public Results.
type Handler struct {
	store         Store
	adminEmail    string
	adminPassword string
	jwtSecret     string
}

// NewHandler constructs a quiz HTTP Handler.
func NewHandler(store Store, adminEmail, adminPassword, jwtSecret string) *Handler {
	return &Handler{
		store:         store,
		adminEmail:    strings.TrimSpace(adminEmail),
		adminPassword: strings.TrimSpace(adminPassword),
		jwtSecret:     jwtSecret,
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

var validLevels = map[string]bool{
	"junior":       true,
	"intermediate": true,
	"senior":       true,
}

var validLevelScopes = map[string]bool{
	"shared":       true,
	"junior":       true,
	"intermediate": true,
	"senior":       true,
}

var validStatuses = map[string]bool{
	"draft":     true,
	"scheduled": true,
	"live":      true,
	"closed":    true,
}

var validOptions = map[string]bool{
	"A": true,
	"B": true,
	"C": true,
	"D": true,
}

// =========================================================================
// Admin Auth
// =========================================================================

// AdminLogin handles POST /api/v1/admin/login.
func (h *Handler) AdminLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Passcode string `json:"passcode"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	pw := strings.TrimSpace(req.Password)
	if pw == "" {
		pw = strings.TrimSpace(req.Passcode)
	}
	email := strings.TrimSpace(req.Email)
	if email == "" {
		email = h.adminEmail
	}

	if !strings.EqualFold(email, h.adminEmail) || pw != h.adminPassword {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid admin credentials"})
		return
	}

	token, err := middleware.SignToken(h.jwtSecret, email, "admin", 24*time.Hour)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to issue session token"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"token": token,
		"admin": map[string]string{
			"email": email,
			"role":  "admin",
		},
	})
}

// =========================================================================
// Admin: Quiz Manager
// =========================================================================

// ListQuizzes handles GET /api/v1/admin/quizzes.
func (h *Handler) ListQuizzes(w http.ResponseWriter, r *http.Request) {
	items, err := h.store.ListQuizzes(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load quizzes"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"count": len(items),
		"data":  items,
	})
}

// CreateQuiz handles POST /api/v1/admin/quizzes.
func (h *Handler) CreateQuiz(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title            string `json:"title"`
		Edition          string `json:"edition"`
		Level            string `json:"level"`
		DurationMinutes  int    `json:"durationMinutes"`
		StartsAt         string `json:"startsAt"`
		EndsAt           string `json:"endsAt"`
		MaxScore         int    `json:"maxScore"`
		PassMark         int    `json:"passMark"`
		ShuffleQuestions *bool  `json:"shuffleQuestions"`
		ShuffleOptions   *bool  `json:"shuffleOptions"`
		Status           string `json:"status"`
		ResultsPublished bool   `json:"resultsPublished"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	req.Level = strings.ToLower(strings.TrimSpace(req.Level))
	if req.Title == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title is required"})
		return
	}
	if !validLevels[req.Level] {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "level must be junior, intermediate, or senior"})
		return
	}

	now := time.Now().UTC()
	startsAt := now
	if strings.TrimSpace(req.StartsAt) != "" {
		parsed, err := parseFlexibleTime(req.StartsAt)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid startsAt timestamp"})
			return
		}
		startsAt = parsed
	}
	endsAt := startsAt.Add(7 * 24 * time.Hour)
	if strings.TrimSpace(req.EndsAt) != "" {
		parsed, err := parseFlexibleTime(req.EndsAt)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid endsAt timestamp"})
			return
		}
		endsAt = parsed
	}
	if !endsAt.After(startsAt) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "endsAt must be after startsAt"})
		return
	}

	duration := req.DurationMinutes
	if duration <= 0 {
		duration = 30
	}
	maxScore := req.MaxScore
	if maxScore <= 0 {
		maxScore = 1000
	}
	passMark := req.PassMark
	if passMark <= 0 {
		passMark = 700
	}
	edition := strings.TrimSpace(req.Edition)
	if edition == "" {
		edition = "Evolve 8.0"
	}
	status := strings.ToLower(strings.TrimSpace(req.Status))
	if status == "" {
		status = "scheduled"
	}
	if !validStatuses[status] {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "status must be draft, scheduled, live, or closed"})
		return
	}

	shuffleQ := true
	if req.ShuffleQuestions != nil {
		shuffleQ = *req.ShuffleQuestions
	}
	shuffleO := false
	if req.ShuffleOptions != nil {
		shuffleO = *req.ShuffleOptions
	}

	q := Quiz{
		ID:               fmt.Sprintf("quiz_%d", now.UnixNano()),
		Title:            req.Title,
		Edition:          edition,
		Level:            req.Level,
		DurationMinutes:  duration,
		StartsAt:         startsAt,
		EndsAt:           endsAt,
		MaxScore:         maxScore,
		PassMark:         passMark,
		ShuffleQuestions: shuffleQ,
		ShuffleOptions:   shuffleO,
		Status:           status,
		ResultsPublished: req.ResultsPublished,
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	created, err := h.store.CreateQuiz(r.Context(), q)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create quiz"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"message": "Quiz created", "data": created})
}

// UpdateQuiz handles PATCH /api/v1/admin/quizzes/{id}.
func (h *Handler) UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	existing, err := h.store.GetQuiz(r.Context(), id)
	if errors.Is(err, ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "quiz not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load quiz"})
		return
	}

	var patch struct {
		Title            *string `json:"title"`
		Edition          *string `json:"edition"`
		Level            *string `json:"level"`
		DurationMinutes  *int    `json:"durationMinutes"`
		StartsAt         *string `json:"startsAt"`
		EndsAt           *string `json:"endsAt"`
		MaxScore         *int    `json:"maxScore"`
		PassMark         *int    `json:"passMark"`
		ShuffleQuestions *bool   `json:"shuffleQuestions"`
		ShuffleOptions   *bool   `json:"shuffleOptions"`
		Status           *string `json:"status"`
		ResultsPublished *bool   `json:"resultsPublished"`
	}
	if err := json.NewDecoder(r.Body).Decode(&patch); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	if patch.Title != nil && strings.TrimSpace(*patch.Title) != "" {
		existing.Title = strings.TrimSpace(*patch.Title)
	}
	if patch.Edition != nil && strings.TrimSpace(*patch.Edition) != "" {
		existing.Edition = strings.TrimSpace(*patch.Edition)
	}
	if patch.Level != nil {
		lvl := strings.ToLower(strings.TrimSpace(*patch.Level))
		if !validLevels[lvl] {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid level"})
			return
		}
		existing.Level = lvl
	}
	if patch.DurationMinutes != nil && *patch.DurationMinutes > 0 {
		existing.DurationMinutes = *patch.DurationMinutes
	}
	if patch.StartsAt != nil && strings.TrimSpace(*patch.StartsAt) != "" {
		parsed, err := parseFlexibleTime(*patch.StartsAt)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid startsAt"})
			return
		}
		existing.StartsAt = parsed
	}
	if patch.EndsAt != nil && strings.TrimSpace(*patch.EndsAt) != "" {
		parsed, err := parseFlexibleTime(*patch.EndsAt)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid endsAt"})
			return
		}
		existing.EndsAt = parsed
	}
	if patch.MaxScore != nil && *patch.MaxScore > 0 {
		existing.MaxScore = *patch.MaxScore
	}
	if patch.PassMark != nil && *patch.PassMark >= 0 {
		existing.PassMark = *patch.PassMark
	}
	if patch.ShuffleQuestions != nil {
		existing.ShuffleQuestions = *patch.ShuffleQuestions
	}
	if patch.ShuffleOptions != nil {
		existing.ShuffleOptions = *patch.ShuffleOptions
	}
	if patch.Status != nil {
		st := strings.ToLower(strings.TrimSpace(*patch.Status))
		if !validStatuses[st] {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid status"})
			return
		}
		existing.Status = st
	}
	if patch.ResultsPublished != nil {
		existing.ResultsPublished = *patch.ResultsPublished
	}
	existing.UpdatedAt = time.Now().UTC()

	updated, err := h.store.UpdateQuiz(r.Context(), *existing)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update quiz"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"message": "Quiz updated", "data": updated})
}

// DeleteQuiz handles DELETE /api/v1/admin/quizzes/{id}.
func (h *Handler) DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := h.store.DeleteQuiz(r.Context(), id)
	if errors.Is(err, ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "quiz not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete quiz"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Quiz deleted"})
}

// =========================================================================
// Admin: Question Bank Manager
// =========================================================================

// ListQuestions handles GET /api/v1/admin/questions.
func (h *Handler) ListQuestions(w http.ResponseWriter, r *http.Request) {
	level := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("level")))
	topic := strings.TrimSpace(r.URL.Query().Get("topic"))
	quizID := strings.TrimSpace(r.URL.Query().Get("quizId"))

	items, err := h.store.ListQuestions(r.Context(), level, topic, quizID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load questions"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"count": len(items), "data": items})
}

// CreateQuestion handles POST /api/v1/admin/questions.
func (h *Handler) CreateQuestion(w http.ResponseWriter, r *http.Request) {
	var req Question
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	normalized, errMsg := validateAndNormalizeQuestion(req)
	if errMsg != "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": errMsg})
		return
	}
	normalized.ID = fmt.Sprintf("q_%d_%s", time.Now().UTC().UnixNano(), randomDigits(3))
	normalized.Active = true
	normalized.CreatedAt = time.Now().UTC()

	created, err := h.store.CreateQuestion(r.Context(), normalized)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save question"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"message": "Question created", "data": created})
}

// UpdateQuestion handles PATCH /api/v1/admin/questions/{id}.
func (h *Handler) UpdateQuestion(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	all, err := h.store.ListQuestions(r.Context(), "", "", "")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load question"})
		return
	}
	var found *Question
	for i := range all {
		if all[i].ID == id {
			found = &all[i]
			break
		}
	}
	if found == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "question not found"})
		return
	}

	var patch struct {
		QuizID        *string `json:"quizId"`
		LevelScope    *string `json:"levelScope"`
		Topic         *string `json:"topic"`
		Prompt        *string `json:"prompt"`
		OptionA       *string `json:"optionA"`
		OptionB       *string `json:"optionB"`
		OptionC       *string `json:"optionC"`
		OptionD       *string `json:"optionD"`
		CorrectOption *string `json:"correctOption"`
		Points        *int    `json:"points"`
		Active        *bool   `json:"active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&patch); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	if patch.QuizID != nil {
		found.QuizID = strings.TrimSpace(*patch.QuizID)
	}
	if patch.LevelScope != nil {
		sc := strings.ToLower(strings.TrimSpace(*patch.LevelScope))
		if !validLevelScopes[sc] {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid levelScope"})
			return
		}
		found.LevelScope = sc
	}
	if patch.Topic != nil && strings.TrimSpace(*patch.Topic) != "" {
		found.Topic = strings.TrimSpace(*patch.Topic)
	}
	if patch.Prompt != nil && strings.TrimSpace(*patch.Prompt) != "" {
		found.Prompt = strings.TrimSpace(*patch.Prompt)
	}
	if patch.OptionA != nil && strings.TrimSpace(*patch.OptionA) != "" {
		found.OptionA = strings.TrimSpace(*patch.OptionA)
	}
	if patch.OptionB != nil && strings.TrimSpace(*patch.OptionB) != "" {
		found.OptionB = strings.TrimSpace(*patch.OptionB)
	}
	if patch.OptionC != nil && strings.TrimSpace(*patch.OptionC) != "" {
		found.OptionC = strings.TrimSpace(*patch.OptionC)
	}
	if patch.OptionD != nil && strings.TrimSpace(*patch.OptionD) != "" {
		found.OptionD = strings.TrimSpace(*patch.OptionD)
	}
	if patch.CorrectOption != nil {
		opt := strings.ToUpper(strings.TrimSpace(*patch.CorrectOption))
		if !validOptions[opt] {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "correctOption must be A, B, C, or D"})
			return
		}
		found.CorrectOption = opt
	}
	if patch.Points != nil && *patch.Points > 0 {
		found.Points = *patch.Points
	}
	if patch.Active != nil {
		found.Active = *patch.Active
	}

	updated, err := h.store.UpdateQuestion(r.Context(), *found)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update question"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"message": "Question updated", "data": updated})
}

// DeleteQuestion handles DELETE /api/v1/admin/questions/{id}.
func (h *Handler) DeleteQuestion(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := h.store.DeleteQuestion(r.Context(), id)
	if errors.Is(err, ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "question not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete question"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Question deleted"})
}

// ImportQuestions handles POST /api/v1/admin/questions/import (CSV text or JSON array).
// CSV columns: level_scope,topic,prompt,option_a,option_b,option_c,option_d,correct_option,points
func (h *Handler) ImportQuestions(w http.ResponseWriter, r *http.Request) {
	var req struct {
		CSV       string     `json:"csv"`
		QuizID    string     `json:"quizId"`
		Questions []Question `json:"questions"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	toImport := make([]Question, 0)
	if strings.TrimSpace(req.CSV) != "" {
		reader := csv.NewReader(strings.NewReader(strings.TrimSpace(req.CSV)))
		reader.FieldsPerRecord = -1
		rows, err := reader.ReadAll()
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid CSV format: " + err.Error()})
			return
		}
		for idx, cols := range rows {
			if len(cols) < 8 {
				continue
			}
			// Skip header row
			if idx == 0 && (strings.EqualFold(strings.TrimSpace(cols[0]), "level_scope") || strings.EqualFold(strings.TrimSpace(cols[0]), "level")) {
				continue
			}
			pts := 10
			if len(cols) >= 9 {
				if parsed, err := strconv.Atoi(strings.TrimSpace(cols[8])); err == nil && parsed > 0 {
					pts = parsed
				}
			}
			toImport = append(toImport, Question{
				QuizID:        strings.TrimSpace(req.QuizID),
				LevelScope:    cols[0],
				Topic:         cols[1],
				Prompt:        cols[2],
				OptionA:       cols[3],
				OptionB:       cols[4],
				OptionC:       cols[5],
				OptionD:       cols[6],
				CorrectOption: cols[7],
				Points:        pts,
			})
		}
	} else {
		for _, q := range req.Questions {
			if q.QuizID == "" {
				q.QuizID = strings.TrimSpace(req.QuizID)
			}
			toImport = append(toImport, q)
		}
	}

	if len(toImport) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "no valid question rows found"})
		return
	}

	imported := make([]Question, 0, len(toImport))
	skipped := 0
	for _, raw := range toImport {
		q, errMsg := validateAndNormalizeQuestion(raw)
		if errMsg != "" {
			skipped++
			continue
		}
		q.ID = fmt.Sprintf("q_%d_%s", time.Now().UTC().UnixNano(), randomDigits(4))
		q.Active = true
		q.CreatedAt = time.Now().UTC()
		created, err := h.store.CreateQuestion(r.Context(), q)
		if err != nil {
			skipped++
			continue
		}
		imported = append(imported, *created)
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"message":  fmt.Sprintf("Imported %d question(s)", len(imported)),
		"imported": len(imported),
		"skipped":  skipped,
		"data":     imported,
	})
}

// =========================================================================
// Admin: Student Roster & Attempts
// =========================================================================

// ListStudents handles GET /api/v1/admin/students.
func (h *Handler) ListStudents(w http.ResponseWriter, r *http.Request) {
	level := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("level")))
	items, err := h.store.ListStudents(r.Context(), level)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load students"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"count": len(items), "data": items})
}

// CreateStudent handles POST /api/v1/admin/students.
func (h *Handler) CreateStudent(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ExamCode        string `json:"examCode"`
		PinCode         string `json:"pinCode"`
		FullName        string `json:"fullName"`
		SchoolName      string `json:"schoolName"`
		SchoolLocation  string `json:"schoolLocation"`
		Level           string `json:"level"`
		ClassName       string `json:"className"`
		RegistrationRef string `json:"registrationRef"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	req.FullName = strings.TrimSpace(req.FullName)
	req.SchoolName = strings.TrimSpace(req.SchoolName)
	req.Level = strings.ToLower(strings.TrimSpace(req.Level))
	if req.FullName == "" || req.SchoolName == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "fullName and schoolName are required"})
		return
	}
	if !validLevels[req.Level] {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "level must be junior, intermediate, or senior"})
		return
	}

	examCode := strings.ToUpper(strings.TrimSpace(req.ExamCode))
	if examCode == "" {
		examCode = generateExamCode(req.Level)
	}
	pin := strings.TrimSpace(req.PinCode)
	if pin == "" {
		pin = generatePinCode()
	}

	stu := Student{
		ID:              fmt.Sprintf("stu_%d_%s", time.Now().UTC().UnixNano(), randomDigits(3)),
		ExamCode:        examCode,
		PinCode:         pin,
		PinHash:         HashPin(pin),
		FullName:        req.FullName,
		SchoolName:      req.SchoolName,
		SchoolLocation:  strings.TrimSpace(req.SchoolLocation),
		Level:           req.Level,
		ClassName:       strings.TrimSpace(req.ClassName),
		RegistrationRef: strings.TrimSpace(req.RegistrationRef),
		CreatedAt:       time.Now().UTC(),
	}

	created, err := h.store.CreateStudent(r.Context(), stu)
	if errors.Is(err, ErrConflict) {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "examCode already exists"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create student"})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Student registered with exam credentials",
		"data":    created,
	})
}

// DeleteStudent handles DELETE /api/v1/admin/students/{id}.
func (h *Handler) DeleteStudent(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := h.store.DeleteStudent(r.Context(), id)
	if errors.Is(err, ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "student not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete student"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Student removed"})
}

// ImportRegisteredPupils handles POST /api/v1/admin/students/import-registrations.
func (h *Handler) ImportRegisteredPupils(w http.ResponseWriter, r *http.Request) {
	created, err := h.store.ImportRegisteredPupils(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to import registered pupils"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"message":  fmt.Sprintf("Imported %d pupil(s) from Evolve 8.0 registrations", len(created)),
		"imported": len(created),
		"data":     created,
	})
}

// ListAttempts handles GET /api/v1/admin/attempts.
func (h *Handler) ListAttempts(w http.ResponseWriter, r *http.Request) {
	quizID := strings.TrimSpace(r.URL.Query().Get("quizId"))
	items, err := h.store.ListAttempts(r.Context(), quizID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load attempts"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"count": len(items), "data": items})
}

// ResetAttempt handles POST /api/v1/admin/attempts/{id}/reset.
func (h *Handler) ResetAttempt(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := h.store.DeleteAttempt(r.Context(), id)
	if errors.Is(err, ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "attempt not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to reset attempt"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Attempt reset — student may sit the quiz again"})
}

// =========================================================================
// Student Timed Quiz Portal
// =========================================================================

// StudentLogin handles POST /api/v1/quiz/login.
func (h *Handler) StudentLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ExamCode string `json:"examCode"`
		Pin      string `json:"pin"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	code := strings.ToUpper(strings.TrimSpace(req.ExamCode))
	pin := strings.TrimSpace(req.Pin)
	if code == "" || pin == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Exam ID and PIN are required"})
		return
	}

	stu, err := h.store.GetStudentByExamCode(r.Context(), code)
	if errors.Is(err, ErrNotFound) || (err == nil && stu.PinHash != HashPin(pin)) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid Exam ID or PIN. Please check your school login slip."})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to verify credentials"})
		return
	}

	token, err := middleware.SignToken(h.jwtSecret, stu.ID, "student", 6*time.Hour)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to issue student session"})
		return
	}

	assignedQuiz, err := h.store.GetActiveQuizForLevel(r.Context(), stu.Level)
	if err != nil && !errors.Is(err, ErrNotFound) {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load assigned quiz"})
		return
	}

	var existingAttempt *QuizAttempt
	questionCount := 0
	if assignedQuiz != nil {
		qs, _ := h.store.GetQuestionsForQuiz(r.Context(), assignedQuiz.ID, stu.Level)
		questionCount = len(qs)
		att, attErr := h.store.GetAttemptByQuizAndStudent(r.Context(), assignedQuiz.ID, stu.ID)
		if attErr == nil {
			// Auto-finalize if expired
			if att.Status == "in_progress" && time.Now().UTC().After(att.ExpiresAt) {
				att, _ = h.finalizeAttempt(r, assignedQuiz, att, true)
			}
			existingAttempt = att
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"token":      token,
		"serverTime": time.Now().UTC(),
		"student": StudentPublicProfile{
			ID:             stu.ID,
			ExamCode:       stu.ExamCode,
			FullName:       stu.FullName,
			SchoolName:     stu.SchoolName,
			SchoolLocation: stu.SchoolLocation,
			Level:          stu.Level,
			ClassName:      stu.ClassName,
		},
		"quiz":          assignedQuiz,
		"questionCount": questionCount,
		"attempt":       existingAttempt,
	})
}

// StartSession handles POST /api/v1/quiz/sessions/start.
func (h *Handler) StartSession(w http.ResponseWriter, r *http.Request) {
	claims, err := h.authenticateStudent(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "student session required"})
		return
	}

	stu, err := h.store.GetStudentByID(r.Context(), claims.Sub)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "student not found"})
		return
	}

	var req struct {
		QuizID string `json:"quizId"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	var qz *Quiz
	if strings.TrimSpace(req.QuizID) != "" {
		qz, err = h.store.GetQuiz(r.Context(), strings.TrimSpace(req.QuizID))
	} else {
		qz, err = h.store.GetActiveQuizForLevel(r.Context(), stu.Level)
	}
	if errors.Is(err, ErrNotFound) || qz == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "no quiz scheduled for your level yet"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load quiz"})
		return
	}
	if qz.Level != stu.Level {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "you are not assigned to this quiz level"})
		return
	}

	now := time.Now().UTC()

	// Check existing attempt first (allows seamless resume)
	existing, err := h.store.GetAttemptByQuizAndStudent(r.Context(), qz.ID, stu.ID)
	if err == nil && existing != nil {
		if existing.Status == "submitted" || existing.Status == "expired" {
			writeJSON(w, http.StatusConflict, map[string]any{
				"error":   "you have already submitted this quiz",
				"attempt": existing,
			})
			return
		}
		if now.After(existing.ExpiresAt) {
			finalized, _ := h.finalizeAttempt(r, qz, existing, true)
			writeJSON(w, http.StatusConflict, map[string]any{
				"error":   "your quiz timer has expired and your attempt was auto-submitted",
				"attempt": finalized,
			})
			return
		}

		// Resume active attempt
		questions, err := h.store.GetQuestionsForQuiz(r.Context(), qz.ID, stu.Level)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load questions"})
			return
		}
		orderedViews := orderStudentQuestions(questions, existing.QuestionOrder)
		saved, _ := h.store.ListAnswers(r.Context(), existing.ID)
		savedMap := make(map[string]string, len(saved))
		for _, ans := range saved {
			savedMap[ans.QuestionID] = ans.SelectedOption
		}

		writeJSON(w, http.StatusOK, map[string]any{
			"serverTime":   now,
			"attempt":      existing,
			"quiz":         qz,
			"questions":    orderedViews,
			"savedAnswers": savedMap,
		})
		return
	}

	// Enforce schedule window for starting a brand new sitting
	if qz.Status == "draft" {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "this quiz has not been opened yet"})
		return
	}
	if qz.Status == "closed" || now.After(qz.EndsAt) {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "the scheduled test window has closed"})
		return
	}
	if now.Before(qz.StartsAt) || (qz.Status != "live" && qz.Status != "scheduled") {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "the scheduled test window has not opened yet"})
		return
	}

	questions, err := h.store.GetQuestionsForQuiz(r.Context(), qz.ID, stu.Level)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load questions"})
		return
	}
	if len(questions) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "this quiz has no active questions configured yet"})
		return
	}

	order := make([]string, len(questions))
	for i, q := range questions {
		order[i] = q.ID
	}
	if qz.ShuffleQuestions && len(order) > 1 {
		rng := rand.New(rand.NewSource(now.UnixNano()))
		rng.Shuffle(len(order), func(i, j int) {
			order[i], order[j] = order[j], order[i]
		})
	}

	expiresAt := now.Add(time.Duration(qz.DurationMinutes) * time.Minute)
	if expiresAt.After(qz.EndsAt) {
		expiresAt = qz.EndsAt
	}

	attempt := QuizAttempt{
		ID:             fmt.Sprintf("att_%d_%s", now.UnixNano(), randomDigits(3)),
		QuizID:         qz.ID,
		StudentID:      stu.ID,
		QuestionOrder:  order,
		StartedAt:      now,
		ExpiresAt:      expiresAt,
		TotalQuestions: len(questions),
		Status:         "in_progress",
	}

	created, err := h.store.CreateAttempt(r.Context(), attempt)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to start quiz session"})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"serverTime":   now,
		"attempt":      created,
		"quiz":         qz,
		"questions":    orderStudentQuestions(questions, order),
		"savedAnswers": map[string]string{},
	})
}

// SaveAnswer handles PATCH /api/v1/quiz/sessions/{id}/answer.
func (h *Handler) SaveAnswer(w http.ResponseWriter, r *http.Request) {
	claims, err := h.authenticateStudent(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "student session required"})
		return
	}

	attemptID := r.PathValue("id")
	att, err := h.store.GetAttempt(r.Context(), attemptID)
	if errors.Is(err, ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "quiz session not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load quiz session"})
		return
	}
	if att.StudentID != claims.Sub {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "not authorized for this quiz session"})
		return
	}
	if att.Status != "in_progress" {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "quiz session is already submitted"})
		return
	}

	now := time.Now().UTC()
	// Give a 15-second network grace buffer for final click auto-saves
	if now.After(att.ExpiresAt.Add(15 * time.Second)) {
		qz, _ := h.store.GetQuiz(r.Context(), att.QuizID)
		finalized, _ := h.finalizeAttempt(r, qz, att, true)
		writeJSON(w, http.StatusConflict, map[string]any{
			"error":   "quiz time expired",
			"attempt": finalized,
		})
		return
	}

	var req struct {
		QuestionID     string `json:"questionId"`
		SelectedOption string `json:"selectedOption"`
		TabSwitch      bool   `json:"tabSwitch"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	if req.TabSwitch {
		att.TabSwitchCount++
		_, _ = h.store.UpdateAttempt(r.Context(), *att)
	}

	if strings.TrimSpace(req.QuestionID) != "" {
		opt := strings.ToUpper(strings.TrimSpace(req.SelectedOption))
		if !validOptions[opt] {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "selectedOption must be A, B, C, or D"})
			return
		}
		if err := h.store.UpsertAnswer(r.Context(), AttemptAnswer{
			AttemptID:      att.ID,
			QuestionID:     strings.TrimSpace(req.QuestionID),
			SelectedOption: opt,
			AnsweredAt:     now,
		}); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save answer"})
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"saved":          true,
		"tabSwitchCount": att.TabSwitchCount,
		"serverTime":     now,
	})
}

// SubmitSession handles POST /api/v1/quiz/sessions/{id}/submit.
func (h *Handler) SubmitSession(w http.ResponseWriter, r *http.Request) {
	claims, err := h.authenticateStudent(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "student session required"})
		return
	}

	attemptID := r.PathValue("id")
	att, err := h.store.GetAttempt(r.Context(), attemptID)
	if errors.Is(err, ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "quiz session not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load quiz session"})
		return
	}
	if att.StudentID != claims.Sub {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "not authorized for this quiz session"})
		return
	}

	qz, err := h.store.GetQuiz(r.Context(), att.QuizID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load quiz"})
		return
	}

	// Idempotent: return existing receipt if already submitted
	if att.Status == "submitted" || att.Status == "expired" {
		writeJSON(w, http.StatusOK, map[string]any{
			"message":          "Quiz already submitted",
			"attempt":          att,
			"resultsPublished": qz.ResultsPublished,
			"passMark":         qz.PassMark,
			"maxScore":         qz.MaxScore,
		})
		return
	}

	// Allow submitting final answers inline as a fallback safety net
	var body struct {
		Answers map[string]string `json:"answers"`
		Expired bool              `json:"expired"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	now := time.Now().UTC()
	for qid, opt := range body.Answers {
		normOpt := strings.ToUpper(strings.TrimSpace(opt))
		if validOptions[normOpt] && strings.TrimSpace(qid) != "" {
			_ = h.store.UpsertAnswer(r.Context(), AttemptAnswer{
				AttemptID:      att.ID,
				QuestionID:     strings.TrimSpace(qid),
				SelectedOption: normOpt,
				AnsweredAt:     now,
			})
		}
	}

	expired := body.Expired || now.After(att.ExpiresAt)
	finalized, err := h.finalizeAttempt(r, qz, att, expired)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to grade quiz submission"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"message":          "Quiz submitted and graded successfully",
		"attempt":          finalized,
		"resultsPublished": qz.ResultsPublished,
		"passMark":         qz.PassMark,
		"maxScore":         qz.MaxScore,
	})
}

func (h *Handler) finalizeAttempt(r *http.Request, qz *Quiz, att *QuizAttempt, expired bool) (*QuizAttempt, error) {
	ctx := r.Context()
	now := time.Now().UTC()
	submittedAt := now
	if expired && now.After(att.ExpiresAt) {
		submittedAt = att.ExpiresAt
	}

	elapsed := int(math.Round(submittedAt.Sub(att.StartedAt).Seconds()))
	if elapsed < 1 {
		elapsed = 1
	}
	maxSeconds := 30 * 60
	if qz != nil && qz.DurationMinutes > 0 {
		maxSeconds = qz.DurationMinutes * 60
	}
	if elapsed > maxSeconds {
		elapsed = maxSeconds
	}

	// Load authoritative answer key strictly server-side
	level := ""
	maxScore := 1000
	passMark := 700
	if qz != nil {
		level = qz.Level
		if qz.MaxScore > 0 {
			maxScore = qz.MaxScore
		}
		if qz.PassMark > 0 {
			passMark = qz.PassMark
		}
	}

	questions, err := h.store.GetQuestionsForQuiz(ctx, att.QuizID, level)
	if err != nil {
		return nil, err
	}
	qMap := make(map[string]Question, len(questions))
	totalPoints := 0
	for _, q := range questions {
		qMap[q.ID] = q
		pts := q.Points
		if pts <= 0 {
			pts = 10
		}
		totalPoints += pts
	}

	answers, err := h.store.ListAnswers(ctx, att.ID)
	if err != nil {
		return nil, err
	}

	rawCorrect := 0
	earnedPoints := 0
	for _, ans := range answers {
		q, ok := qMap[ans.QuestionID]
		if !ok {
			continue
		}
		isCorrect := strings.EqualFold(strings.TrimSpace(ans.SelectedOption), strings.TrimSpace(q.CorrectOption))
		_ = h.store.UpdateAnswerCorrectness(ctx, att.ID, ans.QuestionID, isCorrect)
		if isCorrect {
			rawCorrect++
			pts := q.Points
			if pts <= 0 {
				pts = 10
			}
			earnedPoints += pts
		}
	}

	scoreOutOfMax := 0
	if totalPoints > 0 {
		scoreOutOfMax = int(math.Round(float64(earnedPoints) / float64(totalPoints) * float64(maxScore)))
	}

	att.SubmittedAt = &submittedAt
	att.TimeTakenSeconds = elapsed
	att.RawCorrect = rawCorrect
	att.TotalQuestions = len(questions)
	att.ScoreOutOf1000 = scoreOutOfMax
	att.Passed = scoreOutOfMax >= passMark
	if expired {
		att.Status = "expired"
	} else {
		att.Status = "submitted"
	}

	return h.store.UpdateAttempt(ctx, *att)
}

// =========================================================================
// Public Results & National Rankings
// =========================================================================

// PublicResults handles GET /api/v1/evolve/results.
func (h *Handler) PublicResults(w http.ResponseWriter, r *http.Request) {
	level := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("level")))
	if level != "" && !validLevels[level] {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "level must be junior, intermediate, or senior"})
		return
	}
	q := strings.TrimSpace(r.URL.Query().Get("q"))

	res, err := h.store.BuildPublicResults(r.Context(), level, q)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load official results"})
		return
	}
	writeJSON(w, http.StatusOK, res)
}

// PublicSchedule handles GET /api/v1/evolve/schedule.
// Returns public live/scheduled quiz windows per level for the /evolve landing page.
func (h *Handler) PublicSchedule(w http.ResponseWriter, r *http.Request) {
	items, err := h.store.ListQuizzes(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load schedule"})
		return
	}

	type publicQuizWindow struct {
		ID               string    `json:"id"`
		Title            string    `json:"title"`
		Edition          string    `json:"edition"`
		Level            string    `json:"level"`
		DurationMinutes  int       `json:"durationMinutes"`
		StartsAt         time.Time `json:"startsAt"`
		EndsAt           time.Time `json:"endsAt"`
		MaxScore         int       `json:"maxScore"`
		PassMark         int       `json:"passMark"`
		Status           string    `json:"status"`
		ResultsPublished bool      `json:"resultsPublished"`
		QuestionCount    int       `json:"questionCount"`
	}

	// Pick the primary active/latest quiz per level
	byLevel := make(map[string]publicQuizWindow)
	for _, q := range items {
		if _, exists := byLevel[q.Level]; !exists || q.Status == "live" {
			byLevel[q.Level] = publicQuizWindow{
				ID:               q.ID,
				Title:            q.Title,
				Edition:          q.Edition,
				Level:            q.Level,
				DurationMinutes:  q.DurationMinutes,
				StartsAt:         q.StartsAt,
				EndsAt:           q.EndsAt,
				MaxScore:         q.MaxScore,
				PassMark:         q.PassMark,
				Status:           q.Status,
				ResultsPublished: q.ResultsPublished,
				QuestionCount:    q.QuestionCount,
			}
		}
	}

	ordered := make([]publicQuizWindow, 0, 3)
	for _, lvl := range []string{"junior", "intermediate", "senior"} {
		if wItem, ok := byLevel[lvl]; ok {
			ordered = append(ordered, wItem)
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"edition":    "Evolve 8.0",
		"serverTime": time.Now().UTC(),
		"levels":     ordered,
	})
}

// =========================================================================
// Helpers
// =========================================================================

func (h *Handler) authenticateStudent(r *http.Request) (*middleware.TokenClaims, error) {
	token := strings.TrimSpace(r.Header.Get("X-Student-Token"))
	if token == "" {
		token = middleware.ExtractBearer(r)
	}
	if token == "" {
		return nil, errors.New("missing student token")
	}
	return middleware.VerifyToken(h.jwtSecret, token, "student")
}

func orderStudentQuestions(questions []Question, order []string) []StudentQuestionView {
	byID := make(map[string]Question, len(questions))
	for _, q := range questions {
		byID[q.ID] = q
	}
	seen := make(map[string]bool, len(questions))
	views := make([]StudentQuestionView, 0, len(questions))

	for _, id := range order {
		if q, ok := byID[id]; ok && !seen[id] {
			seen[id] = true
			views = append(views, toStudentView(q))
		}
	}
	for _, q := range questions {
		if !seen[q.ID] {
			views = append(views, toStudentView(q))
		}
	}
	return views
}

func toStudentView(q Question) StudentQuestionView {
	return StudentQuestionView{
		ID:      q.ID,
		Topic:   q.Topic,
		Prompt:  q.Prompt,
		OptionA: q.OptionA,
		OptionB: q.OptionB,
		OptionC: q.OptionC,
		OptionD: q.OptionD,
		Points:  q.Points,
	}
}

func validateAndNormalizeQuestion(q Question) (Question, string) {
	q.QuizID = strings.TrimSpace(q.QuizID)
	q.LevelScope = strings.ToLower(strings.TrimSpace(q.LevelScope))
	if q.LevelScope == "" {
		q.LevelScope = "shared"
	}
	if !validLevelScopes[q.LevelScope] {
		return q, "levelScope must be shared, junior, intermediate, or senior"
	}
	q.Topic = strings.TrimSpace(q.Topic)
	if q.Topic == "" {
		q.Topic = "Digital Literacy"
	}
	q.Prompt = strings.TrimSpace(q.Prompt)
	q.OptionA = strings.TrimSpace(q.OptionA)
	q.OptionB = strings.TrimSpace(q.OptionB)
	q.OptionC = strings.TrimSpace(q.OptionC)
	q.OptionD = strings.TrimSpace(q.OptionD)
	q.CorrectOption = strings.ToUpper(strings.TrimSpace(q.CorrectOption))

	if q.Prompt == "" || q.OptionA == "" || q.OptionB == "" || q.OptionC == "" || q.OptionD == "" {
		return q, "prompt and all four options (A, B, C, D) are required"
	}
	if !validOptions[q.CorrectOption] {
		return q, "correctOption must be A, B, C, or D"
	}
	if q.Points <= 0 {
		q.Points = 10
	}
	return q, ""
}

func parseFlexibleTime(raw string) (time.Time, error) {
	raw = strings.TrimSpace(raw)
	layouts := []string{
		time.RFC3339,
		"2006-01-02T15:04:05",
		"2006-01-02T15:04",
		"2006-01-02 15:04:05",
		"2006-01-02 15:04",
		"2006-01-02",
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, raw); err == nil {
			return t.UTC(), nil
		}
	}
	return time.Time{}, fmt.Errorf("unsupported timestamp format: %s", raw)
}
