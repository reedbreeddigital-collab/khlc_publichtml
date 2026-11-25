"use client";

import React, { useState } from "react";
import {
  Cpu,
  ExternalLink,
  Award,
  CheckCircle2,
  Video,
  FileText,
  Save,
  X,
} from "lucide-react";

export interface JudgingScores {
  technical: number;
  problem: number;
  creativity: number;
  impact: number;
  teamwork: number;
  planning: number;
  video: number;
}

export interface ProjectSubmission {
  id: string;
  referenceId: string;
  schoolName: string;
  category: string;
  projectPath: string;
  projectTheme: string;
  supervisingTeacher: string;
  teamMembers: { name: string; className: string }[];
  problemStatement: string;
  solutionSummary: string;
  howItWorks: string;
  expectedImpact: string;
  milestones: string;
  wordCount: number;
  videoUrl?: string;
  instructorFeedback?: string;
  judgingScores: JudgingScores;
  totalMarks: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectSubmissionsModuleProps {
  submissions: ProjectSubmission[];
  onReviewProject: (
    id: string,
    patch: {
      instructorFeedback: string;
      status: string;
      judgingScores: JudgingScores;
    }
  ) => Promise<void>;
}

const RUBRIC_FIELDS: {
  key: keyof JudgingScores;
  label: string;
  max: number;
}[] = [
  { key: "technical", label: "Technical skill & working solution", max: 25 },
  { key: "problem", label: "Understanding of problem & SDG link", max: 15 },
  { key: "creativity", label: "Creativity & originality", max: 15 },
  { key: "impact", label: "Impact & usefulness", max: 15 },
  { key: "teamwork", label: "Teamwork & pupil ownership", max: 10 },
  { key: "planning", label: "Planning & progress", max: 10 },
  { key: "video", label: "3-minute video presentation", max: 10 },
];

const statusBadge: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-700",
  feedback_sent: "bg-purple-50 text-purple-700",
  video_submitted: "bg-cyan-50 text-cyan-800",
  finalist: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  winner: "bg-[#9dff13] text-[#0d002b]",
};

