"use client";

import React, { useState, useMemo } from "react";
import {
  FileQuestion,
  Plus,
  Upload,
  Download,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  type Question,
  type LevelScope,
  type OptionLetter,
  type QuizWithStats,
  levelLabel,
} from "@/lib/quizApi";

interface QuestionBankModuleProps {
  questions: Question[];
  quizzes: QuizWithStats[];
  onCreateQuestion: (payload: Omit<Question, "id" | "createdAt">) => Promise<void>;
  onUpdateQuestion: (id: string, patch: Partial<Question>) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onImportCsv: (csvText: string, quizId?: string) => Promise<{ imported: number; skipped: number }>;
}

const TOPICS = ["Digital Literacy", "Coding", "Robotics", "AI", "Logic"];

const CSV_TEMPLATE = `level_scope,topic,prompt,option_a,option_b,option_c,option_d,correct_option,points
shared,Digital Literacy,"Which key combination copies selected text on Windows?","Ctrl + X","Ctrl + C","Ctrl + V","Ctrl + Z",B,10
junior,Coding,"Which block starts a script when clicked in Scratch?","When green flag clicked","Stop all","Wait 10 seconds","Hide",A,10
intermediate,Robotics,"What does LED stand for in electronics?","Light Emitting Diode","Low Energy Device","Linear Electric Drive","Logic Entry Display",A,10
senior,AI,"Which metric evaluates the proportion of correct predictions out of all predictions?","Latency","Accuracy","Bandwidth","Throughput",B,10`;

