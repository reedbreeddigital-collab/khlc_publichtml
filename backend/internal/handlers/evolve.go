package handlers

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"khlc-backend/internal/mailer"
	"khlc-backend/internal/quiz"
)

// EvolvePupil represents a pupil registered for the Phase 1 National Online Test.
type EvolvePupil struct {
	Name      string `json:"name"`
	Level     string `json:"level"`
	ClassName string `json:"className"`
	VideoURL  string `json:"videoUrl,omitempty"`
}

// EvolveTeamMember represents a pupil on a school's 5-member Project Track team.
type EvolveTeamMember struct {
	Name      string `json:"name"`
	ClassName string `json:"className"`
	VideoURL  string `json:"videoUrl,omitempty"`
}

// GeneratedStudentCredential is returned immediately upon registration so coordinators can copy/print logins.
type GeneratedStudentCredential struct {
	ID        string `json:"id"`
	FullName  string `json:"fullName"`
	Level     string `json:"level"`
	ClassName string `json:"className"`
	ExamCode  string `json:"examCode"`
	PinCode   string `json:"pinCode"`
}

// EvolveRegistration captures an Evolve 8.0 school & team registration.
type EvolveRegistration struct {
	ID                 string             `json:"id"`
	ReferenceID        string             `json:"referenceId"`
	Track              string             `json:"track"` // both | test | project
	SchoolName         string             `json:"schoolName"`
	SchoolLocation     string             `json:"schoolLocation"`
	SchoolAddress      string             `json:"schoolAddress"`
	SchoolType         string             `json:"schoolType"`
	CoordinatorName    string             `json:"coordinatorName"`
	CoordinatorRole    string             `json:"coordinatorRole"`
	Phone              string             `json:"phone"`
	Email              string             `json:"email"`
	DevicePreference   string             `json:"devicePreference,omitempty"`
	TestPupils         []EvolvePupil      `json:"testPupils,omitempty"`
	ProjectCategory    string             `json:"projectCategory,omitempty"`
	ProjectPath        string             `json:"projectPath,omitempty"`
	ProjectTheme       string             `json:"projectTheme,omitempty"`
	SupervisingTeacher string             `json:"supervisingTeacher,omitempty"`
	ProjectTeam        []EvolveTeamMember `json:"projectTeam,omitempty"`
	ProjectIdea        string             `json:"projectIdea,omitempty"`
	NDPAConsent        bool               `json:"ndpaConsent"`
	CreatedAt          time.Time          `json:"createdAt"`
}

// EvolveHandler manages Evolve 8.0 registrations, automatic student provisioning, and confirmation emails.
type EvolveHandler struct {
	pool          *pgxpool.Pool
	quizStore     quiz.Store
	mailer        *mailer.Mailer
	logger        *slog.Logger
	mu            sync.RWMutex
	registrations []EvolveRegistration
}

// NewEvolveHandler constructs a new EvolveHandler backed by Postgres (when pool != nil) or in-memory storage.
func NewEvolveHandler(pool ...*pgxpool.Pool) *EvolveHandler {
	var p *pgxpool.Pool
	if len(pool) > 0 {
		p = pool[0]
	}
	return &EvolveHandler{
		pool:          p,
		registrations: make([]EvolveRegistration, 0),
	}
}

// WithQuizStore enables automatic student account creation (Exam ID + 6-digit PIN) on registration.
func (h *EvolveHandler) WithQuizStore(store quiz.Store) *EvolveHandler {
	h.quizStore = store
	return h
}

// WithMailer enables automatic confirmation email dispatch to the registered teacher/coordinator.
func (h *EvolveHandler) WithMailer(m *mailer.Mailer, logger *slog.Logger) *EvolveHandler {
	h.mailer = m
	h.logger = logger
	return h
}

var validEvolveTracks = map[string]bool{
	"both":    true,
	"test":    true,
	"project": true,
}

