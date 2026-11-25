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

// Enquiry represents a partnership, parent/learner, CSR partner, or instructor submission.
type Enquiry struct {
	ID        string    `json:"id"`
	Pathway   string    `json:"pathway"` // schools | parents | partners | instructors
	FullName  string    `json:"fullName"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	OrgDetail string    `json:"orgDetail"`
	Focus     string    `json:"focus"`
	Message   string    `json:"message,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

// NewsletterSubscriber represents a newsletter subscription entry.
type NewsletterSubscriber struct {
	Email        string    `json:"email"`
	SubscribedAt time.Time `json:"subscribedAt"`
}

// EnquiryHandler manages KHLC partnership enquiries and newsletter signups.
type EnquiryHandler struct {
	pool        *pgxpool.Pool
	mu          sync.RWMutex
	enquiries   []Enquiry
	subscribers []NewsletterSubscriber
}

// NewEnquiryHandler constructs a new EnquiryHandler backed by Postgres (when pool != nil) or in-memory storage.
func NewEnquiryHandler(pool ...*pgxpool.Pool) *EnquiryHandler {
	var p *pgxpool.Pool
	if len(pool) > 0 {
		p = pool[0]
	}
	return &EnquiryHandler{
		pool:        p,
		enquiries:   make([]Enquiry, 0),
		subscribers: make([]NewsletterSubscriber, 0),
	}
}

var validPathways = map[string]bool{
	"schools":     true,
	"parents":     true,
	"partners":    true,
	"instructors": true,
}

// CreateEnquiry handles POST /api/v1/enquiries.
func (h *EnquiryHandler) CreateEnquiry(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Pathway   string `json:"pathway"`
		FullName  string `json:"fullName"`
		Phone     string `json:"phone"`
		Email     string `json:"email"`
		OrgDetail string `json:"orgDetail"`
		Focus     string `json:"focus"`
		Message   string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid JSON request body",
		})
		return
	}

	req.Pathway = strings.ToLower(strings.TrimSpace(req.Pathway))
	req.FullName = strings.TrimSpace(req.FullName)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Email = strings.TrimSpace(req.Email)
	req.OrgDetail = strings.TrimSpace(req.OrgDetail)
	req.Focus = strings.TrimSpace(req.Focus)
	req.Message = strings.TrimSpace(req.Message)

	if !validPathways[req.Pathway] {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "pathway must be one of: schools, parents, partners, instructors",
		})
		return
	}
	if req.FullName == "" || req.Email == "" || req.Phone == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "fullName, email, and phone are required",
		})
		return
	}

	entry := Enquiry{
		ID:        fmt.Sprintf("enq_%d", time.Now().UTC().UnixNano()),
		Pathway:   req.Pathway,
		FullName:  req.FullName,
		Phone:     req.Phone,
		Email:     req.Email,
		OrgDetail: req.OrgDetail,
		Focus:     req.Focus,
		Message:   req.Message,
		CreatedAt: time.Now().UTC(),
	}

	if h.pool != nil {
		_, err := h.pool.Exec(r.Context(), `
			INSERT INTO enquiries (id, pathway, full_name, phone, email, org_detail, focus, message, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, entry.ID, entry.Pathway, entry.FullName, entry.Phone, entry.Email, entry.OrgDetail, entry.Focus, entry.Message, entry.CreatedAt)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to store enquiry"})
			return
		}
	} else {
		h.mu.Lock()
		h.enquiries = append([]Enquiry{entry}, h.enquiries...)
		h.mu.Unlock()
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Enquiry received successfully",
		"data":    entry,
	})
}

// ListEnquiries handles GET /api/v1/enquiries.
func (h *EnquiryHandler) ListEnquiries(w http.ResponseWriter, r *http.Request) {
	if h.pool != nil {
		rows, err := h.pool.Query(r.Context(), `
			SELECT id, pathway, full_name, phone, email, org_detail, focus, message, created_at
			FROM enquiries
			ORDER BY created_at DESC
			LIMIT 200
		`)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load enquiries"})
			return
		}
		defer rows.Close()

		result := make([]Enquiry, 0)
		for rows.Next() {
			var e Enquiry
			if err := rows.Scan(&e.ID, &e.Pathway, &e.FullName, &e.Phone, &e.Email, &e.OrgDetail, &e.Focus, &e.Message, &e.CreatedAt); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to decode enquiry"})
				return
			}
			result = append(result, e)
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"count": len(result),
			"data":  result,
		})
		return
	}

	h.mu.RLock()
	result := make([]Enquiry, len(h.enquiries))
	copy(result, h.enquiries)
	h.mu.RUnlock()

	writeJSON(w, http.StatusOK, map[string]any{
		"count": len(result),
		"data":  result,
	})
}

// SubscribeNewsletter handles POST /api/v1/newsletter.
func (h *EnquiryHandler) SubscribeNewsletter(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid JSON request body",
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" || !strings.Contains(email, "@") {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "a valid email address is required",
		})
		return
	}

	sub := NewsletterSubscriber{
		Email:        email,
		SubscribedAt: time.Now().UTC(),
	}

	if h.pool != nil {
		_, err := h.pool.Exec(r.Context(), `
			INSERT INTO newsletter_subscribers (email, subscribed_at)
			VALUES ($1, $2)
			ON CONFLICT (email) DO UPDATE SET subscribed_at = EXCLUDED.subscribed_at
		`, sub.Email, sub.SubscribedAt)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save subscription"})
			return
		}
	} else {
		h.mu.Lock()
		h.subscribers = append(h.subscribers, sub)
		h.mu.Unlock()
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Subscribed successfully",
		"data":    sub,
	})
}

// ListSubscribers handles GET /api/v1/admin/newsletter.
func (h *EnquiryHandler) ListSubscribers(w http.ResponseWriter, r *http.Request) {
	if h.pool != nil {
		rows, err := h.pool.Query(r.Context(), `
			SELECT email, subscribed_at
			FROM newsletter_subscribers
			ORDER BY subscribed_at DESC
			LIMIT 500
		`)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load newsletter subscribers"})
			return
		}
		defer rows.Close()

		out := make([]NewsletterSubscriber, 0)
		for rows.Next() {
			var sub NewsletterSubscriber
			if err := rows.Scan(&sub.Email, &sub.SubscribedAt); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to decode subscriber"})
				return
			}
			out = append(out, sub)
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"count": len(out),
			"data":  out,
		})
		return
	}

	h.mu.RLock()
	out := make([]NewsletterSubscriber, len(h.subscribers))
	copy(out, h.subscribers)
	h.mu.RUnlock()

	writeJSON(w, http.StatusOK, map[string]any{
		"count": len(out),
		"data":  out,
	})
}
