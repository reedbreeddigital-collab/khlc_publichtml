package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// JudgingScores mirrors the Evolve 8.0 100-mark Project Track rubric.
type JudgingScores struct {
	Technical  int `json:"technical"`  // max 25
	Problem    int `json:"problem"`    // max 15
	Creativity int `json:"creativity"` // max 15
	Impact     int `json:"impact"`     // max 15
	Teamwork   int `json:"teamwork"`   // max 10
	Planning   int `json:"planning"`   // max 10
	Video      int `json:"video"`      // max 10
}

// Total returns the clamped sum out of 100 marks.
func (j JudgingScores) Total() int {
	clamp := func(v, max int) int {
		if v < 0 {
			return 0
		}
		if v > max {
			return max
		}
		return v
	}
	return clamp(j.Technical, 25) +
		clamp(j.Problem, 15) +
		clamp(j.Creativity, 15) +
		clamp(j.Impact, 15) +
		clamp(j.Teamwork, 10) +
		clamp(j.Planning, 10) +
		clamp(j.Video, 10)
}

// ProjectSubmission captures an Evolve 8.0 Phase 2 proposal + 3-min demo video + admin judging.
type ProjectSubmission struct {
	ID                 string             `json:"id"`
	ReferenceID        string             `json:"referenceId"`
	SchoolName         string             `json:"schoolName"`
	Category           string             `json:"category"` // Primary | Secondary
	ProjectPath        string             `json:"projectPath"` // Coding | AI | Robotics
	ProjectTheme       string             `json:"projectTheme"`
	SupervisingTeacher string             `json:"supervisingTeacher"`
	TeamMembers        []EvolveTeamMember `json:"teamMembers"`
	ProblemStatement   string             `json:"problemStatement"`
	SolutionSummary    string             `json:"solutionSummary"`
	HowItWorks         string             `json:"howItWorks"`
	ExpectedImpact     string             `json:"expectedImpact"`
	Milestones         string             `json:"milestones"`
	WordCount          int                `json:"wordCount"`
	VideoURL           string             `json:"videoUrl,omitempty"`
	InstructorFeedback string             `json:"instructorFeedback,omitempty"`
	JudgingScores      JudgingScores      `json:"judgingScores"`
	TotalMarks         int                `json:"totalMarks"`
	Status             string             `json:"status"` // submitted | feedback_sent | video_submitted | finalist | winner
	CreatedAt          time.Time          `json:"createdAt"`
	UpdatedAt          time.Time          `json:"updatedAt"`
}

// ProjectHandler manages Evolve 8.0 Project Track proposals, video links, feedback, and judging.
type ProjectHandler struct {
	pool        *pgxpool.Pool
	mu          sync.RWMutex
	submissions map[string]ProjectSubmission // id -> submission
}

// NewProjectHandler constructs a ProjectHandler backed by Postgres (when pool != nil) or in-memory storage.
func NewProjectHandler(pool ...*pgxpool.Pool) *ProjectHandler {
	var p *pgxpool.Pool
	if len(pool) > 0 {
		p = pool[0]
	}
	return &ProjectHandler{
		pool:        p,
		submissions: make(map[string]ProjectSubmission),
	}
}

var validProjectStatuses = map[string]bool{
	"submitted":       true,
	"feedback_sent":   true,
	"video_submitted": true,
	"finalist":        true,
	"winner":          true,
}

func countWords(parts ...string) int {
	total := 0
	for _, s := range parts {
		total += len(strings.Fields(s))
	}
	return total
}