// CreateRegistration handles POST /api/v1/evolve/registrations.
func (h *EvolveHandler) CreateRegistration(w http.ResponseWriter, r *http.Request) {
	var req EvolveRegistration
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid JSON request body",
		})
		return
	}

	req.Track = strings.ToLower(strings.TrimSpace(req.Track))
	req.SchoolName = strings.TrimSpace(req.SchoolName)
	req.CoordinatorName = strings.TrimSpace(req.CoordinatorName)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Email = strings.TrimSpace(req.Email)

	if !validEvolveTracks[req.Track] {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "track must be one of: both, test, project",
		})
		return
	}
	if req.SchoolName == "" || req.CoordinatorName == "" || req.Phone == "" || req.Email == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "schoolName, coordinatorName, phone, and email are required",
		})
		return
	}
	if !req.NDPAConsent {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "NDPA 2023 parental consent confirmation is required",
		})
		return
	}

	now := time.Now().UTC()
	req.ID = fmt.Sprintf("ev8_%d", now.UnixNano())
	if strings.TrimSpace(req.ReferenceID) == "" {
		req.ReferenceID = fmt.Sprintf("EV8-%s", randomDigitsStr(4))
	} else {
		req.ReferenceID = strings.ToUpper(strings.TrimSpace(req.ReferenceID))
	}
	req.CreatedAt = now
	if req.TestPupils == nil {
		req.TestPupils = make([]EvolvePupil, 0)
	}
	if req.ProjectTeam == nil {
		req.ProjectTeam = make([]EvolveTeamMember, 0)
	}

	if h.pool != nil {
		pupilsJSON, _ := json.Marshal(req.TestPupils)
		teamJSON, _ := json.Marshal(req.ProjectTeam)
		_, err := h.pool.Exec(r.Context(), `
			INSERT INTO evolve_registrations (
				id, reference_id, track, school_name, school_location, school_address, school_type,
				coordinator_name, coordinator_role, phone, email, device_preference,
				test_pupils, project_category, project_path, project_theme,
				supervising_teacher, project_team, project_idea, ndpa_consent, created_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7,
				$8, $9, $10, $11, $12,
				$13::jsonb, $14, $15, $16,
				$17, $18::jsonb, $19, $20, $21
			)
		`,
			req.ID, req.ReferenceID, req.Track, req.SchoolName, req.SchoolLocation, req.SchoolAddress, req.SchoolType,
			req.CoordinatorName, req.CoordinatorRole, req.Phone, req.Email, req.DevicePreference,
			string(pupilsJSON), req.ProjectCategory, req.ProjectPath, req.ProjectTheme,
			req.SupervisingTeacher, string(teamJSON), req.ProjectIdea, req.NDPAConsent, req.CreatedAt,
		)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to store registration"})
			return
		}
	} else {
		h.mu.Lock()
		h.registrations = append([]EvolveRegistration{req}, h.registrations...)
		h.mu.Unlock()
	}

	// 1. Auto-create student accounts (Exam ID + 6-digit PIN) for every registered Phase 1 pupil
	generated := make([]GeneratedStudentCredential, 0, len(req.TestPupils))
	if h.quizStore != nil && (req.Track == "both" || req.Track == "test") {
		for _, pup := range req.TestPupils {
			name := strings.TrimSpace(pup.Name)
			if name == "" {
				continue
			}
			lvl := normalizePupilLevel(pup.Level)
			pin := randomDigitsStr(6)
			hashSum := sha256.Sum256([]byte(pin))
			pinHash := hex.EncodeToString(hashSum[:])

			// Retry Exam ID generation on rare collision
			var createdStu *quiz.Student
			for attempt := 0; attempt < 5; attempt++ {
				examCode := makeExamCode(lvl)
				stu := quiz.Student{
					ID:              fmt.Sprintf("stu_%d_%s", time.Now().UTC().UnixNano(), randomDigitsStr(3)),
					ExamCode:        examCode,
					PinCode:         pin,
					PinHash:         pinHash,
					FullName:        name,
					SchoolName:      req.SchoolName,
					SchoolLocation:  req.SchoolLocation,
					Level:           lvl,
					ClassName:       strings.TrimSpace(pup.ClassName),
					RegistrationRef: req.ReferenceID,
					CreatedAt:       time.Now().UTC(),
				}
				res, err := h.quizStore.CreateStudent(r.Context(), stu)
				if err == nil {
					createdStu = res
					break
				}
				if !errors.Is(err, quiz.ErrConflict) {
					break
				}
			}

			if createdStu != nil {
				generated = append(generated, GeneratedStudentCredential{
					ID:        createdStu.ID,
					FullName:  createdStu.FullName,
					Level:     createdStu.Level,
					ClassName: createdStu.ClassName,
					ExamCode:  createdStu.ExamCode,
					PinCode:   createdStu.PinCode,
				})
			}
		}
	}

	// 2. Dispatch confirmation email with Reference ID & generated student Exam IDs/PINs to coordinator
	emailSent := false
	emailNote := ""
	if h.mailer != nil && h.mailer.IsConfigured() && req.Email != "" {
		mailCreds := make([]mailer.StudentCredential, 0, len(generated))
		for _, g := range generated {
			mailCreds = append(mailCreds, mailer.StudentCredential{
				FullName:  g.FullName,
				Level:     g.Level,
				ClassName: g.ClassName,
				ExamCode:  g.ExamCode,
				PinCode:   g.PinCode,
			})
		}
		mailCtx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
		err := h.mailer.SendEvolveRegistrationEmail(mailCtx, mailer.EvolveRegistrationEmailData{
			ReferenceID:     req.ReferenceID,
			SchoolName:      req.SchoolName,
			CoordinatorName: req.CoordinatorName,
			RecipientEmail:  req.Email,
			Track:           req.Track,
			ProjectPath:     req.ProjectPath,
			ProjectTheme:    req.ProjectTheme,
			Students:        mailCreds,
		})
		cancel()
		if err != nil {
			emailNote = "Registration saved, but email delivery failed — please copy or print your credentials below."
			if h.logger != nil {
				h.logger.Warn("failed to dispatch Evolve registration email",
					"ref", req.ReferenceID,
					"recipient", req.Email,
					"err", err,
				)
			}
		} else {
			emailSent = true
		}
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"message":           "Evolve 8.0 registration recorded successfully",
		"data":              req,
		"generatedStudents": generated,
		"emailSent":         emailSent,
		"emailRecipient":    req.Email,
		"emailNote":         emailNote,
	})
}

