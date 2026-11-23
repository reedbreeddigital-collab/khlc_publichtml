package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealth(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	rec := httptest.NewRecorder()

	Health(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var body HealthResponse
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("failed to decode health response: %v", err)
	}
	if body.Status != "ok" {
		t.Fatalf("expected status ok, got %q", body.Status)
	}
}

func TestCreateAndListEnquiries(t *testing.T) {
	h := NewEnquiryHandler()

	payload := []byte(`{
		"pathway": "schools",
		"fullName": "Mrs. Adeola Ogunleye",
		"phone": "09139386220",
		"email": "principal@school.edu.ng",
		"orgDetail": "Gracefield Academy, Amuwo Odofin",
		"focus": "Full School Technology Program",
		"message": "Requesting termly proposal"
	}`)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/enquiries", bytes.NewReader(payload))
	rec := httptest.NewRecorder()
	h.CreateEnquiry(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d: %s", rec.Code, rec.Body.String())
	}

	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/enquiries", nil)
	listRec := httptest.NewRecorder()
	h.ListEnquiries(listRec, listReq)

	if listRec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", listRec.Code)
	}
}

func TestSubscribeNewsletterValidation(t *testing.T) {
	h := NewEnquiryHandler()

	badReq := httptest.NewRequest(http.MethodPost, "/api/v1/newsletter", bytes.NewReader([]byte(`{"email":"invalid"}`)))
	badRec := httptest.NewRecorder()
	h.SubscribeNewsletter(badRec, badReq)

	if badRec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for invalid email, got %d", badRec.Code)
	}

	goodReq := httptest.NewRequest(http.MethodPost, "/api/v1/newsletter", bytes.NewReader([]byte(`{"email":"info@kinghouselearning.com"}`)))
	goodRec := httptest.NewRecorder()
	h.SubscribeNewsletter(goodRec, goodReq)

	if goodRec.Code != http.StatusCreated {
		t.Fatalf("expected status 201 for valid email, got %d", goodRec.Code)
	}
}
