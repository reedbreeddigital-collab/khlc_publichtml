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

	"github.com/jackc/pgx/v5/pgxpool"

	"khlc-backend/internal/mailer"
	"khlc-backend/internal/quiz"
)

// EvolvePupil represents a pupil registered for the Phase 1 National Online Test.
type EvolvePupil struct {
	Name      string `json:"name"`
	Level     string `json:"level"`
	ClassName string `json:"className"`
}

// EvolveTeamMember represents a pupil on a school's 5-member Project Track team.
type EvolveTeamMember struct {
	Name      string `json:"name"`
	ClassName string `json:"className"`
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
