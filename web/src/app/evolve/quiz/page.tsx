"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  KeyRound,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Flag,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ShieldAlert,
  ArrowLeft,
  Send,
  Play,
  Award,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import KhlcLogo from "@/components/KhlcLogo";
import {
  apiRequest,
  formatDuration,
  levelLabel,
  type Quiz,
  type QuizAttempt,
  type StudentPublicProfile,
  type StudentQuestionView,
  type OptionLetter,
} from "@/lib/quizApi";

type PortalStage = "login" | "lobby" | "exam" | "receipt";

interface LoginResponse {
  token: string;
  serverTime: string;
  student: StudentPublicProfile;
  quiz: Quiz | null;
  questionCount: number;
  attempt: QuizAttempt | null;
}

interface StartSessionResponse {
  serverTime: string;
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: StudentQuestionView[];
  savedAnswers: Record<string, OptionLetter>;
}

interface SubmitResponse {
  message: string;
  attempt: QuizAttempt;
  resultsPublished: boolean;
  passMark: number;
  maxScore: number;
}

export default function EvolveQuizPortalPage() {
  const [stage, setStage] = useState<PortalStage>("login");

  // Login form
  const [examCode, setExamCode] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Session data
  const [token, setToken] = useState("");
  const [student, setStudent] = useState<StudentPublicProfile | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [clockOffsetMs, setClockOffsetMs] = useState(0);

  // Live exam state
  const [questions, setQuestions] = useState<StudentQuestionView[]>([]);
  const [answers, setAnswers] = useState<Record<string, OptionLetter>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [countdownToOpen, setCountdownToOpen] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [resultsPublished, setResultsPublished] = useState(false);

  const autoSubmittedRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const getServerNow = useCallback(
    () => Date.now() + clockOffsetMs,
    [clockOffsetMs]
  );

  // 1. Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<LoginResponse>("/api/v1/quiz/login", {
        method: "POST",
        body: { examCode: examCode.trim(), pin: pin.trim() },
      });
      const offset = new Date(res.serverTime).getTime() - Date.now();
      setClockOffsetMs(offset);
      setToken(res.token);
      setStudent(res.student);
      setQuiz(res.quiz);
      setQuestionCount(res.questionCount);
      setAttempt(res.attempt);
      setResultsPublished(Boolean(res.quiz?.resultsPublished));

      if (
        res.attempt &&
        (res.attempt.status === "submitted" || res.attempt.status === "expired")
      ) {
        setStage("receipt");
      } else {
        setStage("lobby");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 2. Start or Resume Exam
  const handleStartExam = async () => {
    if (!quiz) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest<StartSessionResponse>(
        "/api/v1/quiz/sessions/start",
        {
          method: "POST",
          token,
          body: { quizId: quiz.id },
        }
      );
      const offset = new Date(res.serverTime).getTime() - Date.now();
      setClockOffsetMs(offset);
      setAttempt(res.attempt);
      setQuiz(res.quiz);
      setQuestions(res.questions);
      setAnswers(res.savedAnswers || {});
      setCurrentIndex(0);
      autoSubmittedRef.current = false;

      const secs = Math.max(
        0,
        Math.floor(
          (new Date(res.attempt.expiresAt).getTime() -
            new Date(res.serverTime).getTime()) /
            1000
        )
      );
      setRemainingSeconds(secs);
      setStage("exam");
    } catch (err) {
      const payload = (err as { payload?: { attempt?: QuizAttempt } })?.payload;
      if (payload?.attempt) {
        setAttempt(payload.attempt);
        setStage("receipt");
      } else {
        setError(err instanceof Error ? err.message : "Could not start quiz");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Quiz (Manual or Auto on 00:00)
  const submitQuiz = useCallback(
    async (expired = false) => {
      if (!attempt || submitting) return;
      setSubmitting(true);
      setConfirmSubmitOpen(false);
      setError("");
      try {
        const res = await apiRequest<SubmitResponse>(
          `/api/v1/quiz/sessions/${encodeURIComponent(attempt.id)}/submit`,
          {
            method: "POST",
            token,
            body: { answers: answersRef.current, expired },
          }
        );
        setAttempt(res.attempt);
        setResultsPublished(res.resultsPublished);
        setStage("receipt");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit quiz"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [attempt, submitting, token]
  );

  // 4. Auto-Save Answer on Selection
  const handleSelectOption = async (questionId: string, option: OptionLetter) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    if (!attempt) return;
    setSaveState("saving");
    try {
      await apiRequest(
        `/api/v1/quiz/sessions/${encodeURIComponent(attempt.id)}/answer`,
        {
          method: "PATCH",
          token,
          body: { questionId, selectedOption: option },
        }
      );
      setSaveState("saved");
    } catch {
      setSaveState("idle");
    }
  };

  // 5. Lobby Schedule Countdown
  useEffect(() => {
    if (stage !== "lobby" || !quiz) return;
    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(quiz.startsAt).getTime() - getServerNow()) / 1000)
      );
      setCountdownToOpen(diff);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [stage, quiz, getServerNow]);

  // 6. Authoritative Sitting Countdown Timer + Auto-Submit at 00:00
  useEffect(() => {
    if (stage !== "exam" || !attempt) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.floor(
          (new Date(attempt.expiresAt).getTime() - getServerNow()) / 1000
        )
      );
      setRemainingSeconds(left);
      if (left <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        void submitQuiz(true);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [stage, attempt, getServerNow, submitQuiz]);

  // 7. Tab-Switch Detection & Proctoring Telemetry
  useEffect(() => {
    if (stage !== "exam" || !attempt) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabWarning(true);
        void apiRequest(
          `/api/v1/quiz/sessions/${encodeURIComponent(attempt.id)}/answer`,
          {
            method: "PATCH",
            token,
            body: { tabSwitch: true },
          }
        ).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [stage, attempt, token]);

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPct =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  // =========================================================================
  // STAGE 1: STUDENT LOGIN SCREEN
  // =========================================================================
  if (stage === "login") {
    return (
      <main className="min-h-screen bg-[#100038] text-white flex flex-col">
        <header className="border-b border-white/10 bg-[#140047]/90 px-4 py-3.5 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/evolve" className="flex items-center gap-3">
              <KhlcLogo className="h-9 w-auto" variant="dark" />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#9dff13]/15 px-3 py-1 text-[11px] font-extrabold text-[#9dff13]">
                <Trophy className="h-3.5 w-3.5" />
                EVOLVE 8.0 EXAM PORTAL
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/evolve/results"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/90 hover:border-[#38e0ff] hover:text-[#38e0ff]"
              >
                Official Results
              </Link>
              <Link
                href="/evolve"
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white/80 hover:text-[#9dff13]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Evolve 8.0</span>
              </Link>
            </div>
          </div>
        </header>

        <section className="relative flex flex-1 items-center justify-center px-4 py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-10 left-1/4 h-72 w-72 rounded-full bg-[#3b00b3]/50 blur-[120px]"
          />
          <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9dff13]/35 bg-white/5 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#9dff13]">
                <Sparkles className="h-3.5 w-3.5" />
                Phase 1 · National Online General Test
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Ready for the{" "}
                <span className="text-[#9dff13]">Evolve 8.0</span> Timed Test?
              </h1>
              <p className="text-sm text-white/75 leading-relaxed">
                Enter the <strong>Exam ID</strong> and <strong>6-digit PIN</strong>{" "}
                from your school login slip. Your assigned level (Junior,
                Intermediate, or Senior) will load automatically.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[11px] font-bold uppercase text-[#38e0ff]">
                    Standardized Score
                  </p>
                  <p className="mt-1 text-lg font-extrabold">1,000 Points</p>
                  <p className="text-[11px] text-white/60">
                    Pass mark: 700 (70%)
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[11px] font-bold uppercase text-[#9dff13]">
                    Tie-Breaker Rule
                  </p>
                  <p className="mt-1 text-lg font-extrabold">Faster Time</p>
                  <p className="text-[11px] text-white/60">
                    Auto-saved every answer
                  </p>
                </div>
              </div>
            </div>

            {/* Right Login Card */}
            <div className="lg:col-span-6 rounded-3xl bg-white p-6 sm:p-8 text-[#0d002b] shadow-2xl">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b00b3] text-[#9dff13]">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-[#0d002b]">
                    Candidate Login
                  </h2>
                  <p className="text-xs text-gray-500">
                    Primary 4–6 · JSS 1–3 · SS 1–3
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="exam-code"
                    className="block text-xs font-bold text-[#0d002b]"
                  >
                    Exam ID *
                  </label>
                  <input
                    id="exam-code"
                    type="text"
                    required
                    value={examCode}
                    onChange={(e) => setExamCode(e.target.value.toUpperCase())}
                    placeholder="e.g., EV8-JUN-1001"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-4 py-3 font-mono text-sm font-extrabold uppercase tracking-wider text-[#0d002b] placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="exam-pin"
                    className="block text-xs font-bold text-[#0d002b]"
                  >
                    6-Digit Exam PIN *
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="exam-pin"
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter 6-digit PIN"
                      className="w-full rounded-xl border border-gray-200 bg-[#faf9ff] py-3 pl-4 pr-11 font-mono text-sm font-extrabold tracking-widest text-[#0d002b] placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin((prev) => !prev)}
                      aria-label={showPin ? "Hide PIN" : "Show PIN"}
                      className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 hover:text-[#3b00b3] transition-colors"
                    >
                      {showPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b00b3] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors disabled:opacity-50"
                >
                  <span>
                    {loading ? "Verifying Candidate..." : "Verify & Continue →"}
                  </span>
                </button>
              </form>

              <div className="mt-5 rounded-2xl border border-[#3b00b3]/15 bg-[#faf6ff] p-3.5 text-[11px] text-gray-600">
                <p className="font-extrabold text-[#3b00b3]">
                  School Computer Lab Demo Credentials:
                </p>
                <p className="mt-1 font-mono">
                  Junior: <strong>EV8-JUN-1001</strong> · Intermediate:{" "}
                  <strong>EV8-INT-2001</strong> · Senior:{" "}
                  <strong>EV8-SEN-3001</strong> · PIN: <strong>123456</strong>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // =========================================================================
  // STAGE 2: SCHEDULE & READINESS GATE (LOBBY)
  // =========================================================================
  if (stage === "lobby" && student) {
    const now = getServerNow();
    const isBeforeStart = quiz ? now < new Date(quiz.startsAt).getTime() : false;
    const isAfterEnd = quiz ? now > new Date(quiz.endsAt).getTime() : false;
    const canStart =
      Boolean(quiz) &&
      quiz?.status !== "draft" &&
      quiz?.status !== "closed" &&
      !isBeforeStart &&
      !isAfterEnd;
    const isResume = attempt?.status === "in_progress";

    return (
      <main className="min-h-screen bg-[#f4f3fa] text-[#0d002b] py-10 px-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <KhlcLogo className="h-9 w-auto" />
            <button
              type="button"
              onClick={() => {
                setStage("login");
                setToken("");
              }}
              className="text-xs font-bold text-gray-500 hover:text-[#3b00b3]"
            >
              Switch Candidate
            </button>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
              <div>
                <span className="inline-block rounded-full bg-[#100038] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#9dff13]">
                  {levelLabel(student.level)}
                </span>
                <h1 className="mt-2 text-2xl font-extrabold text-[#0d002b]">
                  Welcome, {student.fullName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {student.schoolName}
                  {student.className ? ` · ${student.className}` : ""} · Exam
                  ID:{" "}
                  <strong className="font-mono text-[#3b00b3]">
                    {student.examCode}
                  </strong>
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            {!quiz ? (
              <div className="mt-6 rounded-2xl bg-[#faf9ff] p-6 text-center">
                <Clock className="mx-auto h-10 w-10 text-[#3b00b3]/40" />
                <p className="mt-3 text-sm font-extrabold">
                  No quiz scheduled for {levelLabel(student.level)} yet
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Please check back when your supervising teacher announces your
                  sitting window.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-5 rounded-2xl bg-[#100038] p-5 text-white">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#9dff13]">
                    Assigned National Assessment
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold">{quiz.title}</h2>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-[10px] uppercase text-white/60">
                        Duration
                      </p>
                      <p className="mt-0.5 text-base font-extrabold">
                        {quiz.durationMinutes} mins
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-[10px] uppercase text-white/60">
                        Questions
                      </p>
                      <p className="mt-0.5 text-base font-extrabold">
                        {questionCount} MCQs
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-[10px] uppercase text-white/60">
                        Pass Mark
                      </p>
                      <p className="mt-0.5 text-base font-extrabold text-[#9dff13]">
                        {quiz.passMark} / {quiz.maxScore}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5 rounded-2xl border border-gray-100 bg-[#faf9ff] p-4 text-xs text-gray-700">
                  <p className="font-extrabold text-[#0d002b]">
                    Official Evolve 8.0 Exam Rules:
                  </p>
                  <ul className="list-disc space-y-1.5 pl-4">
                    <li>
                      Your timer is tracked on the server and automatically
                      submits when it reaches <strong>00:00</strong>.
                    </li>
                    <li>
                      Every answer you tap is <strong>auto-saved</strong>{" "}
                      instantly so a brief network drop will not erase your work.
                    </li>
                    <li>
                      Stay on this exam tab — switching tabs or windows is
                      recorded for your invigilator.
                    </li>
                    <li>
                      Ties in score are broken by{" "}
                      <strong>faster completion time</strong>.
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  {isBeforeStart && !isResume ? (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
                      <p className="text-xs font-extrabold uppercase text-blue-800">
                        Test Window Opens In
                      </p>
                      <p className="mt-1 font-mono text-2xl font-extrabold text-[#100038]">
                        {Math.floor(countdownToOpen / 3600)}h{" "}
                        {Math.floor((countdownToOpen % 3600) / 60)}m{" "}
                        {countdownToOpen % 60}s
                      </p>
                      <p className="mt-1 text-[11px] text-blue-700">
                        Scheduled start:{" "}
                        {new Date(quiz.startsAt).toLocaleString()}
                      </p>
                    </div>
                  ) : !canStart && !isResume ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                      <p className="text-sm font-extrabold text-amber-900">
                        This test window is currently closed
                      </p>
                      <p className="mt-1 text-xs text-amber-700">
                        Status: {quiz.status.toUpperCase()} · Window ended{" "}
                        {new Date(quiz.endsAt).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartExam}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3b00b3] px-6 py-4 text-base font-extrabold text-white shadow-lg hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors disabled:opacity-50"
                    >
                      <Play className="h-5 w-5" />
                      <span>
                        {loading
                          ? "Loading Questions..."
                          : isResume
                          ? "Resume Timed Quiz →"
                          : "Start Timed Quiz Now →"}
                      </span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  // =========================================================================
  // STAGE 3: DISTRACTION-FREE TIMED EXAM RUNNER
  // =========================================================================
  if (stage === "exam" && currentQ && student && quiz) {
    const isCritical = remainingSeconds <= 60;
    const isWarning = remainingSeconds > 60 && remainingSeconds <= 300;

    return (
      <main className="min-h-screen bg-[#f4f3fa] text-[#0d002b] flex flex-col">
        {/* Sticky Top Exam Bar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-[#100038] text-white shadow-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs sm:text-sm font-extrabold text-white">
                {student.fullName}{" "}
                <span className="font-mono text-[#9dff13]">
                  ({student.examCode})
                </span>
              </p>
              <p className="truncate text-[11px] text-white/65">
                {quiz.title} · {answeredCount}/{questions.length} answered
                {saveState === "saved" ? " · Saved" : ""}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-sm sm:text-base font-extrabold ${
                  isCritical
                    ? "animate-pulse bg-red-600 text-white"
                    : isWarning
                    ? "bg-amber-400 text-[#0d002b]"
                    : "bg-[#9dff13] text-[#0d002b]"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>{formatDuration(remainingSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={() => setPaletteOpen((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Questions</span>
              </button>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/10">
            <div
              className="h-full bg-[#9dff13] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </header>

        {/* Tab-Switch Proctoring Alert */}
        {tabWarning && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 text-xs font-bold text-amber-900">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  Tab switch detected and recorded. Please stay on this exam
                  screen until you submit.
                </span>
              </span>
              <button
                type="button"
                onClick={() => setTabWarning(false)}
                className="underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Exam Body */}
        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
          {/* Question Card */}
          <div className="flex-1 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-[#3b00b3] px-3 py-1 text-xs font-extrabold text-white">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="rounded-full bg-[#faf6ff] px-2.5 py-1 text-[11px] font-bold text-[#3b00b3]">
                  {currentQ.topic}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFlagged((prev) => ({
                    ...prev,
                    [currentQ.id]: !prev[currentQ.id],
                  }))
                }
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                  flagged[currentQ.id]
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-700"
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                <span>{flagged[currentQ.id] ? "Flagged" : "Flag for Review"}</span>
              </button>
            </div>

            <h2 className="mt-6 text-lg sm:text-xl font-extrabold leading-relaxed text-[#0d002b]">
              {currentQ.prompt}
            </h2>

            {/* Tap-Friendly A/B/C/D Answer Cards */}
            <div className="mt-6 space-y-3">
              {(
                [
                  ["A", currentQ.optionA],
                  ["B", currentQ.optionB],
                  ["C", currentQ.optionC],
                  ["D", currentQ.optionD],
                ] as const
              ).map(([letter, text]) => {
                const selected = answers[currentQ.id] === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, letter)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                      selected
                        ? "border-[#3b00b3] bg-[#faf6ff] shadow-sm"
                        : "border-gray-200 bg-white hover:border-[#3b00b3]/40 hover:bg-[#faf9ff]"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                        selected
                          ? "bg-[#3b00b3] text-[#9dff13]"
                          : "bg-gray-100 text-[#0d002b]"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 text-sm sm:text-base font-bold text-[#0d002b]">
                      {text}
                    </span>
                    {selected && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#3b00b3]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Navigation */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-[#0d002b] hover:border-[#3b00b3] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2.5">
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((i) =>
                        Math.min(questions.length - 1, i + 1)
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b00b3] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmSubmitOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-emerald-700"
                  >
                    <Send className="h-4 w-4" />
                    <span>Finish &amp; Submit Quiz</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar (Collapsible on mobile, visible on desktop/toggle) */}
          <aside
            className={`${
              paletteOpen ? "block" : "hidden lg:block"
            } w-full lg:w-72 shrink-0 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm h-fit`}
          >
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
              Question Palette
            </h3>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAns = Boolean(answers[q.id]);
                const isFlag = Boolean(flagged[q.id]);
                const isCurr = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setPaletteOpen(false);
                    }}
                    className={`relative flex h-10 items-center justify-center rounded-xl text-xs font-extrabold transition-all ${
                      isCurr
                        ? "ring-2 ring-[#3b00b3] ring-offset-1 bg-[#100038] text-[#9dff13]"
                        : isAns
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                    {isFlag && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-gray-200" />
                <span>Unanswered ({questions.length - answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span>
                  Flagged ({Object.values(flagged).filter(Boolean).length})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConfirmSubmitOpen(true)}
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#100038] py-3 text-xs font-extrabold text-[#9dff13] hover:bg-[#3b00b3] hover:text-white transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Exam ({answeredCount}/{questions.length})</span>
            </button>
          </aside>
        </section>

        {/* Confirm Submit Modal */}
        {confirmSubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d002b]/70 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-extrabold text-[#0d002b]">
                Submit Your Evolve 8.0 Quiz?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">
                You have answered{" "}
                <strong>
                  {answeredCount} of {questions.length}
                </strong>{" "}
                questions with{" "}
                <strong className="font-mono">
                  {formatDuration(remainingSeconds)}
                </strong>{" "}
                remaining. Once submitted, your answers are locked and graded
                immediately.
              </p>
              {answeredCount < questions.length && (
                <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800">
                  You still have {questions.length - answeredCount} unanswered
                  question(s).
                </div>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600"
                >
                  Keep Reviewing
                </button>
                <button
                  type="button"
                  onClick={() => submitQuiz(false)}
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-700"
                >
                  {submitting ? "Grading..." : "Yes, Submit Now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // =========================================================================
  // STAGE 4: OFFICIAL COMPLETION RECEIPT
  // =========================================================================
  return (
    <main className="min-h-screen bg-[#100038] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl bg-white p-7 sm:p-9 text-[#0d002b] shadow-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        <span className="mt-4 inline-block rounded-full bg-[#3b00b3]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
          Submission Confirmed
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#0d002b]">
          Well Done, {student?.fullName}!
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
          {student?.schoolName} ·{" "}
          <strong className="font-mono text-[#3b00b3]">
            {student?.examCode}
          </strong>{" "}
          · {student ? levelLabel(student.level) : ""}
        </p>

        {attempt && (
          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#faf9ff] p-4 border border-gray-100">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400">
                Score
              </p>
              <p className="mt-1 text-xl font-extrabold text-[#3b00b3]">
                {attempt.scoreOutOf1000}
                <span className="text-xs font-bold text-gray-400"> /1000</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400">
                Completion Time
              </p>
              <p className="mt-1 font-mono text-xl font-extrabold text-[#0d002b]">
                {formatDuration(attempt.timeTakenSeconds)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400">
                Status
              </p>
              <p
                className={`mt-1 text-sm font-extrabold ${
                  attempt.passed ? "text-emerald-600" : "text-amber-700"
                }`}
              >
                {attempt.passed ? "Passed (≥700)" : "Recorded"}
              </p>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          {resultsPublished
            ? "Official Evolve 8.0 national rankings are live! Check your national position and podium standings below."
            : "Your verified score and completion time are safely stored. Official national rankings will appear on the Results page once published by Kingshouse Learning Centre."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/evolve/results"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b00b3] px-5 py-3 text-xs sm:text-sm font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
          >
            <Award className="h-4 w-4" />
            <span>View Official Results &amp; Rankings</span>
          </Link>
          <Link
            href="/evolve"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-xs sm:text-sm font-extrabold text-[#0d002b] hover:border-[#3b00b3]"
          >
            <span>Back to Evolve 8.0</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