// SubmitProject handles POST /api/v1/evolve/projects (creates or updates by referenceId).
func (h *ProjectHandler) SubmitProject(w http.ResponseWriter, r *http.Request) {
	var req ProjectSubmission
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	req.ReferenceID = strings.ToUpper(strings.TrimSpace(req.ReferenceID))
	req.SchoolName = strings.TrimSpace(req.SchoolName)
	req.Category = strings.TrimSpace(req.Category)
	req.ProjectPath = strings.TrimSpace(req.ProjectPath)
	req.ProjectTheme = strings.TrimSpace(req.ProjectTheme)
	req.SupervisingTeacher = strings.TrimSpace(req.SupervisingTeacher)
	req.ProblemStatement = strings.TrimSpace(req.ProblemStatement)
	req.SolutionSummary = strings.TrimSpace(req.SolutionSummary)
	req.HowItWorks = strings.TrimSpace(req.HowItWorks)
	req.ExpectedImpact = strings.TrimSpace(req.ExpectedImpact)
	req.Milestones = strings.TrimSpace(req.Milestones)
	req.VideoURL = strings.TrimSpace(req.VideoURL)

	if req.ReferenceID == "" || req.SchoolName == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "referenceId and schoolName are required"})
		return
	}
	if req.Category != "Primary" && req.Category != "Secondary" {
		req.Category = "Primary"
	}
	if req.ProjectPath != "Coding" && req.ProjectPath != "AI" && req.ProjectPath != "Robotics" {
		req.ProjectPath = "Coding"
	}
	if req.ProblemStatement == "" && req.VideoURL == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "provide either your proposal sections or a 3-minute demo video URL"})
		return
	}

	wc := countWords(req.ProblemStatement, req.SolutionSummary, req.HowItWorks, req.ExpectedImpact, req.Milestones)
	maxWords := 300
	if req.Category == "Secondary" {
		maxWords = 500
	}
	if wc > maxWords+25 { // slight buffer for punctuation/hyphens
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": fmt.Sprintf("proposal exceeds %s word limit (%d / %d words)", req.Category, wc, maxWords),
		})
		return
	}

	now := time.Now().UTC()
	if req.TeamMembers == nil {
		req.TeamMembers = make([]EvolveTeamMember, 0)
	}
	req.WordCount = wc
	status := "submitted"
	if req.VideoURL != "" {
		status = "video_submitted"
	}

	if h.pool != nil {
		teamJSON, _ := json.Marshal(req.TeamMembers)
		newID := fmt.Sprintf("proj_%d", now.UnixNano())

		var saved ProjectSubmission
		var teamRaw, scoresRaw []byte
		err := h.pool.QueryRow(r.Context(), `
			INSERT INTO project_submissions (
				id, reference_id, school_name, category, project_path, project_theme,
				supervising_teacher, team_members, problem_statement, solution_summary,
				how_it_works, expected_impact, milestones, word_count, video_url,
				status, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6,
				$7, $8::jsonb, $9, $10,
				$11, $12, $13, $14, $15,
				$16, $17, $17
			)
			ON CONFLICT (reference_id) DO UPDATE SET
				school_name = EXCLUDED.school_name,
				category = EXCLUDED.category,
				project_path = EXCLUDED.project_path,
				project_theme = CASE WHEN EXCLUDED.project_theme <> '' THEN EXCLUDED.project_theme ELSE project_submissions.project_theme END,
				supervising_teacher = CASE WHEN EXCLUDED.supervising_teacher <> '' THEN EXCLUDED.supervising_teacher ELSE project_submissions.supervising_teacher END,
				team_members = CASE WHEN jsonb_array_length(EXCLUDED.team_members) > 0 THEN EXCLUDED.team_members ELSE project_submissions.team_members END,
				problem_statement = CASE WHEN EXCLUDED.problem_statement <> '' THEN EXCLUDED.problem_statement ELSE project_submissions.problem_statement END,
				solution_summary = CASE WHEN EXCLUDED.solution_summary <> '' THEN EXCLUDED.solution_summary ELSE project_submissions.solution_summary END,
				how_it_works = CASE WHEN EXCLUDED.how_it_works <> '' THEN EXCLUDED.how_it_works ELSE project_submissions.how_it_works END,
				expected_impact = CASE WHEN EXCLUDED.expected_impact <> '' THEN EXCLUDED.expected_impact ELSE project_submissions.expected_impact END,
				milestones = CASE WHEN EXCLUDED.milestones <> '' THEN EXCLUDED.milestones ELSE project_submissions.milestones END,
				word_count = CASE WHEN EXCLUDED.word_count > 0 THEN EXCLUDED.word_count ELSE project_submissions.word_count END,
				video_url = CASE WHEN EXCLUDED.video_url <> '' THEN EXCLUDED.video_url ELSE project_submissions.video_url END,
				status = CASE WHEN EXCLUDED.video_url <> '' AND project_submissions.status IN ('submitted', 'feedback_sent') THEN 'video_submitted' ELSE project_submissions.status END,
				updated_at = EXCLUDED.updated_at
			RETURNING id, reference_id, school_name, category, project_path, project_theme,
			          supervising_teacher, team_members, problem_statement, solution_summary,
			          how_it_works, expected_impact, milestones, word_count, video_url,
			          instructor_feedback, judging_scores, total_marks, status, created_at, updated_at
		`,
			newID, req.ReferenceID, req.SchoolName, req.Category, req.ProjectPath, req.ProjectTheme,
			req.SupervisingTeacher, string(teamJSON), req.ProblemStatement, req.SolutionSummary,
			req.HowItWorks, req.ExpectedImpact, req.Milestones, req.WordCount, req.VideoURL,
			status, now,
		).Scan(
			&saved.ID, &saved.ReferenceID, &saved.SchoolName, &saved.Category, &saved.ProjectPath, &saved.ProjectTheme,
			&saved.SupervisingTeacher, &teamRaw, &saved.ProblemStatement, &saved.SolutionSummary,
			&saved.HowItWorks, &saved.ExpectedImpact, &saved.Milestones, &saved.WordCount, &saved.VideoURL,
			&saved.InstructorFeedback, &scoresRaw, &saved.TotalMarks, &saved.Status, &saved.CreatedAt, &saved.UpdatedAt,
		)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to store project submission"})
			return
		}
		_ = json.Unmarshal(teamRaw, &saved.TeamMembers)
		_ = json.Unmarshal(scoresRaw, &saved.JudgingScores)

		writeJSON(w, http.StatusCreated, map[string]any{
			"message": "Project Track submission saved successfully",
			"data":    saved,
		})
		return
	}

	// In-memory fallback
	h.mu.Lock()
	var existingID string
	for id, item := range h.submissions {
		if strings.EqualFold(item.ReferenceID, req.ReferenceID) {
			existingID = id
			break
		}
	}
	if existingID != "" {
		cur := h.submissions[existingID]
		cur.SchoolName = req.SchoolName
		cur.Category = req.Category
		cur.ProjectPath = req.ProjectPath
		if req.ProjectTheme != "" {
			cur.ProjectTheme = req.ProjectTheme
		}
		if req.SupervisingTeacher != "" {
			cur.SupervisingTeacher = req.SupervisingTeacher
		}
		if len(req.TeamMembers) > 0 {
			cur.TeamMembers = req.TeamMembers
		}
		if req.ProblemStatement != "" {
			cur.ProblemStatement = req.ProblemStatement
			cur.SolutionSummary = req.SolutionSummary
			cur.HowItWorks = req.HowItWorks
			cur.ExpectedImpact = req.ExpectedImpact
			cur.Milestones = req.Milestones
			cur.WordCount = req.WordCount
		}
		if req.VideoURL != "" {
			cur.VideoURL = req.VideoURL
			if cur.Status == "submitted" || cur.Status == "feedback_sent" {
				cur.Status = "video_submitted"
			}
		}
		cur.UpdatedAt = now
		h.submissions[existingID] = cur
		h.mu.Unlock()
		writeJSON(w, http.StatusCreated, map[string]any{
			"message": "Project Track submission updated successfully",
			"data":    cur,
		})
		return
	}

	req.ID = fmt.Sprintf("proj_%d", now.UnixNano())
	req.Status = status
	req.CreatedAt = now
	req.UpdatedAt = now
	h.submissions[req.ID] = req
	h.mu.Unlock()

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Project Track submission saved successfully",
		"data":    req,
	})
}

