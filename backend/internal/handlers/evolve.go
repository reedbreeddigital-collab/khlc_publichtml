package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
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
	mu            sync.RWMutex
	registrations []EvolveRegistration
}

// NewEvolveHandler constructs a new EvolveHandler.
func NewEvolveHandler() *EvolveHandler {
	return &EvolveHandler{
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

	h.mu.Lock()
	idx := len(h.registrations) + 1
	req.ID = fmt.Sprintf("ev8_%d_%d", time.Now().Unix(), idx)
	if strings.TrimSpace(req.ReferenceID) == "" {
		req.ReferenceID = fmt.Sprintf("EV8-%04d", idx)
	}
	req.CreatedAt = time.Now().UTC()
	h.registrations = append(h.registrations, req)
	h.mu.Unlock()

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Evolve 8.0 registration recorded successfully",
		"data":    req,
	})
}

// ListRegistrations handles GET /api/v1/evolve/registrations.
func (h *EvolveHandler) ListRegistrations(w http.ResponseWriter, r *http.Request) {
	h.mu.RLock()
	out := make([]EvolveRegistration, len(h.registrations))
	copy(out, h.registrations)
	h.mu.RUnlock()

	writeJSON(w, http.StatusOK, map[string]any{
		"count": len(out),
		"data":  out,
	})
}
