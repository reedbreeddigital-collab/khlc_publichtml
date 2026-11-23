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

	goodReq := httptest.NewRequest(http.MethodPost, "/api/v1/newsletter", bytes.NewReader([]byte(`{"email":"info@kingshouselearning.com"}`)))
	goodRec := httptest.NewRecorder()
	h.SubscribeNewsletter(goodRec, goodReq)

	if goodRec.Code != http.StatusCreated {
		t.Fatalf("expected status 201 for valid email, got %d", goodRec.Code)
	}
}

func TestEvolveRegistration(t *testing.T) {
	h := NewEvolveHandler()

	payload := []byte(`{
		"track": "both",
		"schoolName": "Kingsway Model Schools",
		"schoolLocation": "Lagos",
		"schoolAddress": "Amuwo Odofin",
		"schoolType": "Primary & Secondary",
		"coordinatorName": "Mr. David Okeke",
		"coordinatorRole": "Assigned KHLC Instructor",
		"phone": "09139386220",
		"email": "info@kingshouselearning.com",
		"projectCategory": "Secondary",
		"projectPath": "Robotics",
		"projectTheme": "Theme 1: Education (SDG 4)",
		"ndpaConsent": true
	}`)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/evolve/registrations", bytes.NewReader(payload))
	rec := httptest.NewRecorder()
	h.CreateRegistration(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d: %s", rec.Code, rec.Body.String())
	}

	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/evolve/registrations", nil)
	listRec := httptest.NewRecorder()
	h.ListRegistrations(listRec, listReq)

	if listRec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", listRec.Code)
	}
}

func TestCrmLeadCRUD(t *testing.T) {
	h := NewCrmHandler()

	createBody := []byte(`{
		"id": "lead_test_1",
		"organization": "Gracefield Royal Academy",
		"contactName": "Mrs. Adeola Ogunleye",
		"segment": "School Partnership",
		"stage": "new",
		"estimatedValueNgn": 1850000
	}`)
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/crm/leads", bytes.NewReader(createBody))
	createRec := httptest.NewRecorder()
	h.CreateLead(createRec, createReq)
	if createRec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", createRec.Code, createRec.Body.String())
	}

	patchBody := []byte(`{"stage":"proposal","newActivity":{"type":"Proposal","summary":"Sent PDF quote","author":"Admin"}}`)
	patchReq := httptest.NewRequest(http.MethodPatch, "/api/v1/crm/leads/lead_test_1", bytes.NewReader(patchBody))
	patchReq.SetPathValue("id", "lead_test_1")
	patchRec := httptest.NewRecorder()
	h.UpdateLead(patchRec, patchReq)
	if patchRec.Code != http.StatusOK {
		t.Fatalf("expected 200 on patch, got %d: %s", patchRec.Code, patchRec.Body.String())
	}

	delReq := httptest.NewRequest(http.MethodDelete, "/api/v1/crm/leads/lead_test_1", nil)
	delReq.SetPathValue("id", "lead_test_1")
	delRec := httptest.NewRecorder()
	h.DeleteLead(delRec, delReq)
	if delRec.Code != http.StatusOK {
		t.Fatalf("expected 200 on delete, got %d", delRec.Code)
	}
}