// LookupProject handles GET /api/v1/evolve/projects/lookup?ref=EV8-XXXX.
// Returns an existing project submission and/or prefill metadata from evolve_registrations.
func (h *ProjectHandler) LookupProject(w http.ResponseWriter, r *http.Request) {
	ref := strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("ref")))
	if ref == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "ref query parameter is required"})
		return
	}

	var submission *ProjectSubmission
	var registrationPrefill map[string]any

	if h.pool != nil {
		var s ProjectSubmission
		var teamRaw, scoresRaw []byte
		err := h.pool.QueryRow(r.Context(), `
			SELECT id, reference_id, school_name, category, project_path, project_theme,
			       supervising_teacher, team_members, problem_statement, solution_summary,
			       how_it_works, expected_impact, milestones, word_count, video_url,
			       instructor_feedback, judging_scores, total_marks, status, created_at, updated_at
			FROM project_submissions
			WHERE UPPER(reference_id) = $1
		`, ref).Scan(
			&s.ID, &s.ReferenceID, &s.SchoolName, &s.Category, &s.ProjectPath, &s.ProjectTheme,
			&s.SupervisingTeacher, &teamRaw, &s.ProblemStatement, &s.SolutionSummary,
			&s.HowItWorks, &s.ExpectedImpact, &s.Milestones, &s.WordCount, &s.VideoURL,
			&s.InstructorFeedback, &scoresRaw, &s.TotalMarks, &s.Status, &s.CreatedAt, &s.UpdatedAt,
		)
		if err == nil {
			_ = json.Unmarshal(teamRaw, &s.TeamMembers)
			_ = json.Unmarshal(scoresRaw, &s.JudgingScores)
			submission = &s
		} else if !errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to look up submission"})
			return
		}

		// Also check evolve_registrations so schools can prefill their school/team details
		var schoolName, cat, path, theme, teacher string
		var regTeamRaw []byte
		regErr := h.pool.QueryRow(r.Context(), `
			SELECT school_name, project_category, project_path, project_theme, supervising_teacher, project_team
			FROM evolve_registrations
			WHERE UPPER(reference_id) = $1
			LIMIT 1
		`, ref).Scan(&schoolName, &cat, &path, &theme, &teacher, &regTeamRaw)
		if regErr == nil {
			var members []EvolveTeamMember
			_ = json.Unmarshal(regTeamRaw, &members)
			registrationPrefill = map[string]any{
				"referenceId":        ref,
				"schoolName":         schoolName,
				"category":           cat,
				"projectPath":        path,
				"projectTheme":       theme,
				"supervisingTeacher": teacher,
				"teamMembers":        members,
			}
		}
	} else {
		h.mu.RLock()
		for _, item := range h.submissions {
			if strings.EqualFold(item.ReferenceID, ref) {
				cp := item
				submission = &cp
				break
			}
		}
		h.mu.RUnlock()
	}

	if submission == nil && registrationPrefill == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{
			"error": "No registration or project submission found for reference " + ref,
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"submission":   submission,
		"registration": registrationPrefill,
	})
}

