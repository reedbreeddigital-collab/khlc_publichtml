"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Plus,
  Trash2,
  Printer,
  ShieldCheck,
  Users,
  Cpu,
  Layers,
  Copy,
  Check,
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
  const [submittedAt, setSubmittedAt] = useState("");
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
    setSubmittedAt(
      new Date().toLocaleString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    const validPupils = pupils.filter((p) => p.name.trim() !== "");
    const validMembers = teamMembers.filter((m) => m.name.trim() !== "");
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
      <div className="rounded-2xl border-2 border-black bg-white p-6 sm:p-10 text-black shadow-sm">
        {/* Official Black & White Printable Slip */}
        <div
          id="evolve-registration-slip"
          className="border-2 border-black bg-white p-5 sm:p-8 text-black"
        >
          {/* Slip Header */}
          <div className="border-b-2 border-black pb-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-black">
                  KINGSHOUSE LEARNING CENTRE
                </p>
                <h3 className="mt-1 text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-black">
                  Evolve 8.0 Official Registration Slip
                </h3>
                <p className="mt-1 text-xs text-black/80">
                  National School Technology Programme (Online General Test &amp; Project Track)
                </p>
              </div>

              <div className="flex flex-col sm:items-end text-xs">
                <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 font-mono text-sm font-extrabold text-black">
                  <span>REF: {referenceId}</span>
                  <button
                    type="button"
                    onClick={() => copyText("ref", referenceId)}
                    className="no-print inline-flex items-center gap-1 border-l border-black pl-2 text-[11px] font-sans font-bold hover:underline"
                    title="Copy Reference ID"
                  >
                    {copiedKey === "ref" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] font-semibold text-black">
                  Date: {submittedAt || new Date().toLocaleDateString("en-NG")}
                </p>
                <p className="text-[11px] font-bold uppercase text-black">
                  Status: {backendSynced ? "Confirmed" : "Recorded"}
                  {emailSent && emailRecipient ? ` · Emailed to ${emailRecipient}` : ""}
                </p>
              </div>
            </div>

            {emailNote && (
              <p className="no-print mt-3 border border-black bg-white px-3 py-2 text-xs font-bold text-black">
                Note: {emailNote}
              </p>
            )}
          </div>

          {/* Section 1: School & Coordinator Details */}
          <div className="mt-5">
            <h4 className="border-b border-black pb-1.5 text-xs font-extrabold uppercase tracking-wider text-black">
              1. School &amp; Coordinator Details
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-y-2.5 gap-x-6 text-xs sm:grid-cols-2">
              <div className="flex justify-between border-b border-black/20 pb-1.5">
                <span className="font-bold text-black">School Name:</span>
                <span className="font-extrabold text-black text-right">{schoolName}</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-1.5">
                <span className="font-bold text-black">School Level:</span>
                <span className="text-black text-right">{schoolType}</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-1.5">
                <span className="font-bold text-black">State / Region:</span>
                <span className="text-black text-right">{schoolLocation}</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-1.5">
                <span className="font-bold text-black">School Address:</span>
                <span className="text-black text-right">{schoolAddress || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-1.5 sm:col-span-2">
                <span className="font-bold text-black">Participation Track:</span>
                <span className="font-extrabold text-black text-right">{trackLabel}</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-1.5">
                <span className="font-bold text-black">Coordinator / Instructor:</span>
                <span className="text-black text-right">{coordinatorName}</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-1.5">
                <span className="font-bold text-black">Role:</span>
                <span className="text-black text-right">{coordinatorRole}</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-1.5">
                <span className="font-bold text-black">Phone / WhatsApp:</span>
                <span className="text-black text-right">{phone}</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-1.5">
                <span className="font-bold text-black">Official Email:</span>
                <span className="text-black text-right">{email}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Phase 1 Online Test Roster & Exam Credentials */}
          {includeTest && (
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black pb-1.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-black">
                  2. Phase 1 · National Online General Test Roster &amp; Login Credentials
                </h4>
                <span className="text-[11px] font-bold text-black">
                  Sitting Setup: {devicePreference} · Portal: /evolve/quiz
                </span>
              </div>

              {generatedStudents.length > 0 ? (
                <>
                  <div className="no-print mt-3 flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => copyText("all", allCredsText)}
                      className="inline-flex items-center gap-1.5 border border-black bg-white px-3 py-1.5 text-xs font-extrabold text-black hover:bg-black hover:text-white transition-colors"
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
                      className="inline-flex items-center gap-1.5 border border-black bg-black px-3 py-1.5 text-xs font-extrabold text-white hover:bg-white hover:text-black transition-colors"
                    >
                      <Laptop className="h-3.5 w-3.5" />
                      <span>Open Quiz Portal</span>
                    </Link>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full border-collapse border border-black text-left text-xs text-black">
                      <thead>
                        <tr className="border-b border-black bg-white text-[10px] font-extrabold uppercase tracking-wider text-black">
                          <th className="border-r border-black py-2 px-2.5 w-8">#</th>
                          <th className="border-r border-black py-2 px-3">Pupil Full Name</th>
                          <th className="border-r border-black py-2 px-3">Level</th>
                          <th className="border-r border-black py-2 px-3">Class</th>
                          <th className="border-r border-black py-2 px-3">Exam ID</th>
                          <th className="py-2 px-3">6-Digit PIN</th>
                          <th className="no-print border-l border-black py-2 px-3 text-right">
                            Copy
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black">
                        {generatedStudents.map((stu, idx) => {
                          const rowCopyText = `${stu.fullName} | Exam ID: ${stu.examCode} | PIN: ${stu.pinCode}`;
                          const isCopied = copiedKey === stu.id;
                          return (
                            <tr key={stu.id}>
                              <td className="border-r border-black py-2 px-2.5 font-bold">
                                {idx + 1}
                              </td>
                              <td className="border-r border-black py-2 px-3 font-extrabold">
                                {stu.fullName}
                              </td>
                              <td className="border-r border-black py-2 px-3 uppercase font-semibold">
                                {stu.level}
                              </td>
                              <td className="border-r border-black py-2 px-3">
                                {stu.className || "—"}
                              </td>
                              <td className="border-r border-black py-2 px-3 font-mono text-sm font-extrabold">
                                {stu.examCode}
                              </td>
                              <td className="py-2 px-3 font-mono text-sm font-extrabold">
                                {stu.pinCode}
                              </td>
                              <td className="no-print border-l border-black py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => copyText(stu.id, rowCopyText)}
                                  className="inline-flex items-center gap-1 border border-black bg-white px-2 py-1 text-[11px] font-bold text-black hover:bg-black hover:text-white transition-colors"
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
                </>
              ) : validPupils.length > 0 ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-left text-xs text-black">
                    <thead>
                      <tr className="border-b border-black text-[10px] font-extrabold uppercase tracking-wider">
                        <th className="border-r border-black py-2 px-2.5 w-8">#</th>
                        <th className="border-r border-black py-2 px-3">Pupil Full Name</th>
                        <th className="border-r border-black py-2 px-3">Level</th>
                        <th className="py-2 px-3">Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {validPupils.map((p, idx) => (
                        <tr key={idx}>
                          <td className="border-r border-black py-2 px-2.5 font-bold">
                            {idx + 1}
                          </td>
                          <td className="border-r border-black py-2 px-3 font-extrabold">
                            {p.name}
                          </td>
                          <td className="border-r border-black py-2 px-3">{p.level}</td>
                          <td className="py-2 px-3">{p.className || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-2 text-xs text-black">
                  Pupil test roster to be finalized before the test window.
                </p>
              )}
            </div>
          )}

          {/* Section 3: Project Track Details */}
          {includeProject && (
            <div className="mt-6">
              <h4 className="border-b border-black pb-1.5 text-xs font-extrabold uppercase tracking-wider text-black">
                {includeTest ? "3." : "2."} Project Track Details (Team of 5)
              </h4>
              <div className="mt-3 grid grid-cols-1 gap-y-2 gap-x-6 text-xs sm:grid-cols-2">
                <div className="flex justify-between border-b border-black/20 pb-1.5">
                  <span className="font-bold text-black">Category:</span>
                  <span className="font-extrabold text-black text-right">
                    {projectCategory}
                  </span>
                </div>
                <div className="flex justify-between border-b border-black/20 pb-1.5">
                  <span className="font-bold text-black">Chosen Path:</span>
                  <span className="font-extrabold text-black text-right">
                    {projectPath}
                  </span>
                </div>
                <div className="flex justify-between border-b border-black/20 pb-1.5 sm:col-span-2">
                  <span className="font-bold text-black">UN SDG Theme:</span>
                  <span className="text-black text-right">{projectTheme}</span>
                </div>
                <div className="flex justify-between border-b border-black/20 pb-1.5 sm:col-span-2">
                  <span className="font-bold text-black">Supervising Teacher:</span>
                  <span className="text-black text-right">
                    {supervisingTeacher || "—"}
                  </span>
                </div>
              </div>

              {validMembers.length > 0 ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-left text-xs text-black">
                    <thead>
                      <tr className="border-b border-black text-[10px] font-extrabold uppercase tracking-wider">
                        <th className="border-r border-black py-2 px-2.5 w-8">#</th>
                        <th className="border-r border-black py-2 px-3">
                          Project Team Member Name
                        </th>
                        <th className="py-2 px-3">Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {validMembers.map((m, idx) => (
                        <tr key={idx}>
                          <td className="border-r border-black py-2 px-2.5 font-bold">
                            {idx + 1}
                          </td>
                          <td className="border-r border-black py-2 px-3 font-extrabold">
                            {m.name}
                          </td>
                          <td className="py-2 px-3">{m.className || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-2 text-xs text-black">
                  Team of 5 member names to be confirmed with proposal submission.
                </p>
              )}

              {projectIdea.trim() && (
                <div className="mt-3 border border-black p-3 text-xs">
                  <p className="font-extrabold uppercase text-[10px] tracking-wider text-black">
                    Initial Project Concept / Problem Summary:
                  </p>
                  <p className="mt-1 text-black leading-relaxed">
                    {projectIdea.trim()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Slip Footer */}
          <div className="mt-6 border-t-2 border-black pt-3 flex flex-col justify-between gap-2 text-[11px] text-black sm:flex-row sm:items-center">
            <span>
              <strong>NDPA 2023 Parental Consent &amp; Rules:</strong> Confirmed
            </span>
            <span>
              Kingshouse Learning Centre · {khlcContact.phones[0].display} ·{" "}
              {khlcContact.email}
            </span>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="no-print mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 border-2 border-black bg-black px-5 py-3 text-xs font-extrabold text-white hover:bg-white hover:text-black transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Slip</span>
          </button>

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center gap-2 border border-black bg-white px-4 py-3 text-xs font-bold text-black hover:bg-black hover:text-white transition-colors"
          >
            <span>Edit Registration Details</span>
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
