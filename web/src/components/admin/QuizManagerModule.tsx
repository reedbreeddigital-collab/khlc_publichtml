"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  Plus,
  Edit3,
  Trash2,
  Globe,
  EyeOff,
  CheckCircle2,
  Clock,
  Users,
  FileQuestion,
  X,
  Shuffle,
} from "lucide-react";
import {
  type QuizWithStats,
  type CompetitionLevel,
  type QuizStatus,
  levelLabel,
} from "@/lib/quizApi";

interface QuizManagerModuleProps {
  quizzes: QuizWithStats[];
  onCreateQuiz: (payload: {
    title: string;
    edition: string;
    level: CompetitionLevel;
    durationMinutes: number;
    startsAt: string;
    endsAt: string;
    maxScore: number;
    passMark: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    status: QuizStatus;
  }) => Promise<void>;
  onUpdateQuiz: (
    id: string,
    patch: Partial<{
      title: string;
      level: CompetitionLevel;
      durationMinutes: number;
      startsAt: string;
      endsAt: string;
      maxScore: number;
      passMark: number;
      shuffleQuestions: boolean;
      shuffleOptions: boolean;
      status: QuizStatus;
      resultsPublished: boolean;
    }>
  ) => Promise<void>;
  onDeleteQuiz: (id: string) => Promise<void>;
}

function toDatetimeLocal(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const statusColors: Record<QuizStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-50 text-blue-700 border border-blue-200",
  live: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  closed: "bg-amber-50 text-amber-800 border border-amber-200",
};

