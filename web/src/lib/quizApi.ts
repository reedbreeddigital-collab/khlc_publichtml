export type CompetitionLevel = "junior" | "intermediate" | "senior";
export type LevelScope = "shared" | CompetitionLevel;
export type QuizStatus = "draft" | "scheduled" | "live" | "closed";
export type OptionLetter = "A" | "B" | "C" | "D";

export interface Quiz {
  id: string;
  title: string;
  edition: string;
  level: CompetitionLevel;
  topics?: string[];
  questionLimit?: number;
  durationMinutes: number;
  startsAt: string;
  endsAt: string;
  maxScore: number;
  passMark: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  status: QuizStatus;
  resultsPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizWithStats extends Quiz {
  questionCount: number;
  attemptCount: number;
  submittedCount: number;
  passedCount: number;
}

export interface Question {
  id: string;
  quizId?: string;
  levelScope: LevelScope;
  topic: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: OptionLetter;
  points: number;
  active: boolean;
  createdAt?: string;
}

export interface StudentQuestionView {
  id: string;
  topic: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  questionOrder?: string[];
  startedAt: string;
  expiresAt: string;
  submittedAt?: string;
  timeTakenSeconds: number;
  rawCorrect: number;
  totalQuestions: number;
  scoreOutOf1000: number;
  passed: boolean;
  tabSwitchCount: number;
  status: "in_progress" | "submitted" | "expired";
}

export interface Student {
  id: string;
  examCode: string;
  pinCode?: string;
  fullName: string;
  schoolName: string;
  schoolLocation: string;
  level: CompetitionLevel;
  className: string;
  registrationRef?: string;
  phase2VideoUrl?: string;
  phase2VideoUpdatedAt?: string;
  createdAt?: string;
  latestAttempt?: QuizAttempt | null;
}

export interface StudentPublicProfile {
  id: string;
  examCode: string;
  fullName: string;
  schoolName: string;
  schoolLocation: string;
  level: CompetitionLevel;
  className: string;
}

export interface AdminAttemptView extends QuizAttempt {
  examCode: string;
  fullName: string;
  schoolName: string;
  level: CompetitionLevel;
  quizTitle: string;
}

export interface LeaderboardEntry {
  rank: number;
  examCode: string;
  fullName: string;
  schoolName: string;
  schoolLocation: string;
  level: CompetitionLevel;
  className: string;
  scoreOutOf1000: number;
  rawCorrect: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  passed: boolean;
  finalist: boolean;
}

export interface LevelResults {
  level: CompetitionLevel;
  quizId?: string;
  quizTitle?: string;
  resultsPublished: boolean;
  passMark: number;
  maxScore: number;
  totalParticipants: number;
  totalPassed: number;
  podium: LeaderboardEntry[];
  leaderboard: LeaderboardEntry[];
}

export interface ResultsResponse {
  edition: string;
  generatedAt: string;
  levels: LevelResults[];
  lookup?: LeaderboardEntry;
  lookupNote?: string;
}

export function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8080";
    }
  }
  return "";
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function levelLabel(level: string): string {
  switch (level) {
    case "junior":
      return "Junior (Primary 4–6)";
    case "intermediate":
      return "Intermediate (JSS 1–3)";
    case "senior":
      return "Senior (SS 1–3)";
    case "shared":
      return "Shared Core (All Levels)";
    default:
      return level;
  }
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {}
): Promise<T> {
  const base = getApiBase();
  if (!base) {
    throw new Error(
      "API server URL is not configured (set NEXT_PUBLIC_API_URL)."
    );
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const res = await fetch(`${base}${path}`, {
    method: options.method || "GET",
    headers,
    cache: "no-store",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && typeof data.error === "string" && data.error) ||
      `Request failed (${res.status})`;
    const err = new Error(message) as Error & { status?: number; payload?: unknown };
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data as T;
}