// ListRegistrations handles GET /api/v1/evolve/registrations.
func (h *EvolveHandler) ListRegistrations(w http.ResponseWriter, r *http.Request) {
	if h.pool != nil {
		rows, err := h.pool.Query(r.Context(), `
			SELECT id, reference_id, track, school_name, school_location, school_address, school_type,
			       coordinator_name, coordinator_role, phone, email, device_preference,
			       test_pupils, project_category, project_path, project_theme,
			       supervising_teacher, project_team, project_idea, ndpa_consent, created_at
			FROM evolve_registrations
			ORDER BY created_at DESC
			LIMIT 200
		`)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load registrations"})
			return
		}
		defer rows.Close()

		out := make([]EvolveRegistration, 0)
		for rows.Next() {
			var reg EvolveRegistration
			var pupilsRaw, teamRaw []byte
			if err := rows.Scan(
				&reg.ID, &reg.ReferenceID, &reg.Track, &reg.SchoolName, &reg.SchoolLocation, &reg.SchoolAddress, &reg.SchoolType,
				&reg.CoordinatorName, &reg.CoordinatorRole, &reg.Phone, &reg.Email, &reg.DevicePreference,
				&pupilsRaw, &reg.ProjectCategory, &reg.ProjectPath, &reg.ProjectTheme,
				&reg.SupervisingTeacher, &teamRaw, &reg.ProjectIdea, &reg.NDPAConsent, &reg.CreatedAt,
			); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to decode registration"})
				return
			}
			_ = json.Unmarshal(pupilsRaw, &reg.TestPupils)
			_ = json.Unmarshal(teamRaw, &reg.ProjectTeam)
			out = append(out, reg)
		}

		writeJSON(w, http.StatusOK, map[string]any{
			"count": len(out),
			"data":  out,
		})
		return
	}

	h.mu.RLock()
	out := make([]EvolveRegistration, len(h.registrations))
	copy(out, h.registrations)
	h.mu.RUnlock()

	writeJSON(w, http.StatusOK, map[string]any{
		"count": len(out),
		"data":  out,
	})
}

