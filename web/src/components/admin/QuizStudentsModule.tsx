"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
  DownloadCloud,
  AlertTriangle,
  Search,
  KeyRound,
  X,
  ClipboardList,
  Clock,
} from "lucide-react";
import {
  type Student,
  type AdminAttemptView,
  type CompetitionLevel,
  formatDuration,
  levelLabel,
} from "@/lib/quizApi";

interface QuizStudentsModuleProps {
  students: Student[];
  attempts?: AdminAttemptView[];
  onCreateStudent: (payload: {
    fullName: string;
    schoolName: string;
    schoolLocation: string;
    level: CompetitionLevel;
    className: string;
    examCode?: string;
    pinCode?: string;
  }) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  onImportRegistrations: () => Promise<{ imported: number }>;
  onResetAttempt: (attemptId: string) => Promise<void>;
}

export default function QuizStudentsModule({
  students,
  attempts = [],
  onCreateStudent,
  onDeleteStudent,
  onImportRegistrations,
  onResetAttempt,
}: QuizStudentsModuleProps) {
  const [viewMode, setViewMode] = useState<"roster" | "attempts">("roster");
  const [filterLevel, setFilterLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolLocation, setSchoolLocation] = useState("Lagos");
  const [level, setLevel] = useState<CompetitionLevel>("junior");
  const [className, setClassName] = useState("Primary 5");

  // Index latest attempt per studentId from live /admin/attempts as authoritative fallback/enrichment
  const latestAttemptByStudentId = useMemo(() => {
    const map = new Map<string, AdminAttemptView>();
    for (const att of attempts) {
      const existing = map.get(att.studentId);
      if (
        !existing ||
        new Date(att.startedAt).getTime() > new Date(existing.startedAt).getTime()
      ) {
        map.set(att.studentId, att);
      }
    }
    return map;
  }, [attempts]);

  const enrichedStudents = useMemo(() => {
    return students.map((s) => ({
      ...s,
      latestAttempt:
        s.latestAttempt || latestAttemptByStudentId.get(s.id) || null,
    }));
  }, [students, latestAttemptByStudentId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrichedStudents.filter((s) => {
      if (filterLevel !== "all" && s.level !== filterLevel) return false;
      if (
        q &&
        !s.fullName.toLowerCase().includes(q) &&
        !s.schoolName.toLowerCase().includes(q) &&
        !s.examCode.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [enrichedStudents, filterLevel, search]);

  const filteredAttempts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return attempts.filter((a) => {
      if (filterLevel !== "all" && a.level !== filterLevel) return false;
      if (
        q &&
        !a.fullName.toLowerCase().includes(q) &&
        !a.schoolName.toLowerCase().includes(q) &&
        !a.examCode.toLowerCase().includes(q) &&
        !a.quizTitle.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [attempts, filterLevel, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onCreateStudent({
        fullName,
        schoolName,
        schoolLocation,
        level,
        className,
      });
      setFullName("");
      setAddOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register pupil");
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setNotice("");
    try {
      const res = await onImportRegistrations();
      setNotice(
        res.imported > 0
          ? `Imported ${res.imported} new pupil(s) with auto-generated Exam IDs & PINs.`
          : "All registered Evolve 8.0 pupils are already in the Student Roster."
      );
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Failed to import registrations"
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3b00b3]/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
            <KeyRound className="h-3.5 w-3.5" />
            Exam Credentials &amp; Live Attempts
          </span>
          <h2 className="mt-1.5 text-lg font-extrabold text-[#0d002b]">
            Student Roster &amp; Login Slips ({students.length} pupils ·{" "}
            {attempts.length} attempt{attempts.length === 1 ? "" : "s"})
          </h2>
          <p className="text-xs text-gray-500">
            Auto-generate Exam IDs &amp; 6-digit PINs for Primary 4 – SS3 pupils,
            print school login slips, monitor live quiz attempts &amp; tab
            switches, and reset disrupted sittings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#0d002b] hover:border-[#3b00b3]"
          >
            <DownloadCloud className="h-3.5 w-3.5" />
            <span>
              {importing ? "Importing..." : "Import Evolve Registrations"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPrintOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#100038] px-3.5 py-2.5 text-xs font-extrabold text-[#9dff13] hover:bg-[#3b00b3] hover:text-white transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Login Slips</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              setAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b00b3] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register Pupil</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          {notice}
        </div>
      )}

      {/* View Switcher + Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="inline-flex rounded-xl bg-[#faf9ff] p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => setViewMode("roster")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-colors ${
              viewMode === "roster"
                ? "bg-[#3b00b3] text-white"
                : "text-gray-600 hover:text-[#3b00b3]"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Student Roster ({students.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("attempts")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-colors ${
              viewMode === "attempts"
                ? "bg-[#3b00b3] text-white"
                : "text-gray-600 hover:text-[#3b00b3]"
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Attempts Log ({attempts.length})</span>
          </button>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Exam ID, student name, or school..."
            className="w-full rounded-xl border border-gray-200 bg-[#faf9ff] py-2 pl-9 pr-3 text-xs text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
          />
        </div>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold text-[#0d002b]"
        >
          <option value="all">All Levels</option>
          <option value="junior">Junior (Primary 4–6)</option>
          <option value="intermediate">Intermediate (JSS 1–3)</option>
          <option value="senior">Senior (SS 1–3)</option>
        </select>
      </div>

      {/* View 1: Student Roster Table */}
      {viewMode === "roster" ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-[#faf9ff] text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-4">Exam ID &amp; PIN</th>
                  <th className="py-3 px-4">Pupil &amp; School</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Attempt Status</th>
                  <th className="py-3 px-4">Score / Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => {
                  const att = s.latestAttempt;
                  return (
                    <tr key={s.id} className="hover:bg-[#faf9ff]/60">
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-extrabold text-[#3b00b3]">
                          {s.examCode}
                        </p>
                        {s.pinCode && (
                          <p className="mt-0.5 font-mono text-[11px] text-gray-500">
                            PIN: <strong>{s.pinCode}</strong>
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-[#0d002b]">
                          {s.fullName}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {s.schoolName}
                          {s.className ? ` · ${s.className}` : ""}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-full bg-[#100038] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#9dff13]">
                          {s.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {!att ? (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-600">
                            Not Started
                          </span>
                        ) : att.status === "in_progress" ? (
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700">
                            In Progress
                          </span>
                        ) : (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              att.passed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-800"
                            }`}
                          >
                            {att.passed ? "Submitted · Passed" : "Submitted"}
                          </span>
                        )}
                        {att && att.tabSwitchCount > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{att.tabSwitchCount} tab switch(es)</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {att && att.status !== "in_progress" ? (
                          <div>
                            <p className="font-extrabold text-[#0d002b]">
                              {att.scoreOutOf1000} / 1,000
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {att.rawCorrect}/{att.totalQuestions} ·{" "}
                              {formatDuration(att.timeTakenSeconds)}
                            </p>
                          </div>
                        ) : att ? (
                          <p className="text-[11px] font-bold text-blue-700">
                            Started{" "}
                            {new Date(att.startedAt).toLocaleTimeString()}
                          </p>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {att && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Reset ${s.fullName}'s quiz attempt so they can retake the exam?`
                                  )
                                ) {
                                  onResetAttempt(att.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                              title="Reset Attempt"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Reset</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Remove ${s.fullName} (${s.examCode}) from the roster?`
                                )
                              ) {
                                onDeleteStudent(s.id);
                              }
                            }}
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-red-300 hover:text-red-600"
                            title="Delete Student"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      <Users className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-2 font-bold text-[#0d002b]">
                        No students in roster
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View 2: Full Live Attempts Log */
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-[#faf9ff] text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Quiz</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score &amp; Accuracy</th>
                  <th className="py-3 px-4">Timing</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-[#faf9ff]/60">
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-[#0d002b]">
                        {att.fullName}
                      </p>
                      <p className="font-mono text-[11px] text-[#3b00b3]">
                        {att.examCode} ·{" "}
                        <span className="font-sans text-gray-500">
                          {att.schoolName}
                        </span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#0d002b]">{att.quizTitle}</p>
                      <span className="mt-0.5 inline-block rounded-full bg-[#100038] px-2 py-0.5 text-[9px] font-extrabold uppercase text-[#9dff13]">
                        {att.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          att.status === "in_progress"
                            ? "bg-blue-50 text-blue-700"
                            : att.passed
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {att.status === "in_progress"
                          ? "In Progress"
                          : att.passed
                          ? "Passed"
                          : "Submitted"}
                      </span>
                      {att.tabSwitchCount > 0 && (
                        <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          {att.tabSwitchCount} tab switch(es)
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-[#0d002b]">
                        {att.scoreOutOf1000} / 1,000
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {att.rawCorrect} / {att.totalQuestions} correct
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="inline-flex items-center gap-1 font-mono font-bold text-[#0d002b]">
                        <Clock className="h-3 w-3 text-[#3b00b3]" />
                        {formatDuration(att.timeTakenSeconds)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(att.startedAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Reset ${att.fullName}'s attempt so they can retake this quiz?`
                            )
                          ) {
                            onResetAttempt(att.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Reset</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredAttempts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      <ClipboardList className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-2 font-bold text-[#0d002b]">
                        No quiz attempts logged yet
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d002b]/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0d002b]">
                Register Pupil &amp; Generate Exam Slip
              </h3>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
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

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0d002b]">
                  Pupil Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Chidinma Okafor"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d002b]">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g., Gracefield Royal Academy"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) =>
                      setLevel(e.target.value as CompetitionLevel)
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold"
                  >
                    <option value="junior">Junior (P4–P6)</option>
                    <option value="intermediate">Intermediate (JSS 1–3)</option>
                    <option value="senior">Senior (SS 1–3)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Class
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g., Primary 6"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d002b]">
                  Location / State
                </label>
                <input
                  type="text"
                  value={schoolLocation}
                  onChange={(e) => setSchoolLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs"
                />
              </div>

              <p className="rounded-xl bg-[#faf6ff] p-3 text-[11px] text-gray-600">
                A unique <strong>Exam ID</strong> (e.g.,{" "}
                <code>EV8-JUN-XXXX</code>) and 6-digit <strong>PIN</strong>{" "}
                will be generated automatically.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#3b00b3] px-5 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
                >
                  {saving ? "Generating..." : "Create Student Slip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable School Login Slips Modal */}
      {printOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d002b]/70 p-4 overflow-y-auto print:static print:bg-white print:p-0">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 print:hidden">
              <div>
                <h3 className="text-base font-extrabold text-[#0d002b]">
                  Printable Evolve 8.0 School Login Slips ({filtered.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Cut along the dashed lines and hand one slip to each candidate
                  at the computer lab.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b00b3] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border-2 border-dashed border-[#3b00b3]/35 bg-[#faf9ff] p-4 break-inside-avoid"
                >
                  <div className="flex items-center justify-between border-b border-[#3b00b3]/15 pb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
                      Kingshouse · Evolve 8.0 Exam Slip
                    </span>
                    <span className="rounded bg-[#100038] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#9dff13]">
                      {levelLabel(s.level)}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs">
                    <p className="font-extrabold text-[#0d002b] text-sm">
                      {s.fullName}
                    </p>
                    <p className="text-gray-600">
                      {s.schoolName} {s.className ? `(${s.className})` : ""}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-white p-3 border border-gray-200">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400">
                        Exam ID
                      </p>
                      <p className="font-mono text-sm font-extrabold text-[#3b00b3]">
                        {s.examCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400">
                        6-Digit PIN
                      </p>
                      <p className="font-mono text-sm font-extrabold text-[#0d002b]">
                        {s.pinCode || "••••••"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[10px] text-gray-500">
                    Exam Portal: <strong>/evolve/quiz</strong> · Pass mark: 700
                    / 1,000 · Faster completion time breaks ties.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
