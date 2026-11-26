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
  Users,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Building2,
  Save,
  LogOut,
  Share2,
} from "lucide-react";
import KhlcLogo from "@/components/KhlcLogo";
import FooterSection from "@/components/FooterSection";
import { sdgThemes, type EvolveCategory, type EvolvePath } from "@/data/evolve";
import {
  apiRequest,
  levelLabel,
  type Student,
  type CompetitionLevel,
} from "@/lib/quizApi";
import type { ProjectSubmission } from "@/components/admin/ProjectSubmissionsModule";

interface RegistrarSchoolRegistration {
  id: string;
  referenceId: string;
  track: string;
  schoolName: string;
  schoolLocation: string;
  schoolAddress?: string;
  schoolType?: string;
  coordinatorName: string;
  coordinatorRole?: string;
  phone: string;
  email: string;
  projectCategory?: string;
  projectPath?: string;
  projectTheme?: string;
  supervisingTeacher?: string;
  projectTeam?: { name: string; className: string; videoUrl?: string }[];
  createdAt?: string;
}

interface RegistrarDashboardResponse {
  registration: RegistrarSchoolRegistration;
  matchingRegistrations: RegistrarSchoolRegistration[];
  students: Student[];
}

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

const REGISTRAR_SESSION_KEY = "khlc_registrar_ref_v1";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function detectSocialPlatform(url: string): string {
  const lower = url.trim().toLowerCase();
  if (!lower) return "";
  if (lower.includes("instagram.com") || lower.includes("instagr.am"))
    return "Instagram";
  if (lower.includes("tiktok.com")) return "TikTok";
  if (lower.includes("youtube.com") || lower.includes("youtu.be"))
    return "YouTube";
  if (lower.includes("facebook.com") || lower.includes("fb.watch"))
    return "Facebook";
  if (lower.includes("twitter.com") || lower.includes("x.com"))
    return "X / Twitter";
  if (lower.includes("linkedin.com")) return "LinkedIn";
  if (lower.includes("drive.google.com")) return "Google Drive";
  if (lower.includes("vimeo.com")) return "Vimeo";
  return "Social / Video Link";
}