// findRegistrations locates registrations matching ref (exact referenceId) or query (referenceId, email, or phone).
func (h *EvolveHandler) findRegistrations(ctx context.Context, ref, query string) ([]EvolveRegistration, error) {
	cleanRef := strings.ToUpper(strings.TrimSpace(ref))
	cleanQuery := strings.TrimSpace(query)

	if h.pool != nil {
		var (
			rows pgx.Rows
			err  error
		)
		if cleanRef != "" {
			rows, err = h.pool.Query(ctx, `
				SELECT id, reference_id, track, school_name, school_location, school_address, school_type,
				       coordinator_name, coordinator_role, phone, email, device_preference,
				       test_pupils, project_category, project_path, project_theme,
				       supervising_teacher, project_team, project_idea, ndpa_consent, created_at
				FROM evolve_registrations
				WHERE UPPER(reference_id) = $1
				ORDER BY created_at DESC
				LIMIT 20
			`, cleanRef)
		} else {
			rows, err = h.pool.Query(ctx, `
				SELECT id, reference_id, track, school_name, school_location, school_address, school_type,
				       coordinator_name, coordinator_role, phone, email, device_preference,
				       test_pupils, project_category, project_path, project_theme,
				       supervising_teacher, project_team, project_idea, ndpa_consent, created_at
				FROM evolve_registrations
				WHERE UPPER(reference_id) = UPPER($1)
				   OR LOWER(email) = LOWER($1)
				   OR phone = $1
				ORDER BY created_at DESC
				LIMIT 20
			`, cleanQuery)
		}
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		out := make([]EvolveRegistration, 0)
		for rows.Next() {
			var reg EvolveRegistration
			var pupilsRaw, teamRaw []byte
			if err := rows.Scan(
				&reg.ID, &reg.ReferenceID, &reg.Track, &reg.SchoolName, &reg.SchoolLocation, &reg.SchoolAddress, &reg.SchoolType,
				&reg.CoordinatorName, &reg.CoordinatorRole, &reg.Phone, &reg.Email, &reg.DevicePreference,
				&pupilsRaw, &reg.ProjectCategory, &reg.ProjectPath, &reg.ProjectTheme,
				&reg.SupervisingTeacher, &teamRaw, &reg.ProjectIdea, &reg.NDPAConsent, &reg.CreatedAt,
			); err != nil {
				return nil, err
			}
			_ = json.Unmarshal(pupilsRaw, &reg.TestPupils)
			_ = json.Unmarshal(teamRaw, &reg.ProjectTeam)
			out = append(out, reg)
		}
		return out, rows.Err()
	}

	h.mu.RLock()
	defer h.mu.RUnlock()
	out := make([]EvolveRegistration, 0)
	for _, reg := range h.registrations {
		if cleanRef != "" {
			if strings.EqualFold(reg.ReferenceID, cleanRef) {
				out = append(out, reg)
			}
		} else if cleanQuery != "" {
			if strings.EqualFold(reg.ReferenceID, cleanQuery) ||
				strings.EqualFold(reg.Email, cleanQuery) ||
				strings.TrimSpace(reg.Phone) == cleanQuery {
				out = append(out, reg)
			}
		}
	}
	return out, nil
}

