package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
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

// EvolveHandler manages Evolve 8.0 registrations.
type EvolveHandler struct {
	pool          *pgxpool.Pool
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
		req.ReferenceID = fmt.Sprintf("EV8-%06d", now.UnixNano()%1000000)
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

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Evolve 8.0 registration recorded successfully",
		"data":    req,
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
