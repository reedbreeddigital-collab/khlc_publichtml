package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// LeadActivity records an outreach or internal CRM event for a lead.
type LeadActivity struct {
	ID        string `json:"id"`
	Type      string `json:"type"` // Call | WhatsApp | Campus Visit | Proposal | Note
	Summary   string `json:"summary"`
	Author    string `json:"author"`
	Timestamp string `json:"timestamp"`
}

// CrmLead represents a school partnership, Evolve 8.0, parent, or CSR deal.
type CrmLead struct {
	ID                string         `json:"id"`
	Organization      string         `json:"organization"`
	ContactName       string         `json:"contactName"`
	ContactRole       string         `json:"contactRole"`
	Segment           string         `json:"segment"`
	Stage             string         `json:"stage"`    // new | contacted | proposal | negotiation | won | lost
	Priority          string         `json:"priority"` // High | Medium | Low
	Phone             string         `json:"phone"`
	Email             string         `json:"email"`
	Location          string         `json:"location"`
	ProgramInterest   string         `json:"programInterest"`
	StudentCount      int            `json:"studentCount,omitempty"`
	EstimatedValueNgn int            `json:"estimatedValueNgn"`
	AssignedTo        string         `json:"assignedTo"`
	NextFollowUp      string         `json:"nextFollowUp"`
	CreatedAt         string         `json:"createdAt"`
	Notes             string         `json:"notes"`
	Activities        []LeadActivity `json:"activities"`
}

// CrmHandler manages KHLC CRM pipeline leads.
type CrmHandler struct {
	mu    sync.RWMutex
	leads []CrmLead
}

// NewCrmHandler constructs a CrmHandler with thread-safe in-memory storage.
func NewCrmHandler() *CrmHandler {
	return &CrmHandler{
		leads: make([]CrmLead, 0),
	}
}

var validCrmStages = map[string]bool{
	"new":         true,
	"contacted":   true,
	"proposal":    true,
	"negotiation": true,
	"won":         true,
	"lost":        true,
}

// ListLeads handles GET /api/v1/crm/leads.
func (h *CrmHandler) ListLeads(w http.ResponseWriter, r *http.Request) {
	h.mu.RLock()
	out := make([]CrmLead, len(h.leads))
	copy(out, h.leads)
	h.mu.RUnlock()

	writeJSON(w, http.StatusOK, map[string]any{
		"count": len(out),
		"data":  out,
	})
}

// CreateLead handles POST /api/v1/crm/leads.
func (h *CrmHandler) CreateLead(w http.ResponseWriter, r *http.Request) {
	var req CrmLead
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid JSON request body",
		})
		return
	}

	req.Organization = strings.TrimSpace(req.Organization)
	req.ContactName = strings.TrimSpace(req.ContactName)
	req.Stage = strings.ToLower(strings.TrimSpace(req.Stage))
	if req.Stage == "" {
		req.Stage = "new"
	}

	if req.Organization == "" || req.ContactName == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "organization and contactName are required",
		})
		return
	}
	if !validCrmStages[req.Stage] {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid CRM stage",
		})
		return
	}

	h.mu.Lock()
	if strings.TrimSpace(req.ID) == "" {
		req.ID = fmt.Sprintf("lead_%d_%d", time.Now().Unix(), len(h.leads)+1)
	}
	if req.CreatedAt == "" {
		req.CreatedAt = time.Now().UTC().Format("2006-01-02")
	}
	if req.Priority == "" {
		req.Priority = "Medium"
	}
	if req.Activities == nil {
		req.Activities = make([]LeadActivity, 0)
	}
	h.leads = append([]CrmLead{req}, h.leads...)
	h.mu.Unlock()

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Lead created",
		"data":    req,
	})
}

// UpdateLead handles PATCH /api/v1/crm/leads/{id}.
func (h *CrmHandler) UpdateLead(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing lead id"})
		return
	}

	var patch struct {
		Stage             *string       `json:"stage"`
		Priority          *string       `json:"priority"`
		EstimatedValueNgn *int          `json:"estimatedValueNgn"`
		NextFollowUp      *string       `json:"nextFollowUp"`
		AssignedTo        *string       `json:"assignedTo"`
		Notes             *string       `json:"notes"`
		NewActivity       *LeadActivity `json:"newActivity"`
	}

	if err := json.NewDecoder(r.Body).Decode(&patch); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	for i := range h.leads {
		if h.leads[i].ID == id {
			if patch.Stage != nil {
				st := strings.ToLower(strings.TrimSpace(*patch.Stage))
				if !validCrmStages[st] {
					writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid CRM stage"})
					return
				}
				h.leads[i].Stage = st
			}
			if patch.Priority != nil {
				h.leads[i].Priority = strings.TrimSpace(*patch.Priority)
			}
			if patch.EstimatedValueNgn != nil {
				h.leads[i].EstimatedValueNgn = *patch.EstimatedValueNgn
			}
			if patch.NextFollowUp != nil {
				h.leads[i].NextFollowUp = strings.TrimSpace(*patch.NextFollowUp)
			}
			if patch.AssignedTo != nil {
				h.leads[i].AssignedTo = strings.TrimSpace(*patch.AssignedTo)
			}
			if patch.Notes != nil {
				h.leads[i].Notes = strings.TrimSpace(*patch.Notes)
			}
			if patch.NewActivity != nil {
				act := *patch.NewActivity
				if act.ID == "" {
					act.ID = fmt.Sprintf("act_%d", time.Now().UnixNano())
				}
				if act.Timestamp == "" {
					act.Timestamp = time.Now().UTC().Format("2006-01-02 15:04")
				}
				h.leads[i].Activities = append([]LeadActivity{act}, h.leads[i].Activities...)
			}

			writeJSON(w, http.StatusOK, map[string]any{
				"message": "Lead updated",
				"data":    h.leads[i],
			})
			return
		}
	}

	writeJSON(w, http.StatusNotFound, map[string]string{"error": "lead not found"})
}

// DeleteLead handles DELETE /api/v1/crm/leads/{id}.
func (h *CrmHandler) DeleteLead(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing lead id"})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	for i := range h.leads {
		if h.leads[i].ID == id {
			h.leads = append(h.leads[:i], h.leads[i+1:]...)
			writeJSON(w, http.StatusOK, map[string]string{"message": "Lead deleted"})
			return
		}
	}

	writeJSON(w, http.StatusNotFound, map[string]string{"error": "lead not found"})
}