// ensureStudentsForRegistration ensures every pupil in TestPupils and ProjectTeam exists in quizStore under reg.ReferenceID.
func (h *EvolveHandler) ensureStudentsForRegistration(ctx context.Context, reg EvolveRegistration) []quiz.StudentWithAttempt {
	if h.quizStore == nil {
		return []quiz.StudentWithAttempt{}
	}
	existing, _ := h.quizStore.ListStudentsByRegistrationRef(ctx, reg.ReferenceID)
	knownNames := make(map[string]bool, len(existing))
	for _, s := range existing {
		knownNames[strings.ToLower(strings.TrimSpace(s.FullName))] = true
	}

	type candidate struct {
		name      string
		level     string
		className string
		videoURL  string
	}
	candidates := make([]candidate, 0, len(reg.TestPupils)+len(reg.ProjectTeam))
	for _, p := range reg.TestPupils {
		candidates = append(candidates, candidate{
			name:      p.Name,
			level:     p.Level,
			className: p.ClassName,
			videoURL:  p.VideoURL,
		})
	}
	defaultProjLevel := "junior"
	if strings.EqualFold(reg.ProjectCategory, "Secondary") {
		defaultProjLevel = "intermediate"
	}
	for _, m := range reg.ProjectTeam {
		lvl := defaultProjLevel
		cn := strings.ToLower(m.ClassName)
		if strings.Contains(cn, "ss") && !strings.Contains(cn, "jss") {
			lvl = "senior"
		} else if strings.Contains(cn, "jss") {
			lvl = "intermediate"
		}
		candidates = append(candidates, candidate{
			name:      m.Name,
			level:     lvl,
			className: m.ClassName,
			videoURL:  m.VideoURL,
		})
	}

	createdAny := false
	for _, c := range candidates {
		name := strings.TrimSpace(c.name)
		if name == "" {
			continue
		}
		key := strings.ToLower(name)
		if knownNames[key] {
			continue
		}
		lvl := normalizePupilLevel(c.level)
		pin := randomDigitsStr(6)
		hashSum := sha256.Sum256([]byte(pin))
		pinHash := hex.EncodeToString(hashSum[:])

		for attempt := 0; attempt < 5; attempt++ {
			examCode := makeExamCode(lvl)
			stu := quiz.Student{
				ID:              fmt.Sprintf("stu_%d_%s", time.Now().UTC().UnixNano(), randomDigitsStr(3)),
				ExamCode:        examCode,
				PinCode:         pin,
				PinHash:         pinHash,
				FullName:        name,
				SchoolName:      reg.SchoolName,
				SchoolLocation:  reg.SchoolLocation,
				Level:           lvl,
				ClassName:       strings.TrimSpace(c.className),
				RegistrationRef: reg.ReferenceID,
				Phase2VideoURL:  strings.TrimSpace(c.videoURL),
				CreatedAt:       time.Now().UTC(),
			}
			if _, err := h.quizStore.CreateStudent(ctx, stu); err == nil {
				knownNames[key] = true
				createdAny = true
				break
			}
		}
	}

	if createdAny {
		existing, _ = h.quizStore.ListStudentsByRegistrationRef(ctx, reg.ReferenceID)
	}
	return existing
}

