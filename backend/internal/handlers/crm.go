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
	pool  *pgxpool.Pool
	mu    sync.RWMutex
	leads []CrmLead
}

// NewCrmHandler constructs a CrmHandler backed by Postgres (when pool != nil) or in-memory storage.
func NewCrmHandler(pool ...*pgxpool.Pool) *CrmHandler {
	var p *pgxpool.Pool
	if len(pool) > 0 {
		p = pool[0]
	}
	return &CrmHandler{
		pool:  p,
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
	if h.pool != nil {
		rows, err := h.pool.Query(r.Context(), `
			SELECT id, organization, contact_name, contact_role, segment, stage, priority,
			       phone, email, location, program_interest, student_count, estimated_value_ngn,
			       assigned_to, next_follow_up, created_at, notes, activities
			FROM crm_leads
			ORDER BY updated_at DESC
			LIMIT 200
		`)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load CRM leads"})
			return
		}
		defer rows.Close()

		out := make([]CrmLead, 0)
		for rows.Next() {
			var lead CrmLead
			var actRaw []byte
			if err := rows.Scan(
				&lead.ID, &lead.Organization, &lead.ContactName, &lead.ContactRole, &lead.Segment,
				&lead.Stage, &lead.Priority, &lead.Phone, &lead.Email, &lead.Location,
				&lead.ProgramInterest, &lead.StudentCount, &lead.EstimatedValueNgn,
				&lead.AssignedTo, &lead.NextFollowUp, &lead.CreatedAt, &lead.Notes, &actRaw,
			); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to decode CRM lead"})
				return
			}
			_ = json.Unmarshal(actRaw, &lead.Activities)
			if lead.Activities == nil {
				lead.Activities = make([]LeadActivity, 0)
			}
			out = append(out, lead)
		}

		writeJSON(w, http.StatusOK, map[string]any{
			"count": len(out),
			"data":  out,
		})
		return
	}

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

	if strings.TrimSpace(req.ID) == "" {
		req.ID = fmt.Sprintf("lead_%d", time.Now().UTC().UnixNano())
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

	if h.pool != nil {
		actJSON, _ := json.Marshal(req.Activities)
		_, err := h.pool.Exec(r.Context(), `
			INSERT INTO crm_leads (
				id, organization, contact_name, contact_role, segment, stage, priority,
				phone, email, location, program_interest, student_count, estimated_value_ngn,
				assigned_to, next_follow_up, created_at, notes, activities, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7,
				$8, $9, $10, $11, $12, $13,
				$14, $15, $16, $17, $18::jsonb, NOW()
			)
		`,
			req.ID, req.Organization, req.ContactName, req.ContactRole, req.Segment, req.Stage, req.Priority,
			req.Phone, req.Email, req.Location, req.ProgramInterest, req.StudentCount, req.EstimatedValueNgn,
			req.AssignedTo, req.NextFollowUp, req.CreatedAt, req.Notes, string(actJSON),
		)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create CRM lead"})
			return
		}
	} else {
		h.mu.Lock()
		h.leads = append([]CrmLead{req}, h.leads...)
		h.mu.Unlock()
	}

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

	if patch.Stage != nil {
		st := strings.ToLower(strings.TrimSpace(*patch.Stage))
		if !validCrmStages[st] {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid CRM stage"})
			return
		}
		*patch.Stage = st
	}

	if h.pool != nil {
		var lead CrmLead
		var actRaw []byte
		err := h.pool.QueryRow(r.Context(), `
			SELECT id, organization, contact_name, contact_role, segment, stage, priority,
			       phone, email, location, program_interest, student_count, estimated_value_ngn,
			       assigned_to, next_follow_up, created_at, notes, activities
			FROM crm_leads WHERE id = $1
		`, id).Scan(
			&lead.ID, &lead.Organization, &lead.ContactName, &lead.ContactRole, &lead.Segment,
			&lead.Stage, &lead.Priority, &lead.Phone, &lead.Email, &lead.Location,
			&lead.ProgramInterest, &lead.StudentCount, &lead.EstimatedValueNgn,
			&lead.AssignedTo, &lead.NextFollowUp, &lead.CreatedAt, &lead.Notes, &actRaw,
		)
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "lead not found"})
			return
		}
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load lead"})
			return
		}
		_ = json.Unmarshal(actRaw, &lead.Activities)
		if lead.Activities == nil {
			lead.Activities = make([]LeadActivity, 0)
		}

		if patch.Stage != nil {
			lead.Stage = *patch.Stage
		}
		if patch.Priority != nil {
			lead.Priority = strings.TrimSpace(*patch.Priority)
		}
		if patch.EstimatedValueNgn != nil {
			lead.EstimatedValueNgn = *patch.EstimatedValueNgn
		}
		if patch.NextFollowUp != nil {
			lead.NextFollowUp = strings.TrimSpace(*patch.NextFollowUp)
		}
		if patch.AssignedTo != nil {
			lead.AssignedTo = strings.TrimSpace(*patch.AssignedTo)
		}
		if patch.Notes != nil {
			lead.Notes = strings.TrimSpace(*patch.Notes)
		}
		if patch.NewActivity != nil {
			act := *patch.NewActivity
			if act.ID == "" {
				act.ID = fmt.Sprintf("act_%d", time.Now().UnixNano())
			}
			if act.Timestamp == "" {
				act.Timestamp = time.Now().UTC().Format("2006-01-02 15:04")
			}
			lead.Activities = append([]LeadActivity{act}, lead.Activities...)
		}

		actJSON, _ := json.Marshal(lead.Activities)
		_, err = h.pool.Exec(r.Context(), `
			UPDATE crm_leads
			SET stage = $2, priority = $3, estimated_value_ngn = $4, next_follow_up = $5,
			    assigned_to = $6, notes = $7, activities = $8::jsonb, updated_at = NOW()
			WHERE id = $1
		`, lead.ID, lead.Stage, lead.Priority, lead.EstimatedValueNgn, lead.NextFollowUp, lead.AssignedTo, lead.Notes, string(actJSON))
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update lead"})
			return
		}

		writeJSON(w, http.StatusOK, map[string]any{
			"message": "Lead updated",
			"data":    lead,
		})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	for i := range h.leads {
		if h.leads[i].ID == id {
			if patch.Stage != nil {
				h.leads[i].Stage = *patch.Stage
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

	if h.pool != nil {
		tag, err := h.pool.Exec(r.Context(), `DELETE FROM crm_leads WHERE id = $1`, id)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete lead"})
			return
		}
		if tag.RowsAffected() == 0 {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "lead not found"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": "Lead deleted"})
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
