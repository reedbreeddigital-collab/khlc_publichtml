"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Cpu,
  FileText,
  Video,
  Search,
  CheckCircle2,
  ArrowLeft,
  Send,
  Sparkles,
  Award,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import KhlcLogo from "@/components/KhlcLogo";
import FooterSection from "@/components/FooterSection";
import { sdgThemes, type EvolveCategory, type EvolvePath } from "@/data/evolve";
import { apiRequest } from "@/lib/quizApi";
import type { ProjectSubmission } from "@/components/admin/ProjectSubmissionsModule";

interface LookupResponse {
  submission: ProjectSubmission | null;
  registration: {
    referenceId: string;
    schoolName: string;
    category?: string;
    projectPath?: string;
    projectTheme?: string;
    supervisingTeacher?: string;
    teamMembers?: { name: string; className: string }[];
  } | null;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export default function EvolveProjectsPortalPage() {
  const [activeTab, setActiveTab] = useState<"submit" | "status">("submit");

  // Lookup state
  const [lookupRef, setLookupRef] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResult, setLookupResult] = useState<ProjectSubmission | null>(
    null
  );
  const [prefillNotice, setPrefillNotice] = useState("");

  // Form fields
  const [referenceId, setReferenceId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [category, setCategory] = useState<EvolveCategory>("Primary");
  const [projectPath, setProjectPath] = useState<EvolvePath>("Coding");
  const [projectTheme, setProjectTheme] = useState(
    `Theme 1: ${sdgThemes[0].title} (${sdgThemes[0].sdg})`
  );
  const [supervisingTeacher, setSupervisingTeacher] = useState("");
  const [teamMembers, setTeamMembers] = useState([
    { name: "", className: "" },
    { name: "", className: "" },
    { name: "", className: "" },
    { name: "", className: "" },
    { name: "", className: "" },
  ]);
  const [problemStatement, setProblemStatement] = useState("");
  const [solutionSummary, setSolutionSummary] = useState("");
  const [howItWorks, setHowItWorks] = useState("");
  const [expectedImpact, setExpectedImpact] = useState("");
  const [milestones, setMilestones] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [savedSubmission, setSavedSubmission] =
    useState<ProjectSubmission | null>(null);

  const limits = useMemo(
    () =>
      category === "Primary"
        ? {
            problem: 60,
            solution: 90,
            how: 60,
            impact: 30,
            milestones: 60,
            total: 300,
          }
        : {
            problem: 100,
            solution: 150,
            how: 100,
            impact: 50,
            milestones: 100,
            total: 500,
          },
    [category]
  );

  const counts = useMemo(
    () => ({
      problem: countWords(problemStatement),
      solution: countWords(solutionSummary),
      how: countWords(howItWorks),
      impact: countWords(expectedImpact),
      milestones: countWords(milestones),
    }),
    [problemStatement, solutionSummary, howItWorks, expectedImpact, milestones]
  );

  const totalWords =
    counts.problem +
    counts.solution +
    counts.how +
    counts.impact +
    counts.milestones;
  const overLimit = totalWords > limits.total + 25;

  const applyLookup = async (refCode: string) => {
    const clean = refCode.trim().toUpperCase();
    if (!clean) return;
    setLookingUp(true);
    setLookupError("");
    setPrefillNotice("");
    try {
      const res = await apiRequest<LookupResponse>(
        `/api/v1/evolve/projects/lookup?ref=${encodeURIComponent(clean)}`
      );
      if (res.submission) {
        const s = res.submission;
        setLookupResult(s);
        setReferenceId(s.referenceId);
        setSchoolName(s.schoolName);
        if (s.category === "Primary" || s.category === "Secondary") {
          setCategory(s.category);
        }
        if (
          s.projectPath === "Coding" ||
          s.projectPath === "AI" ||
          s.projectPath === "Robotics"
        ) {
          setProjectPath(s.projectPath);
        }
        if (s.projectTheme) setProjectTheme(s.projectTheme);
        if (s.supervisingTeacher) setSupervisingTeacher(s.supervisingTeacher);
        if (s.teamMembers && s.teamMembers.length > 0) {
          const padded = [...s.teamMembers];
          while (padded.length < 5) padded.push({ name: "", className: "" });
          setTeamMembers(padded.slice(0, 5));
        }
        setProblemStatement(s.problemStatement || "");
        setSolutionSummary(s.solutionSummary || "");
        setHowItWorks(s.howItWorks || "");
        setExpectedImpact(s.expectedImpact || "");
        setMilestones(s.milestones || "");
        setVideoUrl(s.videoUrl || "");
        setPrefillNotice(
          `Loaded existing Project Track submission for ${s.schoolName} (${s.referenceId}). You can update your proposal or add your 3-minute video link below.`
        );
      } else if (res.registration) {
        const reg = res.registration;
        setLookupResult(null);
        setReferenceId(reg.referenceId);
        setSchoolName(reg.schoolName);
        if (reg.category === "Primary" || reg.category === "Secondary") {
          setCategory(reg.category);
        }
        if (
          reg.projectPath === "Coding" ||
          reg.projectPath === "AI" ||
          reg.projectPath === "Robotics"
        ) {
          setProjectPath(reg.projectPath);
        }
        if (reg.projectTheme) setProjectTheme(reg.projectTheme);
        if (reg.supervisingTeacher)
          setSupervisingTeacher(reg.supervisingTeacher);
        if (reg.teamMembers && reg.teamMembers.length > 0) {
          const padded = [...reg.teamMembers];
          while (padded.length < 5) padded.push({ name: "", className: "" });
          setTeamMembers(padded.slice(0, 5));
        }
        setPrefillNotice(
          `Prefilled team details from Evolve 8.0 Registration ${reg.referenceId} (${reg.schoolName}).`
        );
      }
    } catch (err) {
      setLookupResult(null);
      setLookupError(
        err instanceof Error ? err.message : "Reference ID not found"
      );
    } finally {
      setLookingUp(false);
    }
  };

  // Auto-read ?ref=EV8-XXXX if linked from registration confirmation slip
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setLookupRef(ref.toUpperCase());
      setReferenceId(ref.toUpperCase());
      void applyLookup(ref);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await apiRequest<{ data: ProjectSubmission }>(
        "/api/v1/evolve/projects",
        {
          method: "POST",
          body: {
            referenceId: referenceId.trim().toUpperCase(),
            schoolName: schoolName.trim(),
            category,
            projectPath,
            projectTheme,
            supervisingTeacher: supervisingTeacher.trim(),
            teamMembers: teamMembers.filter((m) => m.name.trim() !== ""),
            problemStatement,
            solutionSummary,
            howItWorks,
            expectedImpact,
            milestones,
            videoUrl: videoUrl.trim(),
          },
        }
      );
      setSavedSubmission(res.data);
      setLookupResult(res.data);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit project"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f3fa] text-[#0d002b] flex flex-col">
      {/* Header & Hero */}
      <div className="bg-[#100038] text-white">
        <header className="border-b border-white/10 bg-[#140047]/90 px-4 py-3.5 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/evolve" className="flex items-center gap-3">
              <KhlcLogo className="h-9 w-auto" variant="dark" />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#9dff13]/15 px-3 py-1 text-[11px] font-extrabold text-[#9dff13]">
                <Cpu className="h-3.5 w-3.5" />
                PROJECT TRACK PORTAL
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/evolve/quiz"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/90 hover:border-[#38e0ff] hover:text-[#38e0ff]"
              >
                Online Test
              </Link>
              <Link
                href="/evolve/results"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/90 hover:border-[#9dff13] hover:text-[#9dff13]"
              >
                Results
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

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9dff13]/30 bg-white/5 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#9dff13]">
            <Sparkles className="h-3.5 w-3.5" />
            Phase 2 · Coding, AI &amp; Robotics Submissions
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold">
            Submit Your <span className="text-[#9dff13]">Project Proposal</span>{" "}
            &amp; <span className="text-[#38e0ff]">3-Minute Video</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-white/75">
            Enter your school&apos;s Evolve 8.0 Registration Reference ID (e.g.,{" "}
            <strong className="font-mono text-[#9dff13]">EV8-1234</strong>) to
            submit your 6-section proposal, attach your 3-minute project demo
            video link, and check instructor feedback.
          </p>

          {/* Reference ID Lookup Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void applyLookup(lookupRef);
            }}
            className="mx-auto mt-6 flex max-w-lg flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={lookupRef}
                onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                placeholder="Enter Registration Ref (e.g. EV8-1234)"
                className="w-full rounded-xl bg-white py-3 pl-10 pr-4 font-mono text-xs sm:text-sm font-extrabold uppercase text-[#0d002b] placeholder:font-sans placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#9dff13]"
              />
            </div>
            <button
              type="submit"
              disabled={lookingUp}
              className="rounded-xl bg-[#9dff13] px-5 py-3 text-xs sm:text-sm font-extrabold text-[#0d002b] hover:bg-[#38e0ff] transition-colors disabled:opacity-50"
            >
              {lookingUp ? "Searching..." : "Load / Check Status"}
            </button>
          </form>

          {prefillNotice && (
            <p className="mx-auto mt-3 max-w-xl rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 text-xs font-bold text-[#9dff13]">
              {prefillNotice}
            </p>
          )}
          {lookupError && (
            <p className="mx-auto mt-3 max-w-xl rounded-xl bg-amber-500/20 border border-amber-400/30 px-4 py-2 text-xs font-bold text-amber-200">
              {lookupError} — you can still enter your details manually below.
            </p>
          )}
        </section>
      </div>

      {/* Main Portal */}
      <section className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 space-y-6">
        {/* Tabs */}
        <div className="inline-flex gap-2 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("submit")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
              activeTab === "submit"
                ? "bg-[#3b00b3] text-white shadow-sm"
                : "text-[#0d002b] hover:bg-[#faf6ff]"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Submit / Update Proposal &amp; Video</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
              activeTab === "status"
                ? "bg-[#3b00b3] text-white shadow-sm"
                : "text-[#0d002b] hover:bg-[#faf6ff]"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Feedback &amp; Judging Status</span>
          </button>
        </div>

        {/* Saved Confirmation Banner */}
        {savedSubmission && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
              <div>
                <h2 className="text-base font-extrabold text-emerald-950">
                  Project Submission Received!
                </h2>
                <p className="mt-1 text-xs text-emerald-800">
                  Reference:{" "}
                  <strong className="font-mono">
                    {savedSubmission.referenceId}
                  </strong>{" "}
                  · School: <strong>{savedSubmission.schoolName}</strong> · Word
                  count: <strong>{savedSubmission.wordCount}</strong> · Status:{" "}
                  <strong className="uppercase">
                    {savedSubmission.status.replace("_", " ")}
                  </strong>
                </p>
                <p className="mt-1.5 text-xs text-emerald-700">
                  You can return anytime using your Reference ID to read
                  instructor feedback or attach your 3-minute demo video URL
                  before the late-February deadline.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "status" ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
            {lookupResult ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-[#3b00b3]">
                      {lookupResult.referenceId} · {lookupResult.category} ·{" "}
                      {lookupResult.projectPath}
                    </span>
                    <h2 className="mt-1 text-xl font-extrabold text-[#0d002b]">
                      {lookupResult.schoolName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {lookupResult.projectTheme}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#100038] px-3.5 py-1.5 text-xs font-extrabold uppercase text-[#9dff13]">
                    {lookupResult.status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#faf9ff] p-4">
                    <p className="text-[10px] font-bold uppercase text-gray-400">
                      Proposal Word Count
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-[#0d002b]">
                      {lookupResult.wordCount} words
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#faf9ff] p-4">
                    <p className="text-[10px] font-bold uppercase text-gray-400">
                      3-Min Demo Video
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-[#3b00b3]">
                      {lookupResult.videoUrl ? "Submitted ✓" : "Pending"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#faf9ff] p-4">
                    <p className="text-[10px] font-bold uppercase text-gray-400">
                      Judging Score
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-emerald-700">
                      {lookupResult.totalMarks > 0
                        ? `${lookupResult.totalMarks} / 100`
                        : "Pending Review"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#3b00b3]/15 bg-[#faf6ff] p-5">
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#3b00b3]">
                    <MessageSquare className="h-4 w-4" />
                    <span>Kingshouse Instructor Feedback</span>
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {lookupResult.instructorFeedback ||
                      "Your proposal is queued for instructor review. Tailored feedback will appear here once evaluated."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <Search className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm font-extrabold text-[#0d002b]">
                  Enter your Registration Reference ID above
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  We will display your proposal status, instructor feedback, and
                  finalist qualification here.
                </p>
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6"
          >
            {submitError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Section 1: Team Details */}
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
                Section 1 · Team Details (Not Counted Toward Word Limit)
              </span>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Registration Reference ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={referenceId}
                    onChange={(e) =>
                      setReferenceId(e.target.value.toUpperCase())
                    }
                    placeholder="e.g., EV8-1234"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 font-mono text-xs sm:text-sm font-extrabold uppercase focus:border-[#3b00b3] focus:bg-white focus:outline-none"
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
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as EvolveCategory)
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm font-bold"
                  >
                    <option value="Primary">Primary (Max 300 words)</option>
                    <option value="Secondary">Secondary (Max 500 words)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Chosen Path *
                  </label>
                  <select
                    value={projectPath}
                    onChange={(e) =>
                      setProjectPath(e.target.value as EvolvePath)
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm font-bold"
                  >
                    <option value="Coding">Coding</option>
                    <option value="AI">Artificial Intelligence (AI)</option>
                    <option value="Robotics">Robotics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    UN SDG Theme *
                  </label>
                  <select
                    value={projectTheme}
                    onChange={(e) => setProjectTheme(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm font-bold"
                  >
                    {sdgThemes.map((t) => {
                      const val = `Theme ${t.number}: ${t.title} (${t.sdg})`;
                      return (
                        <option key={t.number} value={val}>
                          {val}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Supervising Teacher *
                  </label>
                  <input
                    type="text"
                    required
                    value={supervisingTeacher}
                    onChange={(e) => setSupervisingTeacher(e.target.value)}
                    placeholder="Full name of supervising teacher"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-[#0d002b]">
                  5-Pupil Team Roster
                </p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {teamMembers.map((m, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) =>
                          setTeamMembers((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, name: e.target.value }
                                : item
                            )
                          )
                        }
                        placeholder={`Pupil ${idx + 1} Full Name`}
                        className="flex-1 rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        value={m.className}
                        onChange={(e) =>
                          setTeamMembers((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, className: e.target.value }
                                : item
                            )
                          )
                        }
                        placeholder="Class"
                        className="w-24 rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sections 2-6: Official Proposal With Live Word Counter */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
                  Sections 2–6 · Written Proposal ({category})
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                    overLimit
                      ? "bg-red-100 text-red-700"
                      : "bg-[#100038] text-[#9dff13]"
                  }`}
                >
                  Total Words: {totalWords} / {limits.total}
                </span>
              </div>

              {(
                [
                  {
                    label: "2. The Problem",
                    hint: "What problem will you solve, who is affected, and which SDG does it link to?",
                    val: problemStatement,
                    setter: setProblemStatement,
                    count: counts.problem,
                    max: limits.problem,
                  },
                  {
                    label: "3. Our Solution",
                    hint: "What will you build and how will it help?",
                    val: solutionSummary,
                    setter: setSolutionSummary,
                    count: counts.solution,
                    max: limits.solution,
                  },
                  {
                    label: "4. How It Works",
                    hint: "Main tools, parts, software, or AI methods you will use.",
                    val: howItWorks,
                    setter: setHowItWorks,
                    count: counts.how,
                    max: limits.how,
                  },
                  {
                    label: "5. Expected Impact",
                    hint: "Who benefits and how will you know it works?",
                    val: expectedImpact,
                    setter: setExpectedImpact,
                    count: counts.impact,
                    max: limits.impact,
                  },
                  {
                    label: "6. Plan and Milestones",
                    hint: "3 or 4 milestones with the pupil responsible for each.",
                    val: milestones,
                    setter: setMilestones,
                    count: counts.milestones,
                    max: limits.milestones,
                  },
                ] as const
              ).map((sec) => (
                <div key={sec.label}>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-extrabold text-[#0d002b]">
                      {sec.label}
                    </label>
                    <span
                      className={`text-[11px] font-bold ${
                        sec.count > sec.max ? "text-amber-700" : "text-gray-400"
                      }`}
                    >
                      {sec.count} / {sec.max} words
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">{sec.hint}</p>
                  <textarea
                    rows={3}
                    value={sec.val}
                    onChange={(e) => sec.setter(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* 3-Minute Demo Video URL */}
            <div className="border-t border-gray-100 pt-6">
              <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#3b00b3]">
                <Video className="h-4 w-4" />
                <span>3-Minute Project Demo Video URL (Optional Now / Required by Late Feb)</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Paste an unlisted YouTube, Google Drive (public view link), or
                Vimeo link showcasing your finished working project (max 3
                minutes).
              </p>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/... or https://drive.google.com/file/d/..."
                className="mt-2 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
              <p className="text-[11px] text-gray-500">
                You can update this submission anytime using your Reference ID.
              </p>
              <button
                type="submit"
                disabled={submitting || overLimit}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3b00b3] px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>
                  {submitting
                    ? "Submitting..."
                    : "Save Project Submission"}
                </span>
              </button>
            </div>
          </form>
        )}
      </section>

      <FooterSection />
    </main>
  );
}