// RegistrarDashboard handles GET /api/v1/evolve/registrar/dashboard?ref=EV8-XXXX&query=...
// Allows a school teacher/coordinator/registrar to load their registered school and manage per-student Phase 2 social video links.
func (h *EvolveHandler) RegistrarDashboard(w http.ResponseWriter, r *http.Request) {
	ref := strings.TrimSpace(r.URL.Query().Get("ref"))
	query := strings.TrimSpace(r.URL.Query().Get("query"))
	if query == "" {
		query = strings.TrimSpace(r.URL.Query().Get("email"))
	}
	if ref == "" && query == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Provide your Registration Reference ID (e.g. EV8-1234) or registered coordinator email/phone",
		})
		return
	}

	regs, err := h.findRegistrations(r.Context(), ref, query)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to look up registration"})
		return
	}
	if len(regs) == 0 {
		// Fallback: if they searched by a Reference ID that only exists on students table (e.g. demo students EV8-DEMO-01)
		lookupRef := strings.ToUpper(ref)
		if lookupRef == "" {
			lookupRef = strings.ToUpper(query)
		}
		if h.quizStore != nil && strings.HasPrefix(lookupRef, "EV8-") {
			students, _ := h.quizStore.ListStudentsByRegistrationRef(r.Context(), lookupRef)
			if len(students) > 0 {
				first := students[0]
				synthetic := EvolveRegistration{
					ID:              "reg_" + lookupRef,
					ReferenceID:     lookupRef,
					Track:           "both",
					SchoolName:      first.SchoolName,
					SchoolLocation:  first.SchoolLocation,
					CoordinatorName: "School Coordinator",
					CoordinatorRole: "Coordinator",
					CreatedAt:       first.CreatedAt,
				}
				writeJSON(w, http.StatusOK, map[string]any{
					"registration":          synthetic,
					"matchingRegistrations": []EvolveRegistration{synthetic},
					"students":              students,
				})
				return
			}
		}

		writeJSON(w, http.StatusNotFound, map[string]string{
			"error": "No Evolve 8.0 school registration found matching that Reference ID or coordinator email/phone",
		})
		return
	}

	activeReg := regs[0]
	students := h.ensureStudentsForRegistration(r.Context(), activeReg)

	writeJSON(w, http.StatusOK, map[string]any{
		"registration":          activeReg,
		"matchingRegistrations": regs,
		"students":              students,
	})
}

// UpdateStudentVideo handles PATCH /api/v1/evolve/registrar/students/{id}/video.
// Allows a teacher/registrar (or admin) to save or update a student's Phase 2 social media video link.
func (h *EvolveHandler) UpdateStudentVideo(w http.ResponseWriter, r *http.Request) {
	studentID := strings.TrimSpace(r.PathValue("id"))
	if studentID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing student id"})
		return
	}
	if h.quizStore == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "student store unavailable"})
		return
	}

	var req struct {
		ReferenceID string `json:"referenceId"`
		VideoURL    string `json:"videoUrl"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	cleanURL := strings.TrimSpace(req.VideoURL)
	if cleanURL != "" {
		lower := strings.ToLower(cleanURL)
		if !strings.HasPrefix(lower, "http://") && !strings.HasPrefix(lower, "https://") {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "Video link must start with https:// or http:// (e.g. Instagram, TikTok, YouTube, Facebook, X, or Google Drive link)",
			})
			return
		}
	}

	updated, err := h.quizStore.UpdateStudentPhase2Video(r.Context(), studentID, req.ReferenceID, cleanURL)
	if errors.Is(err, quiz.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "student not found for this registration"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update student video link"})
		return
	}

	// Sync back into evolve_registrations JSONB arrays when applicable
	if updated.RegistrationRef != "" {
		h.syncStudentVideoToRegistration(r.Context(), updated.RegistrationRef, updated.FullName, cleanURL)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"message": "Phase 2 video link saved for " + updated.FullName,
		"data":    updated,
	})
}

// AddRegistrarStudent handles POST /api/v1/evolve/registrar/students.
// Allows a teacher/registrar to add a student to their registration and optionally attach their Phase 2 video link.
func (h *EvolveHandler) AddRegistrarStudent(w http.ResponseWriter, r *http.Request) {
	if h.quizStore == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "student store unavailable"})
		return
	}

	var req struct {
		ReferenceID string `json:"referenceId"`
		FullName    string `json:"fullName"`
		Level       string `json:"level"`
		ClassName   string `json:"className"`
		VideoURL    string `json:"videoUrl"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	ref := strings.ToUpper(strings.TrimSpace(req.ReferenceID))
	name := strings.TrimSpace(req.FullName)
	if ref == "" || name == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "referenceId and fullName are required"})
		return
	}

	cleanURL := strings.TrimSpace(req.VideoURL)
	if cleanURL != "" {
		lower := strings.ToLower(cleanURL)
		if !strings.HasPrefix(lower, "http://") && !strings.HasPrefix(lower, "https://") {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "Video link must start with https:// or http://",
			})
			return
		}
	}

	regs, err := h.findRegistrations(r.Context(), ref, "")
	if err != nil || len(regs) == 0 {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "registration not found for reference " + ref})
		return
	}
	reg := regs[0]

	lvl := normalizePupilLevel(req.Level)
	pin := randomDigitsStr(6)
	hashSum := sha256.Sum256([]byte(pin))
	pinHash := hex.EncodeToString(hashSum[:])

	var updatedAt *time.Time
	if cleanURL != "" {
		now := time.Now().UTC()
		updatedAt = &now
	}

	var createdStu *quiz.Student
	for attempt := 0; attempt < 5; attempt++ {
		examCode := makeExamCode(lvl)
		stu := quiz.Student{
			ID:                   fmt.Sprintf("stu_%d_%s", time.Now().UTC().UnixNano(), randomDigitsStr(3)),
			ExamCode:             examCode,
			PinCode:              pin,
			PinHash:              pinHash,
			FullName:             name,
			SchoolName:           reg.SchoolName,
			SchoolLocation:       reg.SchoolLocation,
			Level:                lvl,
			ClassName:            strings.TrimSpace(req.ClassName),
			RegistrationRef:      reg.ReferenceID,
			Phase2VideoURL:       cleanURL,
			Phase2VideoUpdatedAt: updatedAt,
			CreatedAt:            time.Now().UTC(),
		}
		res, err := h.quizStore.CreateStudent(r.Context(), stu)
		if err == nil {
			createdStu = res
			break
		}
		if !errors.Is(err, quiz.ErrConflict) {
			break
		}
	}

	if createdStu == nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to register student"})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Student added to school roster",
		"data":    createdStu,
	})
}

