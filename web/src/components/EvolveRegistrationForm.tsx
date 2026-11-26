"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Send,
  MessageCircle,
  Mail,
  Plus,
  Trash2,
  Printer,
  ShieldCheck,
  Users,
  Cpu,
  Layers,
  Copy,
  Check,
  KeyRound,
  Laptop,
} from "lucide-react";
import Link from "next/link";
import { khlcContact } from "@/data/khlc";
import {
  sdgThemes,
  type EvolveCategory,
  type EvolvePath,
} from "@/data/evolve";
import { getApiBase } from "@/lib/quizApi";

export type RegistrationTrack = "both" | "test" | "project";

interface PupilEntry {
  name: string;
  level: "Junior (P4-P6)" | "Intermediate (JSS1-JSS3)" | "Senior (SS1-SS3)";
  className: string;
}

interface TeamMember {
  name: string;
  className: string;
}

interface GeneratedStudentCredential {
  id: string;
  fullName: string;
  level: string;
  className: string;
  examCode: string;
  pinCode: string;
}

interface EvolveRegistrationFormProps {
  preselectedTheme?: string;
  preselectedTrack?: RegistrationTrack;
}

export default function EvolveRegistrationForm({
  preselectedTheme,
  preselectedTrack,
}: EvolveRegistrationFormProps) {
  const [track, setTrack] = useState<RegistrationTrack>(
    preselectedTrack || "both"
  );

  // School & Coordinator details
  const [schoolName, setSchoolName] = useState("");
  const [schoolLocation, setSchoolLocation] = useState("Lagos");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolType, setSchoolType] = useState<
    "Primary" | "Secondary" | "Primary & Secondary"
  >("Primary & Secondary");
  const [coordinatorName, setCoordinatorName] = useState("");
  const [coordinatorRole, setCoordinatorRole] = useState(
    "Assigned KHLC Instructor"
  );
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Phase 1 Online Test details
  const [devicePreference, setDevicePreference] = useState(
    "School Computer Lab Session"
  );
  const [pupils, setPupils] = useState<PupilEntry[]>([
    { name: "", level: "Junior (P4-P6)", className: "" },
    { name: "", level: "Junior (P4-P6)", className: "" },
    { name: "", level: "Intermediate (JSS1-JSS3)", className: "" },
  ]);

  // Project Track details (Team of 5)
  const [projectCategory, setProjectCategory] =
    useState<EvolveCategory>("Primary");
  const [projectPath, setProjectPath] = useState<EvolvePath>("Coding");
  const [projectTheme, setProjectTheme] = useState<string>(
    preselectedTheme || `Theme 1: ${sdgThemes[0].title} (${sdgThemes[0].sdg})`
  );
  const [supervisingTeacher, setSupervisingTeacher] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: "", className: "" },
    { name: "", className: "" },
    { name: "", className: "" },
    { name: "", className: "" },
    { name: "", className: "" },
  ]);

  // NDPA 2023 Consent
  const [consentChecked, setConsentChecked] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [backendSynced, setBackendSynced] = useState(false);
  const [generatedStudents, setGeneratedStudents] = useState<
    GeneratedStudentCredential[]
  >([]);
  const [emailSent, setEmailSent] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailNote, setEmailNote] = useState("");
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? "" : prev));
      }, 2000);
    } catch {
      // ignore clipboard errors on unsupported contexts
    }
  };

  useEffect(() => {
    if (preselectedTheme) {
      setProjectTheme(preselectedTheme);
    }
  }, [preselectedTheme]);

  useEffect(() => {
    if (preselectedTrack) {
      setTrack(preselectedTrack);
    }
  }, [preselectedTrack]);

  const includeTest = track === "both" || track === "test";
  const includeProject = track === "both" || track === "project";

  const addPupilRow = () => {
    if (pupils.length >= 9) return; // Max 3 pupils x 3 levels = 9
    setPupils((prev) => [
      ...prev,
      { name: "", level: "Senior (SS1-SS3)", className: "" },
    ]);
  };

  const removePupilRow = (index: number) => {
    if (pupils.length <= 1) return;
    setPupils((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePupil = (
    index: number,
    field: keyof PupilEntry,
    value: string
  ) => {
    setPupils((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const updateTeamMember = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    setTeamMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const trackLabel =
    track === "both"
      ? "Both Tracks (Phase 1 Online Test + Project Track)"
      : track === "test"
      ? "Phase 1: National Online General Test"
      : "Phase 2: Project Track (Coding, AI or Robotics)";

  const buildSummaryText = (refCode: string) => {
    const lines = [
      `EVOLVE 8.0 REGISTRATION — Ref: ${refCode}`,
      `Track: ${trackLabel}`,
      `School: ${schoolName} (${schoolType})`,
      `Location: ${schoolLocation}${schoolAddress ? ` — ${schoolAddress}` : ""}`,
      `Coordinator / Instructor: ${coordinatorName} (${coordinatorRole})`,
      `Phone: ${phone} | Email: ${email}`,
    ];

    if (includeTest) {
      lines.push(`--- Phase 1 Online Test (${devicePreference}) ---`);
      if (generatedStudents.length > 0) {
        generatedStudents.forEach((s, idx) => {
          lines.push(
            `  ${idx + 1}. ${s.fullName} [${s.level.toUpperCase()}${
              s.className ? ` · ${s.className}` : ""
            }] — Exam ID: ${s.examCode} | PIN: ${s.pinCode}`
          );
        });
      } else {
        const validPupils = pupils.filter((p) => p.name.trim() !== "");
        if (validPupils.length > 0) {
          validPupils.forEach((p, idx) => {
            lines.push(
              `  ${idx + 1}. ${p.name} — ${p.level}${p.className ? ` (${p.className})` : ""}`
            );
          });
        } else {
          lines.push("  Pupil roster to be finalized before 14 Nov 2026.");
        }
      }
    }

    if (includeProject) {
      const validMembers = teamMembers.filter((m) => m.name.trim() !== "");
      lines.push(
        `--- Project Track (${projectCategory} | ${projectPath} | ${projectTheme}) ---`
      );
      if (supervisingTeacher.trim()) {
        lines.push(`Supervising Teacher: ${supervisingTeacher}`);
      }
      if (validMembers.length > 0) {
        validMembers.forEach((m, idx) => {
          lines.push(
            `  Member ${idx + 1}: ${m.name}${m.className ? ` (${m.className})` : ""}`
          );
        });
      } else {
        lines.push("  Team of 5 names to be confirmed with proposal.");
      }
      if (projectIdea.trim()) {
        lines.push(`Initial Concept: ${projectIdea.trim()}`);
      }
    }

    lines.push("NDPA 2023 Parental Consent & Data Policy: Confirmed");
    return lines.join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setBackendSynced(false);
    setGeneratedStudents([]);
    setEmailSent(false);
    setEmailRecipient("");
    setEmailNote("");

    let confirmedRef = `EV8-${Math.floor(1000 + Math.random() * 9000)}`;

    const apiBase = getApiBase();
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/api/v1/evolve/registrations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referenceId: confirmedRef,
            track,
            schoolName,
            schoolLocation,
            schoolAddress,
            schoolType,
            coordinatorName,
            coordinatorRole,
            phone,
            email,
            devicePreference: includeTest ? devicePreference : "",
            testPupils: includeTest
              ? pupils.filter((p) => p.name.trim() !== "")
              : [],
            projectCategory: includeProject ? projectCategory : "",
            projectPath: includeProject ? projectPath : "",
            projectTheme: includeProject ? projectTheme : "",
            supervisingTeacher: includeProject ? supervisingTeacher : "",
            projectTeam: includeProject
              ? teamMembers.filter((m) => m.name.trim() !== "")
              : [],
            projectIdea: includeProject ? projectIdea : "",
            ndpaConsent: consentChecked,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSubmitError(
            data.error || "Registration validation failed. Please review your fields."
          );
          setSubmitting(false);
          return;
        }
        if (data?.data?.referenceId) {
          confirmedRef = data.data.referenceId;
        }
        if (Array.isArray(data?.generatedStudents)) {
          setGeneratedStudents(data.generatedStudents);
        }
        setEmailSent(Boolean(data?.emailSent));
        if (typeof data?.emailRecipient === "string") {
          setEmailRecipient(data.emailRecipient);
        }
        if (typeof data?.emailNote === "string") {
          setEmailNote(data.emailNote);
        }
        setBackendSynced(true);
      } catch {
        // Gracefully fall back to WhatsApp / Email handoff if API is unreachable
      }
    }

    setReferenceId(confirmedRef);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    const summaryText = buildSummaryText(referenceId);
    const allCredsText = [
      `EVOLVE 8.0 STUDENT EXAM CREDENTIALS — ${schoolName} (Ref: ${referenceId})`,
      `Exam Portal: ${
        typeof window !== "undefined"
          ? `${window.location.origin}/evolve/quiz`
          : "/evolve/quiz"
      }`,
      ...generatedStudents.map(
        (s, i) =>
          `${i + 1}. ${s.fullName} (${s.level.toUpperCase()}${
            s.className ? ` · ${s.className}` : ""
          }) — Exam ID: ${s.examCode} | PIN: ${s.pinCode}`
      ),
    ].join("\n");

    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-10 shadow-[0_20px_60px_rgba(13,0,43,0.08)]">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => copyText("ref", referenceId)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#3b00b3]/10 px-3.5 py-1 text-xs font-extrabold text-[#3b00b3] hover:bg-[#3b00b3] hover:text-white transition-colors"
            >
              <span>Reference ID: {referenceId}</span>
              {copiedKey === "ref" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            {backendSynced && (
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                ✓ Registration Received
              </span>
            )}
            {emailSent && emailRecipient && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-extrabold text-blue-800">
                <Mail className="h-3.5 w-3.5" />
                <span>Emailed to {emailRecipient}</span>
              </span>
            )}
          </div>
          <h3 className="mt-3 text-2xl font-extrabold text-[#0d002b]">
            Evolve 8.0 Registration Confirmed for {schoolName}!
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            {emailSent
              ? `We've created your pupils' exam accounts and dispatched a copy of the Reference ID and all Exam IDs & PINs to ${emailRecipient}.`
              : backendSynced
              ? "We've received your school's registration and generated your student exam credentials below. Please copy or print them for your pupils."
              : "Complete your registration instantly by sending this formatted summary to the Evolve 8.0 Desk via WhatsApp or Email below."}
          </p>
          {emailNote && (
            <p className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-bold text-amber-800">
              {emailNote}
            </p>
          )}
        </div>

        {/* Auto-Generated Student Exam Credentials Card */}
        {generatedStudents.length > 0 && (
          <div className="mt-6 rounded-2xl border-2 border-[#3b00b3]/20 bg-[#faf6ff] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3b00b3]/15 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3b00b3] text-[#9dff13]">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-[#0d002b]">
                    Student Exam Login Credentials ({generatedStudents.length})
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Accounts are active immediately on <code>/evolve/quiz</code>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyText("all", allCredsText)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#100038] px-3.5 py-2 text-xs font-extrabold text-[#9dff13] hover:bg-[#3b00b3] hover:text-white transition-colors"
                >
                  {copiedKey === "all" ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied All ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy All IDs &amp; PINs</span>
                    </>
                  )}
                </button>
                <Link
                  href="/evolve/quiz"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#3b00b3]/30 bg-white px-3.5 py-2 text-xs font-extrabold text-[#3b00b3] hover:bg-[#3b00b3] hover:text-white transition-colors"
                >
                  <Laptop className="h-3.5 w-3.5" />
                  <span>Open Quiz Portal</span>
                </Link>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#3b00b3]/10 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    <th className="py-2 pr-3">Pupil</th>
                    <th className="py-2 px-3">Level</th>
                    <th className="py-2 px-3">Exam ID</th>
                    <th className="py-2 px-3">6-Digit PIN</th>
                    <th className="py-2 pl-3 text-right">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3b00b3]/10">
                  {generatedStudents.map((stu) => {
                    const rowCopyText = `${stu.fullName} | Exam ID: ${stu.examCode} | PIN: ${stu.pinCode}`;
                    const isCopied = copiedKey === stu.id;
                    return (
                      <tr key={stu.id}>
                        <td className="py-3 pr-3">
                          <p className="font-extrabold text-[#0d002b]">
                            {stu.fullName}
                          </p>
                          {stu.className && (
                            <p className="text-[11px] text-gray-500">
                              {stu.className}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="rounded-full bg-[#100038] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#9dff13]">
                            {stu.level}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-sm font-extrabold text-[#3b00b3]">
                          {stu.examCode}
                        </td>
                        <td className="py-3 px-3 font-mono text-sm font-extrabold text-[#0d002b]">
                          {stu.pinCode}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => copyText(stu.id, rowCopyText)}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-extrabold transition-colors ${
                              isCopied
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-gray-200 bg-white text-[#0d002b] hover:border-[#3b00b3] hover:text-[#3b00b3]"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Preview Box */}
        <pre className="mt-6 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-gray-200 bg-[#faf9ff] p-4 text-xs leading-relaxed text-[#0d002b]">
          {summaryText}
        </pre>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {includeProject && (
            <Link
              href={`/evolve/projects?ref=${encodeURIComponent(referenceId)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#100038] px-5 py-3 text-xs sm:text-sm font-extrabold text-[#9dff13] shadow-md transition-all hover:bg-[#3b00b3] hover:text-white"
            >
              <span>Submit Project Proposal / Video →</span>
            </Link>
          )}
          <a
            href={khlcContact.whatsappUrl(summaryText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#3b00b3] px-5 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#9dff13] hover:text-[#0d002b]"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Submit via WhatsApp (0913 938 6220)</span>
          </a>

          <a
            href={`mailto:${khlcContact.email}?subject=${encodeURIComponent(
              `Evolve 8.0 Registration (${referenceId}) — ${schoolName}`
            )}&body=${encodeURIComponent(summaryText)}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[#3b00b3]/30 bg-white px-5 py-3 text-xs sm:text-sm font-extrabold text-[#3b00b3] hover:bg-[#faf6ff] transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>Send via Email</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold text-gray-700 hover:border-[#0d002b]"
          >
            <Printer className="h-4 w-4" />
            <span>Print Slip</span>
          </button>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs font-bold text-gray-500 underline hover:text-[#3b00b3]"
          >
            Edit registration details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#3b00b3]/15 bg-white p-6 sm:p-9 shadow-[0_24px_60px_rgba(13,0,43,0.08)]"
    >
      {/* Step 1: Select Track */}
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#3b00b3]">
          Step 1 · Choose Participation Track
        </span>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              id: "both" as RegistrationTrack,
              title: "Both Tracks (Recommended)",
              desc: "National Online Test + 5-Pupil Project Track",
              icon: Layers,
            },
            {
              id: "test" as RegistrationTrack,
              title: "Phase 1: Online Test Only",
              desc: "Up to 3 pupils per level (Primary 4 – SS3)",
              icon: Users,
            },
            {
              id: "project" as RegistrationTrack,
              title: "Project Track Only",
              desc: "Team of 5 in Coding, AI, or Robotics",
              icon: Cpu,
            },
          ].map((option) => {
            const Icon = option.icon;
            const active = track === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTrack(option.id)}
                className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-[#3b00b3] bg-[#3b00b3] text-white shadow-lg"
                    : "border-gray-200 bg-[#faf9ff] text-[#0d002b] hover:border-[#3b00b3]/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 ${
                      active ? "text-[#9dff13]" : "text-[#3b00b3]"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-extrabold">
                    {option.title}
                  </span>
                </div>
                <span
                  className={`mt-1 text-[11px] ${
                    active ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {option.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: School & Coordinator Information */}
      <div className="mt-8 border-t border-gray-100 pt-7">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#3b00b3]">
          Step 2 · School &amp; Coordinator / Instructor Details
        </span>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="ev-school"
              className="block text-xs font-bold text-[#0d002b]"
            >
              School Name *
            </label>
            <input
              id="ev-school"
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g., Kingsway Model Schools"
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="ev-type"
              className="block text-xs font-bold text-[#0d002b]"
            >
              School Level *
            </label>
            <select
              id="ev-type"
              value={schoolType}
              onChange={(e) =>
                setSchoolType(
                  e.target.value as
                    | "Primary"
                    | "Secondary"
                    | "Primary & Secondary"
                )
              }
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            >
              <option value="Primary">Primary Only</option>
              <option value="Secondary">Secondary Only</option>
              <option value="Primary & Secondary">Primary &amp; Secondary</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ev-location"
              className="block text-xs font-bold text-[#0d002b]"
            >
              State / Region *
            </label>
            <select
              id="ev-location"
              value={schoolLocation}
              onChange={(e) => setSchoolLocation(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            >
              <option value="Lagos">Lagos State</option>
              <option value="Ogun">Ogun State</option>
              <option value="Edo (Benin City)">Edo State (Benin City)</option>
              <option value="Other State in Nigeria">
                Other State in Nigeria
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ev-address"
              className="block text-xs font-bold text-[#0d002b]"
            >
              School Area / Address *
            </label>
            <input
              id="ev-address"
              type="text"
              required
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
              placeholder="e.g., Festac / Amuwo Odofin, Lagos"
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="ev-coord"
              className="block text-xs font-bold text-[#0d002b]"
            >
              Instructor / School Coordinator Name *
            </label>
            <input
              id="ev-coord"
              type="text"
              required
              value={coordinatorName}
              onChange={(e) => setCoordinatorName(e.target.value)}
              placeholder="Full name of registering teacher or instructor"
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="ev-role"
              className="block text-xs font-bold text-[#0d002b]"
            >
              Role *
            </label>
            <select
              id="ev-role"
              value={coordinatorRole}
              onChange={(e) => setCoordinatorRole(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            >
              <option value="Assigned KHLC Instructor">
                Assigned KHLC Instructor
              </option>
              <option value="School ICT Coordinator / Teacher">
                School ICT Coordinator / Teacher
              </option>
              <option value="Principal / Head of School">
                Principal / Head of School
              </option>
              <option value="Proprietor / School Director">
                Proprietor / School Director
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ev-phone"
              className="block text-xs font-bold text-[#0d002b]"
            >
              Phone / WhatsApp Number *
            </label>
            <input
              id="ev-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 0803 123 4567"
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="ev-email"
              className="block text-xs font-bold text-[#0d002b]"
            >
              Official Email Address *
            </label>
            <input
              id="ev-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coordinator@school.edu.ng"
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Step 3A: Phase 1 Online Test Roster */}
      {includeTest && (
        <div className="mt-8 border-t border-gray-100 pt-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#3b00b3]">
                Phase 1 · National Online General Test
              </span>
              <p className="mt-0.5 text-xs text-gray-500">
                Each school may register up to 3 pupils per level (Junior P4–P6,
                Intermediate JSS1–JSS3, Senior SS1–SS3). Test window: 21–28 Nov
                2026.
              </p>
            </div>
            <button
              type="button"
              onClick={addPupilRow}
              disabled={pupils.length >= 9}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#3b00b3]/30 bg-[#faf6ff] px-3 py-1.5 text-xs font-extrabold text-[#3b00b3] hover:bg-[#3b00b3] hover:text-white disabled:opacity-40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Pupil ({pupils.length}/9)</span>
            </button>
          </div>

          <div className="mt-4">
            <label
              htmlFor="ev-device"
              className="block text-xs font-bold text-[#0d002b]"
            >
              Preferred School Test Sitting Setup
            </label>
            <select
              id="ev-device"
              value={devicePreference}
              onChange={(e) => setDevicePreference(e.target.value)}
              className="mt-1.5 w-full sm:max-w-md rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            >
              <option value="School Computer Lab Session">
                School Computer Lab Session
              </option>
              <option value="Mobile / Phone-Friendly Option">
                Mobile / Phone-Friendly Option
              </option>
              <option value="Need Guidance / Paper Fallback">
                Need Guidance / Paper Fallback
              </option>
            </select>
          </div>

          <div className="mt-4 space-y-2.5">
            {pupils.map((pupil, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-2.5 rounded-xl border border-gray-100 bg-[#faf9ff] p-3 sm:grid-cols-12 items-center"
              >
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={pupil.name}
                    onChange={(e) => updatePupil(idx, "name", e.target.value)}
                    placeholder={`Pupil ${idx + 1} Full Name`}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-4">
                  <select
                    value={pupil.level}
                    onChange={(e) => updatePupil(idx, "level", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                  >
                    <option value="Junior (P4-P6)">Junior (Primary 4–6)</option>
                    <option value="Intermediate (JSS1-JSS3)">
                      Intermediate (JSS 1–3)
                    </option>
                    <option value="Senior (SS1-SS3)">Senior (SS 1–3)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={pupil.className}
                    onChange={(e) =>
                      updatePupil(idx, "className", e.target.value)
                    }
                    placeholder="Class (e.g. P5)"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removePupilRow(idx)}
                    disabled={pupils.length <= 1}
                    aria-label="Remove pupil"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3B: Project Track (Team of 5) */}
      {includeProject && (
        <div className="mt-8 border-t border-gray-100 pt-7">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#3b00b3]">
            Project Track · Coding, AI, or Robotics (Team of 5)
          </span>
          <p className="mt-0.5 text-xs text-gray-500">
            Each school fields one team of 5 pupils selecting one path, one
            category, and one UN SDG theme.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="ev-proj-cat"
                className="block text-xs font-bold text-[#0d002b]"
              >
                Category *
              </label>
              <select
                id="ev-proj-cat"
                value={projectCategory}
                onChange={(e) =>
                  setProjectCategory(e.target.value as EvolveCategory)
                }
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
              >
                <option value="Primary">Primary (300-word proposal)</option>
                <option value="Secondary">Secondary (500-word proposal)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ev-proj-path"
                className="block text-xs font-bold text-[#0d002b]"
              >
                Chosen Path *
              </label>
              <select
                id="ev-proj-path"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value as EvolvePath)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
              >
                <option value="Coding">Coding</option>
                <option value="AI">Artificial Intelligence (AI)</option>
                <option value="Robotics">Robotics</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ev-proj-theme"
                className="block text-xs font-bold text-[#0d002b]"
              >
                UN SDG Theme *
              </label>
              <select
                id="ev-proj-theme"
                value={projectTheme}
                onChange={(e) => setProjectTheme(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
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
          </div>

          <div className="mt-4">
            <label
              htmlFor="ev-supervisor"
              className="block text-xs font-bold text-[#0d002b]"
            >
              Supervising Teacher Name *
            </label>
            <input
              id="ev-supervisor"
              type="text"
              required={includeProject}
              value={supervisingTeacher}
              onChange={(e) => setSupervisingTeacher(e.target.value)}
              placeholder="Teacher guiding the team (teachers guide, pupils build)"
              className="mt-1.5 w-full sm:max-w-md rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            />
          </div>

          {/* 5 Team Members */}
          <div className="mt-4">
            <p className="text-xs font-bold text-[#0d002b]">
              Team of 5 Pupils{" "}
              <span className="font-normal text-gray-500">
                (enter now or confirm before the Early December proposal
                deadline)
              </span>
            </p>
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {teamMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 rounded-xl border border-gray-100 bg-[#faf9ff] p-2.5"
                >
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      updateTeamMember(idx, "name", e.target.value)
                    }
                    placeholder={`Team Member ${idx + 1} Name`}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={member.className}
                    onChange={(e) =>
                      updateTeamMember(idx, "className", e.target.value)
                    }
                    placeholder="Class"
                    className="w-24 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="ev-idea"
              className="block text-xs font-bold text-[#0d002b]"
            >
              Brief Project Idea / Problem Summary (Optional at Registration)
            </label>
            <textarea
              id="ev-idea"
              rows={3}
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value)}
              placeholder="Briefly describe the community problem your team plans to tackle..."
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* NDPA 2023 Parental Consent & Competition Rules */}
      <div className="mt-8 rounded-2xl border border-[#3b00b3]/15 bg-[#faf6ff] p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            required
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#3b00b3] focus:ring-[#3b00b3]"
          />
          <span className="text-xs leading-relaxed text-[#0d002b]/85">
            <strong className="inline-flex items-center gap-1 font-extrabold text-[#3b00b3]">
              <ShieldCheck className="h-3.5 w-3.5" />
              NDPA 2023 Data Policy &amp; Parental Consent Confirmation:
            </strong>{" "}
            I confirm that our school has obtained (or will obtain prior to the
            test window and video submission) parental consent for participating
            pupils under the{" "}
            <strong>Nigeria Data Protection Act 2023</strong>, and agrees to the
            Evolve 8.0 rules (including original pupil-built work).
          </span>
        </label>
      </div>

      {submitError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          {submitError}
        </div>
      )}

      {/* Submit Row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3b00b3] px-7 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(59,0,179,0.3)] transition-all hover:bg-[#9dff13] hover:text-[#0d002b] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          <span>
            {submitting
              ? "Preparing Registration..."
              : "Complete Evolve 8.0 Registration"}
          </span>
        </button>

        <p className="text-xs text-gray-500">
          Need assistance? Call{" "}
          <a
            href={khlcContact.phones[0].href}
            className="font-extrabold text-[#3b00b3] hover:underline"
          >
            {khlcContact.phones[0].display}
          </a>{" "}
          or{" "}
          <a
            href={khlcContact.phones[1].href}
            className="font-extrabold text-[#3b00b3] hover:underline"
          >
            {khlcContact.phones[1].display}
          </a>
        </p>
      </div>
    </form>
  );
}