// ListProjects handles GET /api/v1/admin/projects.
func (h *ProjectHandler) ListProjects(w http.ResponseWriter, r *http.Request) {
	if h.pool != nil {
		rows, err := h.pool.Query(r.Context(), `
			SELECT id, reference_id, school_name, category, project_path, project_theme,
			       supervising_teacher, team_members, problem_statement, solution_summary,
			       how_it_works, expected_impact, milestones, word_count, video_url,
			       instructor_feedback, judging_scores, total_marks, status, created_at, updated_at
			FROM project_submissions
			ORDER BY total_marks DESC, updated_at DESC
			LIMIT 300
		`)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load project submissions"})
			return
		}
		defer rows.Close()

		out := make([]ProjectSubmission, 0)
		for rows.Next() {
			var s ProjectSubmission
			var teamRaw, scoresRaw []byte
			if err := rows.Scan(
				&s.ID, &s.ReferenceID, &s.SchoolName, &s.Category, &s.ProjectPath, &s.ProjectTheme,
				&s.SupervisingTeacher, &teamRaw, &s.ProblemStatement, &s.SolutionSummary,
				&s.HowItWorks, &s.ExpectedImpact, &s.Milestones, &s.WordCount, &s.VideoURL,
				&s.InstructorFeedback, &scoresRaw, &s.TotalMarks, &s.Status, &s.CreatedAt, &s.UpdatedAt,
			); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to decode project submission"})
				return
			}
			_ = json.Unmarshal(teamRaw, &s.TeamMembers)
			_ = json.Unmarshal(scoresRaw, &s.JudgingScores)
			out = append(out, s)
		}
		writeJSON(w, http.StatusOK, map[string]any{"count": len(out), "data": out})
		return
	}

	h.mu.RLock()
	out := make([]ProjectSubmission, 0, len(h.submissions))
	for _, s := range h.submissions {
		out = append(out, s)
	}
	h.mu.RUnlock()

	writeJSON(w, http.StatusOK, map[string]any{"count": len(out), "data": out})
}