export default function QuizManagerModule({
  quizzes,
  onCreateQuiz,
  onUpdateQuiz,
  onDeleteQuiz,
}: QuizManagerModuleProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<QuizWithStats | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<CompetitionLevel>("junior");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(now.toISOString()));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(nextWeek.toISOString()));
  const [maxScore, setMaxScore] = useState(1000);
  const [passMark, setPassMark] = useState(700);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [status, setStatus] = useState<QuizStatus>("scheduled");

  const openCreate = () => {
    setEditing(null);
    setTitle("Evolve 8.0 Phase 1 — National Online Test");
    setLevel("junior");
    setDurationMinutes(30);
    setStartsAt(toDatetimeLocal(new Date().toISOString()));
    setEndsAt(
      toDatetimeLocal(new Date(Date.now() + 7 * 86400000).toISOString())
    );
    setMaxScore(1000);
    setPassMark(700);
    setShuffleQuestions(true);
    setShuffleOptions(false);
    setStatus("live");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (q: QuizWithStats) => {
    setEditing(q);
    setTitle(q.title);
    setLevel(q.level);
    setDurationMinutes(q.durationMinutes);
    setStartsAt(toDatetimeLocal(q.startsAt));
    setEndsAt(toDatetimeLocal(q.endsAt));
    setMaxScore(q.maxScore);
    setPassMark(q.passMark);
    setShuffleQuestions(q.shuffleQuestions);
    setShuffleOptions(q.shuffleOptions);
    setStatus(q.status);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const startsIso = new Date(startsAt).toISOString();
      const endsIso = new Date(endsAt).toISOString();
      if (editing) {
        await onUpdateQuiz(editing.id, {
          title,
          level,
          durationMinutes: Number(durationMinutes),
          startsAt: startsIso,
          endsAt: endsIso,
          maxScore: Number(maxScore),
          passMark: Number(passMark),
          shuffleQuestions,
          shuffleOptions,
          status,
        });
      } else {
        await onCreateQuiz({
          title,
          edition: "Evolve 8.0",
          level,
          durationMinutes: Number(durationMinutes),
          startsAt: startsIso,
          endsAt: endsIso,
          maxScore: Number(maxScore),
          passMark: Number(passMark),
          shuffleQuestions,
          shuffleOptions,
          status,
        });
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3b00b3]/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
            <CalendarClock className="h-3.5 w-3.5" />
            Phase 1 National Online Test
          </span>
          <h2 className="mt-1.5 text-lg font-extrabold text-[#0d002b]">
            Evolve 8.0 Quiz &amp; Schedule Manager
          </h2>
          <p className="text-xs text-gray-500">
            Configure timed sittings per level (Junior, Intermediate, Senior),
            open/close schedule windows, and publish official national rankings
            (700 / 1,000 pass mark).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3b00b3] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Scheduled Quiz</span>
        </button>
      </div>

      {/* Quiz Cards */}
      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <CalendarClock className="mx-auto h-10 w-10 text-[#3b00b3]/40" />
          <p className="mt-3 text-sm font-extrabold text-[#0d002b]">
            No quizzes created yet
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Create your Junior, Intermediate, and Senior Evolve 8.0 quizzes to
            schedule sittings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {quizzes.map((q) => (
            <div
              key={q.id}
              className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-[#3b00b3]/30 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-[#100038] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#9dff13]">
                    {levelLabel(q.level)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      statusColors[q.status]
                    }`}
                  >
                    {q.status}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-extrabold text-[#0d002b] leading-snug">
                  {q.title}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#3b00b3]" />
                    <span>
                      <strong>{q.durationMinutes} mins</strong> · Pass mark:{" "}
                      <strong>
                        {q.passMark} / {q.maxScore}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                    <span>
                      {new Date(q.startsAt).toLocaleString()} →{" "}
                      {new Date(q.endsAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <Shuffle className="h-3.5 w-3.5 text-gray-400" />
                    <span>
                      {q.shuffleQuestions
                        ? "Questions shuffled per pupil"
                        : "Fixed question order"}
                    </span>
                  </div>
                </div>

                {/* Live Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#faf9ff] p-3 text-center">
                  <div>
                    <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-gray-400">
                      <FileQuestion className="h-3 w-3" /> Qs
                    </p>
                    <p className="mt-0.5 text-sm font-extrabold text-[#0d002b]">
                      {q.questionCount}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-gray-400">
                      <Users className="h-3 w-3" /> Sat
                    </p>
                    <p className="mt-0.5 text-sm font-extrabold text-[#0d002b]">
                      {q.submittedCount}/{q.attemptCount}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-gray-400">
                      <CheckCircle2 className="h-3 w-3" /> Passed
                    </p>
                    <p className="mt-0.5 text-sm font-extrabold text-emerald-700">
                      {q.passedCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <select
                    value={q.status}
                    onChange={(e) =>
                      onUpdateQuiz(q.id, {
                        status: e.target.value as QuizStatus,
                      })
                    }
                    className="flex-1 rounded-xl border border-gray-200 bg-[#faf9ff] px-2.5 py-2 text-xs font-bold text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                    aria-label="Quiz Status"
                  >
                    <option value="draft">Status: Draft</option>
                    <option value="scheduled">Status: Scheduled</option>
                    <option value="live">Status: Live (Open)</option>
                    <option value="closed">Status: Closed</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => openEdit(q)}
                    className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:border-[#3b00b3] hover:text-[#3b00b3]"
                    title="Edit Quiz"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete "${q.title}" and all associated attempts?`
                        )
                      ) {
                        onDeleteQuiz(q.id);
                      }
                    }}
                    className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:border-red-300 hover:text-red-600"
                    title="Delete Quiz"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateQuiz(q.id, {
                      resultsPublished: !q.resultsPublished,
                    })
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-extrabold transition-colors ${
                    q.resultsPublished
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-[#100038] text-[#9dff13] hover:bg-[#3b00b3] hover:text-white"
                  }`}
                >
                  {q.resultsPublished ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Official Results Published (Click to Hide)</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3.5 w-3.5" />
                      <span>Publish Official Results</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d002b]/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0d002b]">
                {editing ? "Edit Scheduled Quiz" : "Create Scheduled Quiz"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-[#0d002b]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d002b]">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-medium focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Competition Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) =>
                      setLevel(e.target.value as CompetitionLevel)
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold focus:border-[#3b00b3] focus:outline-none"
                  >
                    <option value="junior">Junior (Primary 4–6)</option>
                    <option value="intermediate">Intermediate (JSS 1–3)</option>
                    <option value="senior">Senior (SS 1–3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as QuizStatus)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold focus:border-[#3b00b3] focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live (Open)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Window Opens *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs focus:border-[#3b00b3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Window Closes *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs focus:border-[#3b00b3] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold focus:border-[#3b00b3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Max Score
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold focus:border-[#3b00b3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Pass Mark
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={passMark}
                    onChange={(e) => setPassMark(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold focus:border-[#3b00b3] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-[#0d002b]">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#3b00b3]"
                  />
                  <span>Shuffle questions per student</span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-[#0d002b]">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#3b00b3]"
                  />
                  <span>Shuffle options</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#3b00b3] px-5 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editing
                    ? "Save Changes"
                    : "Create Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