export default function QuestionBankModule({
  questions,
  quizzes,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onImportCsv,
}: QuestionBankModuleProps) {
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState(CSV_TEMPLATE);
  const [csvQuizId, setCsvQuizId] = useState("");
  const [csvNotice, setCsvNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [quizId, setQuizId] = useState("");
  const [levelScope, setLevelScope] = useState<LevelScope>("shared");
  const [topic, setTopic] = useState("Digital Literacy");
  const [prompt, setPrompt] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<OptionLetter>("A");
  const [points, setPoints] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) => {
      if (filterLevel !== "all" && item.levelScope !== filterLevel) return false;
      if (filterTopic !== "all" && item.topic.toLowerCase() !== filterTopic.toLowerCase())
        return false;
      if (
        q &&
        !item.prompt.toLowerCase().includes(q) &&
        !item.topic.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [questions, filterLevel, filterTopic, search]);

  const openCreate = () => {
    setEditing(null);
    setQuizId("");
    setLevelScope("shared");
    setTopic("Digital Literacy");
    setPrompt("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setPoints(10);
    setError("");
    setEditorOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditing(q);
    setQuizId(q.quizId || "");
    setLevelScope(q.levelScope);
    setTopic(q.topic);
    setPrompt(q.prompt);
    setOptionA(q.optionA);
    setOptionB(q.optionB);
    setOptionC(q.optionC);
    setOptionD(q.optionD);
    setCorrectOption(q.correctOption);
    setPoints(q.points || 10);
    setError("");
    setEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        quizId,
        levelScope,
        topic,
        prompt,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
        points: Number(points) || 10,
        active: true,
      };
      if (editing) {
        await onUpdateQuestion(editing.id, payload);
      } else {
        await onCreateQuestion(payload);
      }
      setEditorOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleCsvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setCsvNotice("");
    setError("");
    try {
      const res = await onImportCsv(csvText, csvQuizId || undefined);
      setCsvNotice(
        `Successfully imported ${res.imported} question(s)${
          res.skipped ? ` (${res.skipped} skipped)` : ""
        }.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSV import failed");
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evolve-8-question-bank-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCsvText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3b00b3]/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
            <FileQuestion className="h-3.5 w-3.5" />
            MCQ Question Bank
          </span>
          <h2 className="mt-1.5 text-lg font-extrabold text-[#0d002b]">
            Questions Manager ({questions.length} total)
          </h2>
          <p className="text-xs text-gray-500">
            Tag questions as <strong>Shared Core</strong> (used across all 3
            levels) or specific to Junior, Intermediate, or Senior. Answer keys
            stay strictly server-side.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#0d002b] hover:border-[#3b00b3]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV Template</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCsvNotice("");
              setError("");
              setCsvOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#100038] px-3.5 py-2.5 text-xs font-extrabold text-[#9dff13] hover:bg-[#3b00b3] hover:text-white transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b00b3] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search question prompt or topic..."
            className="w-full rounded-xl border border-gray-200 bg-[#faf9ff] py-2 pl-9 pr-3 text-xs text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold text-[#0d002b]"
        >
          <option value="all">All Levels</option>
          <option value="shared">Shared Core</option>
          <option value="junior">Junior</option>
          <option value="intermediate">Intermediate</option>
          <option value="senior">Senior</option>
        </select>

        <select
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
          className="rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold text-[#0d002b]"
        >
          <option value="all">All Topics</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Question Cards */}
      <div className="space-y-3">
        {filtered.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-[#faf6ff] px-2 py-0.5 text-[11px] font-extrabold text-[#3b00b3]">
                  #{idx + 1}
                </span>
                <span className="rounded-full bg-[#100038] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#9dff13]">
                  {levelLabel(q.levelScope)}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-700">
                  {q.topic}
                </span>
                <span className="text-[11px] font-bold text-gray-400">
                  {q.points} pts
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(q)}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-[#3b00b3] hover:text-[#3b00b3]"
                  title="Edit"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this question from the bank?")) {
                      onDeleteQuestion(q.id);
                    }
                  }}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-red-300 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <p className="mt-3 text-sm font-extrabold text-[#0d002b]">
              {q.prompt}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  ["A", q.optionA],
                  ["B", q.optionB],
                  ["C", q.optionC],
                  ["D", q.optionD],
                ] as const
              ).map(([letter, text]) => {
                const isCorrect = q.correctOption === letter;
                return (
                  <div
                    key={letter}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                      isCorrect
                        ? "border-emerald-300 bg-emerald-50/70 font-bold text-emerald-900"
                        : "border-gray-100 bg-[#faf9ff] text-gray-700"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold ${
                        isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-white border border-gray-200 text-[#0d002b]"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1">{text}</span>
                    {isCorrect && (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <p className="text-sm font-extrabold text-[#0d002b]">
              No matching questions found
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Try clearing your filters or add / import questions above.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d002b]/60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0d002b]">
                {editing ? "Edit Question" : "Add Question to Bank"}
              </h3>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Level Scope
                  </label>
                  <select
                    value={levelScope}
                    onChange={(e) =>
                      setLevelScope(e.target.value as LevelScope)
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold"
                  >
                    <option value="shared">Shared Core (All Levels)</option>
                    <option value="junior">Junior (Primary 4–6)</option>
                    <option value="intermediate">Intermediate (JSS 1–3)</option>
                    <option value="senior">Senior (SS 1–3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Topic
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Pin to Specific Quiz (Optional)
                  </label>
                  <select
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold"
                  >
                    <option value="">Auto-include by level scope</option>
                    {quizzes.map((qz) => (
                      <option key={qz.id} value={qz.id}>
                        {qz.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d002b]">
                  Question Prompt *
                </label>
                <textarea
                  rows={2}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a clear, unambiguous multiple-choice question..."
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(
                  [
                    ["Option A *", optionA, setOptionA],
                    ["Option B *", optionB, setOptionB],
                    ["Option C *", optionC, setOptionC],
                    ["Option D *", optionD, setOptionD],
                  ] as const
                ).map(([label, val, setter]) => (
                  <div key={label}>
                    <label className="block text-xs font-bold text-[#0d002b]">
                      {label}
                    </label>
                    <input
                      type="text"
                      required
                      value={val}
                      onChange={(e) => setter(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Correct Answer
                  </label>
                  <select
                    value={correctOption}
                    onChange={(e) =>
                      setCorrectOption(e.target.value as OptionLetter)
                    }
                    className="mt-1 w-full rounded-xl border border-emerald-300 bg-emerald-50/50 px-3 py-2 text-xs font-extrabold text-emerald-900"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Weight / Points
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#3b00b3] px-5 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {csvOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d002b]/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0d002b]">
                Bulk CSV Question Import
              </h3>
              <button
                type="button"
                onClick={() => setCsvOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                {error}
              </div>
            )}
            {csvNotice && (
              <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                {csvNotice}
              </div>
            )}

            <form onSubmit={handleCsvSubmit} className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#3b00b3]/40 bg-[#faf6ff] px-3.5 py-2 text-xs font-bold text-[#3b00b3]">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload .csv File</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <select
                  value={csvQuizId}
                  onChange={(e) => setCsvQuizId(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold"
                >
                  <option value="">Assign by CSV level_scope column</option>
                  {quizzes.map((qz) => (
                    <option key={qz.id} value={qz.id}>
                      Assign all to: {qz.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d002b]">
                  Paste CSV Rows (columns: level_scope, topic, prompt, option_a..d, correct_option, points)
                </label>
                <textarea
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] p-3 font-mono text-[11px] text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCsvOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#3b00b3] px-5 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] disabled:opacity-50"
                >
                  {saving ? "Importing..." : "Import Questions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