export default function ProjectSubmissionsModule({
  submissions,
  onReviewProject,
}: ProjectSubmissionsModuleProps) {
  const [selected, setSelected] = useState<ProjectSubmission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("submitted");
  const [scores, setScores] = useState<JudgingScores>({
    technical: 0,
    problem: 0,
    creativity: 0,
    impact: 0,
    teamwork: 0,
    planning: 0,
    video: 0,
  });
  const [saving, setSaving] = useState(false);

  const openReview = (sub: ProjectSubmission) => {
    setSelected(sub);
    setFeedback(sub.instructorFeedback || "");
    setStatus(sub.status || "submitted");
    setScores({
      technical: sub.judgingScores?.technical || 0,
      problem: sub.judgingScores?.problem || 0,
      creativity: sub.judgingScores?.creativity || 0,
      impact: sub.judgingScores?.impact || 0,
      teamwork: sub.judgingScores?.teamwork || 0,
      planning: sub.judgingScores?.planning || 0,
      video: sub.judgingScores?.video || 0,
    });
  };

  const totalScore = RUBRIC_FIELDS.reduce(
    (sum, f) => sum + Math.min(f.max, Math.max(0, Number(scores[f.key]) || 0)),
    0
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await onReviewProject(selected.id, {
        instructorFeedback: feedback,
        status,
        judgingScores: scores,
      });
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3b00b3]/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
            <Cpu className="h-3.5 w-3.5" />
            Phase 2 · Coding, AI &amp; Robotics Track
          </span>
          <h2 className="mt-1.5 text-lg font-extrabold text-[#0d002b]">
            Project Track Proposals, Videos &amp; Judging ({submissions.length})
          </h2>
          <p className="text-xs text-gray-500">
            Review school 6-section proposals (300/500-word limits), watch
            3-minute demo videos, send instructor feedback, and score out of 100
            marks.
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-[#3b00b3]/35" />
          <p className="mt-3 text-sm font-extrabold text-[#0d002b]">
            No Project Track submissions yet
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Registered schools can submit proposals &amp; 3-minute demo videos
            at <code>/evolve/projects</code>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-[#3b00b3]/30 transition-all"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-extrabold text-[#3b00b3]">
                    {sub.referenceId}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#100038] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#9dff13]">
                      {sub.category} · {sub.projectPath}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        statusBadge[sub.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {sub.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <h3 className="mt-2.5 text-base font-extrabold text-[#0d002b]">
                  {sub.schoolName}
                </h3>
                <p className="text-xs text-gray-500">
                  {sub.projectTheme} · Supervisor:{" "}
                  <strong>{sub.supervisingTeacher || "N/A"}</strong>
                </p>

                {sub.solutionSummary && (
                  <p className="mt-3 line-clamp-2 text-xs text-gray-600 leading-relaxed">
                    {sub.solutionSummary}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-500">
                  <span>{sub.wordCount} words</span>
                  <span>·</span>
                  <span>
                    {sub.videoUrl ? (
                      <a
                        href={sub.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#3b00b3] hover:underline"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Watch 3-Min Video
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      "Video pending"
                    )}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <Award className="h-3.5 w-3.5" />
                    {sub.totalMarks} / 100 marks
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3.5">
                <span className="text-[11px] text-gray-400">
                  {sub.instructorFeedback
                    ? "Feedback sent ✓"
                    : "Awaiting instructor review"}
                </span>
                <button
                  type="button"
                  onClick={() => openReview(sub)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b00b3] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Review &amp; Judge</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & 100-Mark Rubric Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d002b]/65 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="font-mono text-xs font-extrabold text-[#3b00b3]">
                  {selected.referenceId} · {selected.category} ·{" "}
                  {selected.projectPath}
                </span>
                <h3 className="text-lg font-extrabold text-[#0d002b]">
                  {selected.schoolName}
                </h3>
                <p className="text-xs text-gray-500">{selected.projectTheme}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Proposal Content */}
            <div className="mt-4 space-y-3 rounded-2xl bg-[#faf9ff] p-4 text-xs">
              <div>
                <p className="font-extrabold text-[#3b00b3]">The Problem</p>
                <p className="mt-0.5 text-gray-700">
                  {selected.problemStatement || "—"}
                </p>
              </div>
              <div>
                <p className="font-extrabold text-[#3b00b3]">Our Solution</p>
                <p className="mt-0.5 text-gray-700">
                  {selected.solutionSummary || "—"}
                </p>
              </div>
              <div>
                <p className="font-extrabold text-[#3b00b3]">How It Works</p>
                <p className="mt-0.5 text-gray-700">
                  {selected.howItWorks || "—"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="font-extrabold text-[#3b00b3]">Expected Impact</p>
                  <p className="mt-0.5 text-gray-700">
                    {selected.expectedImpact || "—"}
                  </p>
                </div>
                <div>
                  <p className="font-extrabold text-[#3b00b3]">
                    Plan &amp; Milestones
                  </p>
                  <p className="mt-0.5 text-gray-700">
                    {selected.milestones || "—"}
                  </p>
                </div>
              </div>
              {selected.videoUrl && (
                <div className="pt-2 border-t border-gray-200">
                  <a
                    href={selected.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-extrabold text-[#3b00b3] underline"
                  >
                    <Video className="h-4 w-4" />
                    <span>Open 3-Minute Project Demo Video ↗</span>
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-5">
              {/* 100-Mark Rubric */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-[#0d002b]">
                    Official 100-Mark Judging Rubric
                  </h4>
                  <span className="rounded-full bg-[#100038] px-3 py-1 text-xs font-extrabold text-[#9dff13]">
                    Total: {totalScore} / 100
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {RUBRIC_FIELDS.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2"
                    >
                      <label className="text-xs font-bold text-[#0d002b]">
                        {field.label}{" "}
                        <span className="text-gray-400">/{field.max}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={field.max}
                        value={scores[field.key]}
                        onChange={(e) =>
                          setScores((prev) => ({
                            ...prev,
                            [field.key]: Number(e.target.value),
                          }))
                        }
                        className="w-16 rounded-lg border border-gray-200 bg-[#faf9ff] px-2 py-1 text-right text-xs font-extrabold text-[#3b00b3]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Instructor Proposal Feedback (Visible to School via Lookup)
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share actionable guidance to help the team refine their build and 3-minute demo video..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Submission Stage
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2.5 text-xs font-extrabold text-[#0d002b]"
                  >
                    <option value="submitted">Proposal Submitted</option>
                    <option value="feedback_sent">Feedback Sent</option>
                    <option value="video_submitted">3-Min Video Submitted</option>
                    <option value="finalist">Grand Finals Finalist</option>
                    <option value="winner">Grand Finals Winner</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b00b3] px-5 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? "Saving..." : "Save Review & Scores"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