export default function EvolveProjectsPortalPage() {
  const [activeTab, setActiveTab] = useState<
    "students" | "submit" | "status"
  >("students");

  // Lookup state
  const [lookupInput, setLookupInput] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResult, setLookupResult] = useState<ProjectSubmission | null>(
    null
  );
  const [prefillNotice, setPrefillNotice] = useState("");

  // Registrar Dashboard state
  const [activeReg, setActiveReg] =
    useState<RegistrarSchoolRegistration | null>(null);
  const [matchingRegs, setMatchingRegs] = useState<
    RegistrarSchoolRegistration[]
  >([]);
  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([]);
  const [videoDrafts, setVideoDrafts] = useState<Record<string, string>>({});
  const [savingStudentId, setSavingStudentId] = useState<string>("");
  const [savingAllVideos, setSavingAllVideos] = useState(false);
  const [savedStudentNotice, setSavedStudentNotice] = useState<
    Record<string, string>
  >({});
  const [studentVideoError, setStudentVideoError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  // Add Student in Registrar Dashboard state
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentLevel, setNewStudentLevel] =
    useState<CompetitionLevel>("junior");
  const [newStudentClass, setNewStudentClass] = useState("");
  const [newStudentVideo, setNewStudentVideo] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  // Proposal Form fields
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

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === id ? "" : prev));
      }, 2000);
    } catch {
      // ignore
    }
  };

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

  const populateDraftsFromStudents = (students: Student[]) => {
    const drafts: Record<string, string> = {};
    for (const s of students) {
      drafts[s.id] = s.phase2VideoUrl || "";
    }
    setVideoDrafts(drafts);
  };

  const applyLookup = async (rawQuery: string, specificRef?: string) => {
    const clean = (specificRef || rawQuery).trim();
    if (!clean) return;
    setLookingUp(true);
    setLookupError("");
    setPrefillNotice("");
    setStudentVideoError("");

    try {
      const isRefFormat = /^EV8-/i.test(clean);
      const dashQuery = specificRef
        ? `ref=${encodeURIComponent(specificRef.toUpperCase())}`
        : isRefFormat
        ? `ref=${encodeURIComponent(clean.toUpperCase())}`
        : `query=${encodeURIComponent(clean)}`;

      const dashRes = await apiRequest<RegistrarDashboardResponse>(
        `/api/v1/evolve/registrar/dashboard?${dashQuery}`
      );

      const reg = dashRes.registration;
      setActiveReg(reg);
      setMatchingRegs(dashRes.matchingRegistrations || [reg]);
      setRegisteredStudents(dashRes.students || []);
      populateDraftsFromStudents(dashRes.students || []);

      try {
        window.sessionStorage.setItem(REGISTRAR_SESSION_KEY, reg.referenceId);
      } catch {
        // ignore
      }

      // Sync proposal form fields from registration
      setReferenceId(reg.referenceId);
      setSchoolName(reg.schoolName);
      if (
        reg.projectCategory === "Primary" ||
        reg.projectCategory === "Secondary"
      ) {
        setCategory(reg.projectCategory);
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
      if (reg.projectTeam && reg.projectTeam.length > 0) {
        const padded = reg.projectTeam.map((m) => ({
          name: m.name,
          className: m.className,
        }));
        while (padded.length < 5) padded.push({ name: "", className: "" });
        setTeamMembers(padded.slice(0, 5));
      }

      // Also check existing project proposal submission for this referenceId
      try {
        const projRes = await apiRequest<LookupResponse>(
          `/api/v1/evolve/projects/lookup?ref=${encodeURIComponent(
            reg.referenceId
          )}`
        );
        if (projRes.submission) {
          const s = projRes.submission;
          setLookupResult(s);
          setProblemStatement(s.problemStatement || "");
          setSolutionSummary(s.solutionSummary || "");
          setHowItWorks(s.howItWorks || "");
          setExpectedImpact(s.expectedImpact || "");
          setMilestones(s.milestones || "");
          setVideoUrl(s.videoUrl || "");
        } else {
          setLookupResult(null);
        }
      } catch {
        setLookupResult(null);
      }

      setPrefillNotice(
        `Loaded Teacher / Registrar Dashboard for ${reg.schoolName} (${
          reg.referenceId
        }) — ${(dashRes.students || []).length} registered student(s).`
      );
    } catch (err) {
      // Fallback: check if there's a standalone project submission by ref
      try {
        const projRes = await apiRequest<LookupResponse>(
          `/api/v1/evolve/projects/lookup?ref=${encodeURIComponent(
            clean.toUpperCase()
          )}`
        );
        if (projRes.submission) {
          const s = projRes.submission;
          setLookupResult(s);
          setReferenceId(s.referenceId);
          setSchoolName(s.schoolName);
          setProblemStatement(s.problemStatement || "");
          setSolutionSummary(s.solutionSummary || "");
          setHowItWorks(s.howItWorks || "");
          setExpectedImpact(s.expectedImpact || "");
          setMilestones(s.milestones || "");
          setVideoUrl(s.videoUrl || "");
          setPrefillNotice(
            `Loaded Project Track submission for ${s.schoolName} (${s.referenceId}).`
          );
          return;
        }
      } catch {
        // ignore fallback error
      }
      setActiveReg(null);
      setRegisteredStudents([]);
      setLookupResult(null);
      setLookupError(
        err instanceof Error
          ? err.message
          : "No registration found for that Reference ID or coordinator email"
      );
    } finally {
      setLookingUp(false);
    }
  };

  // Auto-read ?ref=EV8-XXXX or session storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setLookupInput(ref.toUpperCase());
      setReferenceId(ref.toUpperCase());
      void applyLookup(ref);
      return;
    }
    try {
      const savedRef = window.sessionStorage.getItem(REGISTRAR_SESSION_KEY);
      if (savedRef) {
        setLookupInput(savedRef);
        void applyLookup(savedRef);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSignOutRegistrar = () => {
    setActiveReg(null);
    setMatchingRegs([]);
    setRegisteredStudents([]);
    setVideoDrafts({});
    setLookupInput("");
    setPrefillNotice("");
    setLookupError("");
    try {
      window.sessionStorage.removeItem(REGISTRAR_SESSION_KEY);
    } catch {
      // ignore
    }
  };

  const handleSaveStudentVideo = async (student: Student) => {
    if (!activeReg) return;
    const draftUrl = (videoDrafts[student.id] ?? "").trim();
    setSavingStudentId(student.id);
    setStudentVideoError("");
    try {
      const res = await apiRequest<{ data: Student; message: string }>(
        `/api/v1/evolve/registrar/students/${encodeURIComponent(
          student.id
        )}/video`,
        {
          method: "PATCH",
          body: {
            referenceId: activeReg.referenceId,
            videoUrl: draftUrl,
          },
        }
      );
      setRegisteredStudents((prev) =>
        prev.map((s) =>
          s.id === student.id
            ? {
                ...s,
                phase2VideoUrl: res.data.phase2VideoUrl,
                phase2VideoUpdatedAt: res.data.phase2VideoUpdatedAt,
              }
            : s
        )
      );
      setSavedStudentNotice((prev) => ({
        ...prev,
        [student.id]: draftUrl ? "Video Link Saved ✓" : "Cleared",
      }));
      window.setTimeout(() => {
        setSavedStudentNotice((prev) => {
          const next = { ...prev };
          delete next[student.id];
          return next;
        });
      }, 3000);
    } catch (err) {
      setStudentVideoError(
        err instanceof Error
          ? err.message
          : `Failed to save video link for ${student.fullName}`
      );
    } finally {
      setSavingStudentId("");
    }
  };

  const handleSaveAllStudentVideos = async () => {
    if (!activeReg || registeredStudents.length === 0) return;
    setSavingAllVideos(true);
    setStudentVideoError("");
    try {
      for (const stu of registeredStudents) {
        const draft = (videoDrafts[stu.id] ?? "").trim();
        const current = (stu.phase2VideoUrl ?? "").trim();
        if (draft !== current) {
          await handleSaveStudentVideo(stu);
        }
      }
    } finally {
      setSavingAllVideos(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReg || !newStudentName.trim()) return;
    setAddingStudent(true);
    setStudentVideoError("");
    try {
      const res = await apiRequest<{ data: Student }>(
        "/api/v1/evolve/registrar/students",
        {
          method: "POST",
          body: {
            referenceId: activeReg.referenceId,
            fullName: newStudentName.trim(),
            level: newStudentLevel,
            className: newStudentClass.trim(),
            videoUrl: newStudentVideo.trim(),
          },
        }
      );
      const created = res.data;
      setRegisteredStudents((prev) => [...prev, created]);
      setVideoDrafts((prev) => ({
        ...prev,
        [created.id]: created.phase2VideoUrl || "",
      }));
      setNewStudentName("");
      setNewStudentClass("");
      setNewStudentVideo("");
      setAddStudentOpen(false);
    } catch (err) {
      setStudentVideoError(
        err instanceof Error ? err.message : "Failed to add student"
      );
    } finally {
      setAddingStudent(false);
    }
  };

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

  const uploadedVideosCount = registeredStudents.filter(
    (s) => s.phase2VideoUrl && s.phase2VideoUrl.trim() !== ""
  ).length;

  const hasUnsavedVideoChanges = registeredStudents.some(
    (s) => (videoDrafts[s.id] ?? "").trim() !== (s.phase2VideoUrl ?? "").trim()
  );

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
                TEACHER &amp; REGISTRAR DASHBOARD
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

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9dff13]/30 bg-white/5 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#9dff13]">
            <Sparkles className="h-3.5 w-3.5" />
            Teacher / Registrar Portal · Phase 2 Student Videos &amp; Proposals
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold">
            Teacher &amp; Registrar{" "}
            <span className="text-[#9dff13]">Phase 2 Video</span> Dashboard
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-white/75">
            Enter your school&apos;s Registration Reference ID (e.g.,{" "}
            <strong className="font-mono text-[#9dff13]">EV8-1234</strong>) or
            your registered coordinator email/phone to view all students
            registered under you and upload their{" "}
            <strong className="text-white">
              Phase 2 social media video links
            </strong>{" "}
            anytime.
          </p>

          {/* Reference ID / Coordinator Email Lookup Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void applyLookup(lookupInput);
            }}
            className="mx-auto mt-6 flex max-w-xl flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="Enter Reference ID (e.g. EV8-1234) or Coordinator Email"
                className="w-full rounded-xl bg-white py-3 pl-10 pr-4 text-xs sm:text-sm font-bold text-[#0d002b] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#9dff13]"
              />
            </div>
            <button
              type="submit"
              disabled={lookingUp}
              className="rounded-xl bg-[#9dff13] px-5 py-3 text-xs sm:text-sm font-extrabold text-[#0d002b] hover:bg-[#38e0ff] transition-colors disabled:opacity-50"
            >
              {lookingUp ? "Loading..." : "Open Registrar Dashboard"}
            </button>
          </form>

          {prefillNotice && (
            <p className="mx-auto mt-3 max-w-xl rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 text-xs font-bold text-[#9dff13]">
              {prefillNotice}
            </p>
          )}
          {lookupError && (
            <p className="mx-auto mt-3 max-w-xl rounded-xl bg-amber-500/20 border border-amber-400/30 px-4 py-2 text-xs font-bold text-amber-200">
              {lookupError}
            </p>
          )}
        </section>
      </div>

      {/* Main Portal */}
      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 space-y-6">
        {/* Multi-registration switcher if coordinator email has multiple registrations */}
        {matchingRegs.length > 1 && activeReg && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm">
            <span className="text-xs font-extrabold text-[#0d002b]">
              Your School Registrations ({matchingRegs.length}):
            </span>
            {matchingRegs.map((reg) => {
              const isCurrent = reg.referenceId === activeReg.referenceId;
              return (
                <button
                  key={reg.referenceId}
                  type="button"
                  onClick={() => void applyLookup(reg.referenceId, reg.referenceId)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-colors ${
                    isCurrent
                      ? "bg-[#3b00b3] text-white"
                      : "bg-[#faf9ff] text-[#0d002b] hover:bg-[#3b00b3]/10"
                  }`}
                >
                  {reg.referenceId} · {reg.schoolName}
                </button>
              );
            })}
          </div>
        )}

        {/* Active School Header Strip */}
        {activeReg && (
          <div className="rounded-3xl border border-[#3b00b3]/15 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#100038] text-[#9dff13]">
                  <Building2 className="h-6 w-6" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#3b00b3]/10 px-3 py-0.5 font-mono text-xs font-extrabold text-[#3b00b3]">
                      Ref: {activeReg.referenceId}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800">
                      {uploadedVideosCount} / {registeredStudents.length} Student
                      Videos Uploaded
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-xl font-extrabold text-[#0d002b]">
                    {activeReg.schoolName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Registrar / Coordinator:{" "}
                    <strong className="text-[#0d002b]">
                      {activeReg.coordinatorName}
                    </strong>
                    {activeReg.coordinatorRole
                      ? ` (${activeReg.coordinatorRole})`
                      : ""}{" "}
                    · {activeReg.schoolLocation}
                    {activeReg.email ? ` · ${activeReg.email}` : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOutRegistrar}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Switch School</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("students")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                activeTab === "students"
                  ? "bg-[#3b00b3] text-white shadow-sm"
                  : "text-[#0d002b] hover:bg-[#faf6ff]"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>
                Student Phase 2 Videos ({registeredStudents.length})
              </span>
            </button>
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
              <span>Team Project Proposal &amp; Video</span>
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

          {activeTab === "students" && activeReg && (
            <div className="flex flex-wrap items-center gap-2">
              {hasUnsavedVideoChanges && (
                <button
                  type="button"
                  onClick={() => void handleSaveAllStudentVideos()}
                  disabled={savingAllVideos}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>
                    {savingAllVideos ? "Saving All..." : "Save All Video Links"}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setAddStudentOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#100038] px-4 py-2.5 text-xs font-extrabold text-[#9dff13] hover:bg-[#3b00b3] hover:text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Student to Roster</span>
              </button>
            </div>
          )}
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

        {/* TAB 1: STUDENT PHASE 2 VIDEOS (TEACHER / REGISTRAR MINI DASHBOARD) */}
        {activeTab === "students" && (
          <div className="space-y-4">
            {studentVideoError && (
              <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{studentVideoError}</span>
              </div>
            )}

            {/* Add Student Drawer */}
            {addStudentOpen && activeReg && (
              <form
                onSubmit={handleAddStudent}
                className="rounded-3xl border-2 border-[#3b00b3]/20 bg-white p-5 sm:p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0d002b]">
                      Add Student Under {activeReg.schoolName} (
                      {activeReg.referenceId})
                    </h3>
                    <p className="text-xs text-gray-500">
                      An Exam ID and 6-digit PIN will be generated
                      automatically, and you can attach their Phase 2 video link
                      now or later.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0d002b]">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="e.g., Adewale Ogunleye"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2 text-xs focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0d002b]">
                      Level *
                    </label>
                    <select
                      value={newStudentLevel}
                      onChange={(e) =>
                        setNewStudentLevel(e.target.value as CompetitionLevel)
                      }
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-bold"
                    >
                      <option value="junior">Junior (Primary 4–6)</option>
                      <option value="intermediate">
                        Intermediate (JSS 1–3)
                      </option>
                      <option value="senior">Senior (SS 1–3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0d002b]">
                      Class
                    </label>
                    <input
                      type="text"
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                      placeholder="e.g., JSS 2"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2 text-xs focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Phase 2 Social Media Video Link (Optional now)
                  </label>
                  <input
                    type="url"
                    value={newStudentVideo}
                    onChange={(e) => setNewStudentVideo(e.target.value)}
                    placeholder="https://www.instagram.com/reel/... or https://www.tiktok.com/... or https://youtu.be/..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2 text-xs focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddStudentOpen(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingStudent}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b00b3] px-5 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>
                      {addingStudent ? "Adding..." : "Add Student"}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {!activeReg ? (
              <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                <Share2 className="mx-auto h-11 w-11 text-[#3b00b3]/40" />
                <h3 className="mt-3 text-base font-extrabold text-[#0d002b]">
                  Sign In to Your Teacher / Registrar Dashboard
                </h3>
                <p className="mx-auto mt-1.5 max-w-lg text-xs text-gray-500 leading-relaxed">
                  Enter your school&apos;s{" "}
                  <strong>Registration Reference ID</strong> (from your
                  registration slip or confirmation email) or your{" "}
                  <strong>Coordinator Email Address</strong> in the lookup bar
                  above to load your registered students and attach their Phase
                  2 social media video links.
                </p>
              </div>
            ) : registeredStudents.length === 0 ? (
              <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                <Users className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm font-extrabold text-[#0d002b]">
                  No students listed under {activeReg.referenceId} yet
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Click <strong>&ldquo;Add Student to Roster&rdquo;</strong>{" "}
                  above to register a student under your school and upload their
                  Phase 2 video link.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {registeredStudents.map((stu, idx) => {
                  const draftVal = videoDrafts[stu.id] ?? "";
                  const savedVal = stu.phase2VideoUrl ?? "";
                  const isDirty = draftVal.trim() !== savedVal.trim();
                  const platform = detectSocialPlatform(draftVal || savedVal);
                  const isSaving = savingStudentId === stu.id;
                  const notice = savedStudentNotice[stu.id];
                  const att = stu.latestAttempt;

                  return (
                    <div
                      key={stu.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-[#3b00b3]/30"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#faf6ff] font-mono text-xs font-extrabold text-[#3b00b3]">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm sm:text-base font-extrabold text-[#0d002b]">
                                {stu.fullName}
                              </h3>
                              <span className="rounded-full bg-[#100038] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#9dff13]">
                                {levelLabel(stu.level)}
                              </span>
                              {stu.className && (
                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-700">
                                  {stu.className}
                                </span>
                              )}
                            </div>

                            {/* Exam ID, PIN, and Phase 1 Test Status */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                              <span className="font-mono">
                                Exam ID:{" "}
                                <strong className="text-[#3b00b3]">
                                  {stu.examCode}
                                </strong>
                              </span>
                              {stu.pinCode && (
                                <span className="font-mono">
                                  PIN:{" "}
                                  <strong className="text-[#0d002b]">
                                    {stu.pinCode}
                                  </strong>
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  copyText(
                                    stu.id,
                                    `${stu.fullName} | Exam ID: ${
                                      stu.examCode
                                    } | PIN: ${stu.pinCode || ""}`
                                  )
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3b00b3] hover:underline"
                              >
                                {copiedId === stu.id ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    <span>Copied Login</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy Login</span>
                                  </>
                                )}
                              </button>

                              {att ? (
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                    att.status === "in_progress"
                                      ? "bg-blue-50 text-blue-700"
                                      : att.passed
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50 text-amber-800"
                                  }`}
                                >
                                  Phase 1 Test:{" "}
                                  {att.status === "in_progress"
                                    ? "In Progress"
                                    : `${att.scoreOutOf1000} / 1,000 (${
                                        att.passed ? "Passed" : "Submitted"
                                      })`}
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-400">
                                  Phase 1 Test: Not taken yet
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Current Video Status Badge */}
                        <div className="flex items-center gap-2">
                          {savedVal ? (
                            <a
                              href={savedVal}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100 transition-colors"
                            >
                              <Video className="h-3.5 w-3.5" />
                              <span>
                                Watch {platform || "Phase 2"} Video
                              </span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-800">
                              <Video className="h-3 w-3" />
                              <span>Phase 2 Video Pending</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Phase 2 Social Media Video Link Input Row */}
                      <div className="mt-4 border-t border-gray-100 pt-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
                            Phase 2 Video · Social Media Link (Instagram,
                            TikTok, YouTube, Facebook, X, or Drive)
                          </label>
                          {notice && (
                            <span className="text-xs font-extrabold text-emerald-700">
                              {notice}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <div className="relative flex-1">
                            <input
                              type="url"
                              value={draftVal}
                              onChange={(e) =>
                                setVideoDrafts((prev) => ({
                                  ...prev,
                                  [stu.id]: e.target.value,
                                }))
                              }
                              placeholder={`Paste ${stu.fullName}'s Phase 2 social media video link (https://...)`}
                              className="w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleSaveStudentVideo(stu)}
                            disabled={isSaving || (!isDirty && !draftVal)}
                            className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-colors disabled:opacity-50 ${
                              isDirty
                                ? "bg-[#3b00b3] text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
                                : "border border-gray-200 bg-white text-[#0d002b] hover:border-[#3b00b3]"
                            }`}
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>
                              {isSaving
                                ? "Saving..."
                                : savedVal && !isDirty
                                ? "Update Video Link"
                                : "Save Video Link"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
        ) : activeTab === "submit" ? (
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
        ) : null}
      </section>

      <FooterSection />
    </main>
  );
}