// ReviewProject handles PATCH /api/v1/admin/projects/{id} (admin feedback, judging rubric, finalist status).
func (h *ProjectHandler) ReviewProject(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing project id"})
		return
	}

	var patch struct {
		InstructorFeedback *string        `json:"instructorFeedback"`
		JudgingScores      *JudgingScores `json:"judgingScores"`
		Status             *string        `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&patch); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	if patch.Status != nil {
		st := strings.ToLower(strings.TrimSpace(*patch.Status))
		if !validProjectStatuses[st] {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid project status"})
			return
		}
		*patch.Status = st
	}

	if h.pool != nil {
		var cur ProjectSubmission
		var teamRaw, scoresRaw []byte
		err := h.pool.QueryRow(r.Context(), `
			SELECT id, reference_id, school_name, category, project_path, project_theme,
			       supervising_teacher, team_members, problem_statement, solution_summary,
			       how_it_works, expected_impact, milestones, word_count, video_url,
			       instructor_feedback, judging_scores, total_marks, status, created_at, updated_at
			FROM project_submissions WHERE id = $1
		`, id).Scan(
			&cur.ID, &cur.ReferenceID, &cur.SchoolName, &cur.Category, &cur.ProjectPath, &cur.ProjectTheme,
			&cur.SupervisingTeacher, &teamRaw, &cur.ProblemStatement, &cur.SolutionSummary,
			&cur.HowItWorks, &cur.ExpectedImpact, &cur.Milestones, &cur.WordCount, &cur.VideoURL,
			&cur.InstructorFeedback, &scoresRaw, &cur.TotalMarks, &cur.Status, &cur.CreatedAt, &cur.UpdatedAt,
		)
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "project submission not found"})
			return
		}
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load project submission"})
			return
		}
		_ = json.Unmarshal(teamRaw, &cur.TeamMembers)
		_ = json.Unmarshal(scoresRaw, &cur.JudgingScores)

		if patch.InstructorFeedback != nil {
			cur.InstructorFeedback = strings.TrimSpace(*patch.InstructorFeedback)
		}
		if patch.JudgingScores != nil {
			cur.JudgingScores = *patch.JudgingScores
			cur.TotalMarks = cur.JudgingScores.Total()
		}
		if patch.Status != nil {
			cur.Status = *patch.Status
		}
		cur.UpdatedAt = time.Now().UTC()

		newScoresJSON, _ := json.Marshal(cur.JudgingScores)
		_, err = h.pool.Exec(r.Context(), `
			UPDATE project_submissions
			SET instructor_feedback = $2, judging_scores = $3::jsonb, total_marks = $4, status = $5, updated_at = $6
			WHERE id = $1
		`, cur.ID, cur.InstructorFeedback, string(newScoresJSON), cur.TotalMarks, cur.Status, cur.UpdatedAt)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save review"})
			return
		}

		writeJSON(w, http.StatusOK, map[string]any{"message": "Project review saved", "data": cur})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()
	cur, ok := h.submissions[id]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "project submission not found"})
		return
	}
	if patch.InstructorFeedback != nil {
		cur.InstructorFeedback = strings.TrimSpace(*patch.InstructorFeedback)
	}
	if patch.JudgingScores != nil {
		cur.JudgingScores = *patch.JudgingScores
		cur.TotalMarks = cur.JudgingScores.Total()
	}
	if patch.Status != nil {
		cur.Status = *patch.Status
	}
	cur.UpdatedAt = time.Now().UTC()
	h.submissions[id] = cur

	writeJSON(w, http.StatusOK, map[string]any{"message": "Project review saved", "data": cur})
}
