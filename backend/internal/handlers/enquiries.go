package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
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
	mu          sync.RWMutex
	enquiries   []Enquiry
	subscribers []NewsletterSubscriber
}

// NewEnquiryHandler constructs a new EnquiryHandler with thread-safe in-memory storage.
func NewEnquiryHandler() *EnquiryHandler {
	return &EnquiryHandler{
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

	h.mu.Lock()
	entry := Enquiry{
		ID:        fmt.Sprintf("enq_%d_%d", time.Now().Unix(), len(h.enquiries)+1),
		Pathway:   req.Pathway,
		FullName:  req.FullName,
		Phone:     req.Phone,
		Email:     req.Email,
		OrgDetail: req.OrgDetail,
		Focus:     req.Focus,
		Message:   req.Message,
		CreatedAt: time.Now().UTC(),
	}
	h.enquiries = append(h.enquiries, entry)
	h.mu.Unlock()

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Enquiry received successfully",
		"data":    entry,
	})
}

// ListEnquiries handles GET /api/v1/enquiries.
func (h *EnquiryHandler) ListEnquiries(w http.ResponseWriter, r *http.Request) {
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

	h.mu.Lock()
	h.subscribers = append(h.subscribers, sub)
	h.mu.Unlock()

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Subscribed successfully",
		"data":    sub,
	})
}