func (h *EvolveHandler) syncStudentVideoToRegistration(ctx context.Context, ref, studentName, videoURL string) {
	regs, err := h.findRegistrations(ctx, ref, "")
	if err != nil || len(regs) == 0 {
		return
	}
	reg := regs[0]
	changed := false
	for i := range reg.TestPupils {
		if strings.EqualFold(strings.TrimSpace(reg.TestPupils[i].Name), strings.TrimSpace(studentName)) {
			reg.TestPupils[i].VideoURL = videoURL
			changed = true
		}
	}
	for i := range reg.ProjectTeam {
		if strings.EqualFold(strings.TrimSpace(reg.ProjectTeam[i].Name), strings.TrimSpace(studentName)) {
			reg.ProjectTeam[i].VideoURL = videoURL
			changed = true
		}
	}
	if !changed {
		return
	}
	if h.pool != nil {
		pupilsJSON, _ := json.Marshal(reg.TestPupils)
		teamJSON, _ := json.Marshal(reg.ProjectTeam)
		_, _ = h.pool.Exec(ctx, `
			UPDATE evolve_registrations
			SET test_pupils = $2::jsonb, project_team = $3::jsonb
			WHERE reference_id = $1
		`, reg.ReferenceID, string(pupilsJSON), string(teamJSON))
		return
	}
	h.mu.Lock()
	for i := range h.registrations {
		if strings.EqualFold(h.registrations[i].ReferenceID, reg.ReferenceID) {
			h.registrations[i].TestPupils = reg.TestPupils
			h.registrations[i].ProjectTeam = reg.ProjectTeam
			break
		}
	}
	h.mu.Unlock()
}

func normalizePupilLevel(raw string) string {
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

func makeExamCode(level string) string {
	prefix := "JUN"
	switch level {
	case "intermediate":
		prefix = "INT"
	case "senior":
		prefix = "SEN"
	}
	return fmt.Sprintf("EV8-%s-%s", prefix, randomDigitsStr(4))
}

func randomDigitsStr(n int) string {
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
