package quiz

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"khlc-backend/internal/middleware"
)

func TestQuizEngineEndToEndFlow(t *testing.T) {
	store := NewMemoryStore()
	secret := "test-secret"
	h := NewHandler(store, "admin@kingshouselearning.com", "secret123", secret)

	// 1. Admin Login
	loginBody := []byte(`{"email":"admin@kingshouselearning.com","password":"secret123"}`)
	loginReq := httptest.NewRequest(http.MethodPost, "/api/v1/admin/login", bytes.NewReader(loginBody))
	loginRec := httptest.NewRecorder()
	h.AdminLogin(loginRec, loginReq)
	if loginRec.Code != http.StatusOK {
		t.Fatalf("expected 200 admin login, got %d: %s", loginRec.Code, loginRec.Body.String())
	}
	var loginResp struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(loginRec.Body).Decode(&loginResp); err != nil || loginResp.Token == "" {
		t.Fatalf("expected valid admin token")
	}

	// Verify unauthorized admin call fails via RequireAdmin
	guarded := middleware.RequireAdmin(secret, h.ListQuizzes)
	unauthRec := httptest.NewRecorder()
	guarded(unauthRec, httptest.NewRequest(http.MethodGet, "/api/v1/admin/quizzes", nil))
	if unauthRec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 without admin token, got %d", unauthRec.Code)
	}

	// 2. Create a live Junior quiz
	starts := time.Now().UTC().Add(-10 * time.Minute).Format(time.RFC3339)
	ends := time.Now().UTC().Add(2 * time.Hour).Format(time.RFC3339)
	quizPayload, _ := json.Marshal(map[string]any{
		"title":           "Evolve 8.0 Junior Test",
		"level":           "junior",
		"durationMinutes": 30,
		"startsAt":        starts,
		"endsAt":          ends,
		"maxScore":        1000,
		"passMark":        700,
		"status":          "live",
	})
	qReq := httptest.NewRequest(http.MethodPost, "/api/v1/admin/quizzes", bytes.NewReader(quizPayload))
	qRec := httptest.NewRecorder()
	h.CreateQuiz(qRec, qReq)
	if qRec.Code != http.StatusCreated {
		t.Fatalf("expected 201 create quiz, got %d: %s", qRec.Code, qRec.Body.String())
	}
	var createdQuiz struct {
		Data Quiz `json:"data"`
	}
	_ = json.NewDecoder(qRec.Body).Decode(&createdQuiz)

	// 3. Bulk CSV import questions (2 shared + 2 junior = 4 questions -> 250 pts each normalized out of 1000)
	csvText := strings.Join([]string{
		"level_scope,topic,prompt,option_a,option_b,option_c,option_d,correct_option,points",
		"shared,Digital Literacy,What is CPU?,Central Processing Unit,Core Power Utility,Code Print Unit,Control Panel Unit,A,10",
		"shared,Coding,What is an algorithm?,A screen,Step-by-step instructions,A cable,A battery,B,10",
		"junior,Robotics,What detects distance?,Sensor,Speaker,Wheel,Button,A,10",
		"junior,Logic,2 + 2 * 3 = ?,12,8,10,6,B,10",
	}, "\n")
	impPayload, _ := json.Marshal(map[string]any{"csv": csvText})
	impReq := httptest.NewRequest(http.MethodPost, "/api/v1/admin/questions/import", bytes.NewReader(impPayload))
	impRec := httptest.NewRecorder()
	h.ImportQuestions(impRec, impReq)
	if impRec.Code != http.StatusCreated {
		t.Fatalf("expected 201 csv import, got %d: %s", impRec.Code, impRec.Body.String())
	}

	// 4. Register 2 Junior students to test scoring + faster-time tie-breaker
	createStu := func(code, pin, name, school string) Student {
		body, _ := json.Marshal(map[string]any{
			"examCode":   code,
			"pinCode":    pin,
			"fullName":   name,
			"schoolName": school,
			"level":      "junior",
			"className":  "Primary 6",
		})
		req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/students", bytes.NewReader(body))
		rec := httptest.NewRecorder()
		h.CreateStudent(rec, req)
		if rec.Code != http.StatusCreated {
			t.Fatalf("expected 201 create student, got %d: %s", rec.Code, rec.Body.String())
		}
		var out struct {
			Data Student `json:"data"`
		}
		_ = json.NewDecoder(rec.Body).Decode(&out)
		return out.Data
	}

	sFast := createStu("EV8-JUN-9001", "111222", "Adaeze Fast", "Gracefield Academy")
	sSlow := createStu("EV8-JUN-9002", "333444", "Bola Slow", "Kingsway Schools")

	// Helper to run student login -> start -> answer -> submit
	runStudentSitting := func(stu Student, pin string, wrongCount int, elapsedOverride int) QuizAttempt {
		lBody, _ := json.Marshal(map[string]string{"examCode": stu.ExamCode, "pin": pin})
		lRec := httptest.NewRecorder()
		h.StudentLogin(lRec, httptest.NewRequest(http.MethodPost, "/api/v1/quiz/login", bytes.NewReader(lBody)))
		if lRec.Code != http.StatusOK {
			t.Fatalf("student login failed: %d %s", lRec.Code, lRec.Body.String())
		}
		var lResp struct {
			Token string `json:"token"`
		}
		_ = json.NewDecoder(lRec.Body).Decode(&lResp)

		sReq := httptest.NewRequest(http.MethodPost, "/api/v1/quiz/sessions/start", bytes.NewReader([]byte(`{}`)))
		sReq.Header.Set("Authorization", "Bearer "+lResp.Token)
		sRec := httptest.NewRecorder()
		h.StartSession(sRec, sReq)
		if sRec.Code != http.StatusCreated {
			t.Fatalf("start session failed: %d %s", sRec.Code, sRec.Body.String())
		}
		// Security assertion: correctOption MUST NEVER appear in student session payload
		if strings.Contains(sRec.Body.String(), "correctOption") {
			t.Fatalf("SECURITY FAILURE: correctOption leaked in student session response")
		}

		var sResp struct {
			Attempt   QuizAttempt           `json:"attempt"`
			Questions []StudentQuestionView `json:"questions"`
		}
		_ = json.NewDecoder(sRec.Body).Decode(&sResp)
		if len(sResp.Questions) != 4 {
			t.Fatalf("expected 4 questions, got %d", len(sResp.Questions))
		}

		// Answer questions via auto-save endpoint
		allQuestions, _ := store.GetQuestionsForQuiz(t.Context(), createdQuiz.Data.ID, "junior")
		answerKey := map[string]string{}
		for _, q := range allQuestions {
			answerKey[q.ID] = q.CorrectOption
		}

		wrongLeft := wrongCount
		for _, q := range sResp.Questions {
			choice := answerKey[q.ID]
			if wrongLeft > 0 {
				if choice == "A" {
					choice = "D"
				} else {
					choice = "A"
				}
				wrongLeft--
			}
			aBody, _ := json.Marshal(map[string]any{
				"questionId":     q.ID,
				"selectedOption": choice,
			})
			aReq := httptest.NewRequest(http.MethodPatch, "/api/v1/quiz/sessions/"+sResp.Attempt.ID+"/answer", bytes.NewReader(aBody))
			aReq.SetPathValue("id", sResp.Attempt.ID)
			aReq.Header.Set("Authorization", "Bearer "+lResp.Token)
			aRec := httptest.NewRecorder()
			h.SaveAnswer(aRec, aReq)
			if aRec.Code != http.StatusOK {
				t.Fatalf("save answer failed: %d %s", aRec.Code, aRec.Body.String())
			}
		}

		// Adjust startedAt slightly to test deterministic completion-time tie-breaker
		att, _ := store.GetAttempt(t.Context(), sResp.Attempt.ID)
		att.StartedAt = time.Now().UTC().Add(-time.Duration(elapsedOverride) * time.Second)
		_, _ = store.UpdateAttempt(t.Context(), *att)

		subReq := httptest.NewRequest(http.MethodPost, "/api/v1/quiz/sessions/"+sResp.Attempt.ID+"/submit", bytes.NewReader([]byte(`{}`)))
		subReq.SetPathValue("id", sResp.Attempt.ID)
		subReq.Header.Set("Authorization", "Bearer "+lResp.Token)
		subRec := httptest.NewRecorder()
		h.SubmitSession(subRec, subReq)
		if subRec.Code != http.StatusOK {
			t.Fatalf("submit failed: %d %s", subRec.Code, subRec.Body.String())
		}
		var subResp struct {
			Attempt QuizAttempt `json:"attempt"`
		}
		_ = json.NewDecoder(subRec.Body).Decode(&subResp)
		return subResp.Attempt
	}

	attSlow := runStudentSitting(sSlow, "333444", 1, 600) // 3/4 = 750/1000 in 600s
	attFast := runStudentSitting(sFast, "111222", 1, 240) // 3/4 = 750/1000 in 240s

	if attFast.ScoreOutOf1000 != 750 || !attFast.Passed {
		t.Fatalf("expected 750/1000 passed, got %d (passed=%v)", attFast.ScoreOutOf1000, attFast.Passed)
	}
	if attSlow.ScoreOutOf1000 != 750 || !attSlow.Passed {
		t.Fatalf("expected 750/1000 passed, got %d (passed=%v)", attSlow.ScoreOutOf1000, attSlow.Passed)
	}

	// 5. Before publishing, public results should show resultsPublished=false and empty leaderboard
	preRec := httptest.NewRecorder()
	h.PublicResults(preRec, httptest.NewRequest(http.MethodGet, "/api/v1/evolve/results?level=junior", nil))
	var preRes ResultsResponse
	_ = json.NewDecoder(preRec.Body).Decode(&preRes)
	if len(preRes.Levels) != 1 || preRes.Levels[0].ResultsPublished || len(preRes.Levels[0].Leaderboard) != 0 {
		t.Fatalf("expected unpublished empty results before toggle, got %+v", preRes)
	}

	// 6. Publish Official Results
	pubBody := []byte(`{"resultsPublished":true}`)
	pubReq := httptest.NewRequest(http.MethodPatch, "/api/v1/admin/quizzes/"+createdQuiz.Data.ID, bytes.NewReader(pubBody))
	pubReq.SetPathValue("id", createdQuiz.Data.ID)
	pubRec := httptest.NewRecorder()
	h.UpdateQuiz(pubRec, pubReq)
	if pubRec.Code != http.StatusOK {
		t.Fatalf("publish toggle failed: %d %s", pubRec.Code, pubRec.Body.String())
	}

	// 7. Verify Tie-Breaker Ranking: Adaeze Fast (240s) MUST rank #1 ahead of Bola Slow (600s)
	postRec := httptest.NewRecorder()
	h.PublicResults(postRec, httptest.NewRequest(http.MethodGet, "/api/v1/evolve/results?level=junior", nil))
	var postRes ResultsResponse
	_ = json.NewDecoder(postRec.Body).Decode(&postRes)
	if !postRes.Levels[0].ResultsPublished || len(postRes.Levels[0].Leaderboard) != 2 {
		t.Fatalf("expected 2 published passing entries, got %+v", postRes.Levels[0])
	}
	if postRes.Levels[0].Leaderboard[0].ExamCode != "EV8-JUN-9001" || postRes.Levels[0].Leaderboard[0].Rank != 1 {
		t.Fatalf("expected faster student EV8-JUN-9001 to win tie-breaker at rank #1, got %+v", postRes.Levels[0].Leaderboard[0])
	}

	// 8. Reset Attempt
	resetReq := httptest.NewRequest(http.MethodPost, "/api/v1/admin/attempts/"+attSlow.ID+"/reset", nil)
	resetReq.SetPathValue("id", attSlow.ID)
	resetRec := httptest.NewRecorder()
	h.ResetAttempt(resetRec, resetReq)
	if resetRec.Code != http.StatusOK {
		t.Fatalf("expected 200 reset attempt, got %d", resetRec.Code)
	}
}
