package quiz

import "time"

// Quiz represents a scheduled Evolve competition quiz for a specific level.
type Quiz struct {
	ID               string    `json:"id"`
	Title            string    `json:"title"`
	Edition          string    `json:"edition"`
	Level            string    `json:"level"` // junior | intermediate | senior
	Topics           []string  `json:"topics"` // empty = all topics
	QuestionLimit    int       `json:"questionLimit"` // 0 = all matching questions
	DurationMinutes  int       `json:"durationMinutes"`
	StartsAt         time.Time `json:"startsAt"`
	EndsAt           time.Time `json:"endsAt"`
	MaxScore         int       `json:"maxScore"`
	PassMark         int       `json:"passMark"`
	ShuffleQuestions bool      `json:"shuffleQuestions"`
	ShuffleOptions   bool      `json:"shuffleOptions"`
	Status           string    `json:"status"` // draft | scheduled | live | closed
	ResultsPublished bool      `json:"resultsPublished"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// QuizWithStats extends Quiz with admin dashboard aggregate counts.
type QuizWithStats struct {
	Quiz
	QuestionCount  int `json:"questionCount"`
	AttemptCount   int `json:"attemptCount"`
	SubmittedCount int `json:"submittedCount"`
	PassedCount    int `json:"passedCount"`
}

// Question represents an MCQ stored in the Question Bank.
type Question struct {
	ID            string    `json:"id"`
	QuizID        string    `json:"quizId,omitempty"`
	LevelScope    string    `json:"levelScope"` // shared | junior | intermediate | senior
	Topic         string    `json:"topic"`
	Prompt        string    `json:"prompt"`
	OptionA       string    `json:"optionA"`
	OptionB       string    `json:"optionB"`
	OptionC       string    `json:"optionC"`
	OptionD       string    `json:"optionD"`
	CorrectOption string    `json:"correctOption"` // A | B | C | D
	Points        int       `json:"points"`
	Active        bool      `json:"active"`
	CreatedAt     time.Time `json:"createdAt"`
}

// StudentQuestionView is sent to students during a live sitting — never includes CorrectOption.
type StudentQuestionView struct {
	ID      string `json:"id"`
	Topic   string `json:"topic"`
	Prompt  string `json:"prompt"`
	OptionA string `json:"optionA"`
	OptionB string `json:"optionB"`
	OptionC string `json:"optionC"`
	OptionD string `json:"optionD"`
	Points  int    `json:"points"`
}

// Student represents a registered Evolve pupil with exam credentials and optional Phase 2 video link.
type Student struct {
	ID                   string     `json:"id"`
	ExamCode             string     `json:"examCode"`
	PinCode              string     `json:"pinCode,omitempty"` // returned only to authenticated admins/registrars for printable slips
	PinHash              string     `json:"-"`
	FullName             string     `json:"fullName"`
	SchoolName           string     `json:"schoolName"`
	SchoolLocation       string     `json:"schoolLocation"`
	Level                string     `json:"level"` // junior | intermediate | senior
	ClassName            string     `json:"className"`
	RegistrationRef      string     `json:"registrationRef,omitempty"`
	Phase2VideoURL       string     `json:"phase2VideoUrl,omitempty"`
	Phase2VideoUpdatedAt *time.Time `json:"phase2VideoUpdatedAt,omitempty"`
	CreatedAt            time.Time  `json:"createdAt"`
}

// StudentPublicProfile omits credentials for student-facing responses.
type StudentPublicProfile struct {
	ID             string `json:"id"`
	ExamCode       string `json:"examCode"`
	FullName       string `json:"fullName"`
	SchoolName     string `json:"schoolName"`
	SchoolLocation string `json:"schoolLocation"`
	Level          string `json:"level"`
	ClassName      string `json:"className"`
}

// QuizAttempt represents a single pupil's timed sitting of a quiz.
type QuizAttempt struct {
	ID               string     `json:"id"`
	QuizID           string     `json:"quizId"`
	StudentID        string     `json:"studentId"`
	QuestionOrder    []string   `json:"questionOrder,omitempty"`
	StartedAt        time.Time  `json:"startedAt"`
	ExpiresAt        time.Time  `json:"expiresAt"`
	SubmittedAt      *time.Time `json:"submittedAt,omitempty"`
	TimeTakenSeconds int        `json:"timeTakenSeconds"`
	RawCorrect       int        `json:"rawCorrect"`
	TotalQuestions   int        `json:"totalQuestions"`
	ScoreOutOf1000   int        `json:"scoreOutOf1000"`
	Passed           bool       `json:"passed"`
	TabSwitchCount   int        `json:"tabSwitchCount"`
	Status           string     `json:"status"` // in_progress | submitted | expired
}

// AttemptAnswer records a pupil's selected option for one question.
type AttemptAnswer struct {
	AttemptID      string    `json:"attemptId"`
	QuestionID     string    `json:"questionId"`
	SelectedOption string    `json:"selectedOption"` // A | B | C | D
	IsCorrect      bool      `json:"-"`
	AnsweredAt     time.Time `json:"answeredAt"`
}

// AdminAttemptView enriches an attempt with student and quiz details for admin monitoring.
type AdminAttemptView struct {
	QuizAttempt
	ExamCode   string `json:"examCode"`
	FullName   string `json:"fullName"`
	SchoolName string `json:"schoolName"`
	Level      string `json:"level"`
	QuizTitle  string `json:"quizTitle"`
}

// StudentWithAttempt pairs a student record with their latest attempt for the Admin Roster.
type StudentWithAttempt struct {
	Student
	LatestAttempt *QuizAttempt `json:"latestAttempt,omitempty"`
}

// LeaderboardEntry is a single ranked row on the public Evolve Results page.
type LeaderboardEntry struct {
	Rank             int    `json:"rank"`
	ExamCode         string `json:"examCode"`
	FullName         string `json:"fullName"`
	SchoolName       string `json:"schoolName"`
	SchoolLocation   string `json:"schoolLocation"`
	Level            string `json:"level"`
	ClassName        string `json:"className"`
	ScoreOutOf1000   int    `json:"scoreOutOf1000"`
	RawCorrect       int    `json:"rawCorrect"`
	TotalQuestions   int    `json:"totalQuestions"`
	TimeTakenSeconds int    `json:"timeTakenSeconds"`
	Passed           bool   `json:"passed"`
	Finalist         bool   `json:"finalist"`
}

// LevelResults groups publication status and rankings for one competition level.
type LevelResults struct {
	Level            string             `json:"level"`
	QuizID           string             `json:"quizId,omitempty"`
	QuizTitle        string             `json:"quizTitle,omitempty"`
	ResultsPublished bool               `json:"resultsPublished"`
	PassMark         int                `json:"passMark"`
	MaxScore         int                `json:"maxScore"`
	TotalParticipants int               `json:"totalParticipants"`
	TotalPassed      int                `json:"totalPassed"`
	Podium           []LeaderboardEntry `json:"podium"`
	Leaderboard      []LeaderboardEntry `json:"leaderboard"`
}

// ResultsResponse is returned by GET /api/v1/evolve/results.
type ResultsResponse struct {
	Edition     string             `json:"edition"`
	GeneratedAt time.Time          `json:"generatedAt"`
	Levels      []LevelResults     `json:"levels"`
	Lookup      *LeaderboardEntry  `json:"lookup,omitempty"`
	LookupNote  string             `json:"lookupNote,omitempty"`
}
