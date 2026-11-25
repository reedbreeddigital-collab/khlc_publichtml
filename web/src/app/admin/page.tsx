"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Kanban,
  Trophy,
  Inbox,
  Building2,
  GraduationCap,
  ExternalLink,
  Menu,
  X,
  Database,
  RefreshCw,
  ArrowUpRight,
  CalendarClock,
  FileQuestion,
  Users,
  Lock,
  LogOut,
  ShieldCheck,
  Cpu,
  Mail,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import KhlcLogo from "@/components/KhlcLogo";
import CrmModule from "@/components/admin/CrmModule";
import QuizManagerModule from "@/components/admin/QuizManagerModule";
import QuestionBankModule from "@/components/admin/QuestionBankModule";
import QuizStudentsModule from "@/components/admin/QuizStudentsModule";
import ProjectSubmissionsModule, {
  type ProjectSubmission,
  type JudgingScores,
} from "@/components/admin/ProjectSubmissionsModule";
import {
  initialCrmLeads,
  type CrmLead,
  type LeadActivity,
} from "@/data/crm";
import {
  apiRequest,
  getApiBase,
  type QuizWithStats,
  type Question,
  type Student,
  type CompetitionLevel,
  type QuizStatus,
} from "@/lib/quizApi";

type AdminSection =
  | "quizzes"
  | "questions"
  | "students"
  | "projects"
  | "crm"
  | "evolve"
  | "enquiries";

interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
}

interface LiveEnquiry {
  id: string;
  pathway: string;
  fullName: string;
  phone: string;
  email: string;
  orgDetail: string;
  focus: string;
  message?: string;
  createdAt: string;
}

interface LiveEvolveReg {
  id: string;
  referenceId: string;
  track: string;
  schoolName: string;
  schoolLocation: string;
  coordinatorName: string;
  phone: string;
  email: string;
  projectPath?: string;
  projectTheme?: string;
  createdAt: string;
}

const STORAGE_KEY = "khlc_admin_crm_leads_v1";
const ADMIN_TOKEN_KEY = "khlc_admin_session_token_v1";

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("quizzes");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin auth state
  const [adminToken, setAdminToken] = useState<string>("");
  const [authChecked, setAuthChecked] = useState(false);
  const [loginEmail, setLoginEmail] = useState("admin@kingshouselearning.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // CRM + Enquiries + Evolve Registrations
  const [leads, setLeads] = useState<CrmLead[]>(initialCrmLeads);
  const [apiConnected, setApiConnected] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>("checking");
  const [syncing, setSyncing] = useState(false);
  const [liveEnquiries, setLiveEnquiries] = useState<LiveEnquiry[]>([]);
  const [liveEvolveRegs, setLiveEvolveRegs] = useState<LiveEvolveReg[]>([]);

  // Quiz Engine, Projects & Newsletter state
  const [quizzes, setQuizzes] = useState<QuizWithStats[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  const apiBase = getApiBase();

  // Restore saved CRM leads & admin token
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed);
        }
      }
      const savedToken = window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
      if (savedToken) {
        setAdminToken(savedToken);
      }
    } catch {
      // ignore storage errors
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch {
      // ignore storage errors
    }
  }, [leads]);

  const syncWithBackend = useCallback(
    async (tokenOverride?: string) => {
      if (!apiBase) return;
      const activeToken = tokenOverride ?? adminToken;
      setSyncing(true);
      try {
        const [healthRes, leadsRes, enqRes, evolveRes] = await Promise.all([
          fetch(`${apiBase}/api/v1/health`),
          fetch(`${apiBase}/api/v1/crm/leads`),
          fetch(`${apiBase}/api/v1/enquiries`),
          fetch(`${apiBase}/api/v1/evolve/registrations`),
        ]);
        if (healthRes.ok) {
          const h = await healthRes.json();
          setDbStatus(h.database || "connected");
          setApiConnected(true);
        }
        if (leadsRes.ok) {
          const json = await leadsRes.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            setLeads(json.data);
          }
          setApiConnected(true);
        }
        if (enqRes.ok) {
          const json = await enqRes.json();
          setLiveEnquiries(json.data || []);
        }
        if (evolveRes.ok) {
          const json = await evolveRes.json();
          setLiveEvolveRegs(json.data || []);
        }

        if (activeToken) {
          const [qzRes, qRes, stuRes, projRes, subRes] = await Promise.all([
            apiRequest<{ data: QuizWithStats[] }>("/api/v1/admin/quizzes", {
              token: activeToken,
            }),
            apiRequest<{ data: Question[] }>("/api/v1/admin/questions", {
              token: activeToken,
            }),
            apiRequest<{ data: Student[] }>("/api/v1/admin/students", {
              token: activeToken,
            }),
            apiRequest<{ data: ProjectSubmission[] }>("/api/v1/admin/projects", {
              token: activeToken,
            }),
            apiRequest<{ data: NewsletterSubscriber[] }>(
              "/api/v1/admin/newsletter",
              { token: activeToken }
            ),
          ]);
          setQuizzes(qzRes.data || []);
          setQuestions(qRes.data || []);
          setStudents(stuRes.data || []);
          setProjects(projRes.data || []);
          setSubscribers(subRes.data || []);
        }
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status === 401) {
          setAdminToken("");
          try {
            window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
          } catch {
            // ignore
          }
        } else {
          setApiConnected(false);
        }
      } finally {
        setSyncing(false);
      }
    },
    [apiBase, adminToken]
  );

  useEffect(() => {
    if (authChecked && apiBase) {
      syncWithBackend();
    }
  }, [authChecked, apiBase, adminToken, syncWithBackend]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await apiRequest<{ token: string }>("/api/v1/admin/login", {
        method: "POST",
        body: { email: loginEmail, password: loginPassword },
      });
      setAdminToken(res.token);
      try {
        window.sessionStorage.setItem(ADMIN_TOKEN_KEY, res.token);
      } catch {
        // ignore
      }
      setLoginPassword("");
      await syncWithBackend(res.token);
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : "Invalid admin credentials"
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAdminToken("");
    try {
      window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {
      // ignore
    }
  };

  // CRM handlers
  const handleAddLead = async (
    input: Omit<CrmLead, "id" | "createdAt" | "activities">
  ) => {
    const newLead: CrmLead = {
      ...input,
      id: `lead_${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "Note",
          summary: "Lead created in KHLC CRM.",
          author: "KHLC Admin",
          timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
        },
      ],
    };

    setLeads((prev) => [newLead, ...prev]);

    if (apiBase && apiConnected) {
      try {
        await fetch(`${apiBase}/api/v1/crm/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLead),
        });
      } catch {
        // local state updated
      }
    }
  };

  const handleUpdateLead = async (id: string, patch: Partial<CrmLead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );

    if (apiBase && apiConnected) {
      try {
        await fetch(`${apiBase}/api/v1/crm/leads/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
      } catch {
        // local state updated
      }
    }
  };

  const handleAddActivity = async (
    id: string,
    activity: Omit<LeadActivity, "id" | "timestamp">
  ) => {
    const newAct: LeadActivity = {
      ...activity,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
    };

    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, activities: [newAct, ...l.activities] } : l
      )
    );

    if (apiBase && apiConnected) {
      try {
        await fetch(`${apiBase}/api/v1/crm/leads/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newActivity: newAct }),
        });
      } catch {
        // local state updated
      }
    }
  };

  const handleDeleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));

    if (apiBase && apiConnected) {
      try {
        await fetch(`${apiBase}/api/v1/crm/leads/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
      } catch {
        // local state updated
      }
    }
  };

  const promoteEnquiryToCrm = (enq: LiveEnquiry) => {
    handleAddLead({
      organization: enq.orgDetail || enq.fullName,
      contactName: enq.fullName,
      contactRole: enq.pathway,
      segment:
        enq.pathway === "schools"
          ? "School Partnership"
          : enq.pathway === "partners"
          ? "Institutional / CSR"
          : enq.pathway === "instructors"
          ? "Instructor"
          : "Parent / Learner",
      stage: "new",
      priority: enq.pathway === "schools" ? "High" : "Medium",
      phone: enq.phone,
      email: enq.email,
      location: "Lagos",
      programInterest: enq.focus,
      estimatedValueNgn: enq.pathway === "schools" ? 1500000 : 150000,
      assignedTo: "BD Team",
      nextFollowUp: new Date(Date.now() + 2 * 86400000)
        .toISOString()
        .slice(0, 10),
      notes: enq.message || "Promoted from Website Enquiry Inbox.",
    });
    setActiveSection("crm");
  };

  // Quiz Engine Admin Handlers
  const handleCreateQuiz = async (payload: {
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
  }) => {
    await apiRequest("/api/v1/admin/quizzes", {
      method: "POST",
      token: adminToken,
      body: payload,
    });
    await syncWithBackend();
  };

  const handleUpdateQuiz = async (
    id: string,
    patch: Record<string, unknown>
  ) => {
    await apiRequest(`/api/v1/admin/quizzes/${encodeURIComponent(id)}`, {
      method: "PATCH",
      token: adminToken,
      body: patch,
    });
    await syncWithBackend();
  };

  const handleDeleteQuiz = async (id: string) => {
    await apiRequest(`/api/v1/admin/quizzes/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token: adminToken,
    });
    await syncWithBackend();
  };

  const handleCreateQuestion = async (
    payload: Omit<Question, "id" | "createdAt">
  ) => {
    await apiRequest("/api/v1/admin/questions", {
      method: "POST",
      token: adminToken,
      body: payload,
    });
    await syncWithBackend();
  };

  const handleUpdateQuestion = async (id: string, patch: Partial<Question>) => {
    await apiRequest(`/api/v1/admin/questions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      token: adminToken,
      body: patch,
    });
    await syncWithBackend();
  };

  const handleDeleteQuestion = async (id: string) => {
    await apiRequest(`/api/v1/admin/questions/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token: adminToken,
    });
    await syncWithBackend();
  };

  const handleImportCsv = async (csvText: string, quizId?: string) => {
    const res = await apiRequest<{ imported: number; skipped: number }>(
      "/api/v1/admin/questions/import",
      {
        method: "POST",
        token: adminToken,
        body: { csv: csvText, quizId: quizId || "" },
      }
    );
    await syncWithBackend();
    return res;
  };

  const handleCreateStudent = async (payload: {
    fullName: string;
    schoolName: string;
    schoolLocation: string;
    level: CompetitionLevel;
    className: string;
    examCode?: string;
    pinCode?: string;
  }) => {
    await apiRequest("/api/v1/admin/students", {
      method: "POST",
      token: adminToken,
      body: payload,
    });
    await syncWithBackend();
  };

  const handleDeleteStudent = async (id: string) => {
    await apiRequest(`/api/v1/admin/students/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token: adminToken,
    });
    await syncWithBackend();
  };

  const handleImportRegistrations = async () => {
    const res = await apiRequest<{ imported: number }>(
      "/api/v1/admin/students/import-registrations",
      {
        method: "POST",
        token: adminToken,
      }
    );
    await syncWithBackend();
    return res;
  };

  const handleResetAttempt = async (attemptId: string) => {
    await apiRequest(
      `/api/v1/admin/attempts/${encodeURIComponent(attemptId)}/reset`,
      {
        method: "POST",
        token: adminToken,
      }
    );
    await syncWithBackend();
  };

  const handleReviewProject = async (
    id: string,
    patch: {
      instructorFeedback: string;
      status: string;
      judgingScores: JudgingScores;
    }
  ) => {
    await apiRequest(`/api/v1/admin/projects/${encodeURIComponent(id)}`, {
      method: "PATCH",
      token: adminToken,
      body: patch,
    });
    await syncWithBackend();
  };

  const exportSubscribersCsv = () => {
    const csv = [
      "email,subscribed_at",
      ...subscribers.map((s) => `${s.email},${s.subscribedAt}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "khlc-newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Admin Login Gate
  if (authChecked && !adminToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#100038] px-4 py-12 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-7 text-[#0d002b] shadow-2xl">
          <div className="flex items-center justify-between">
            <KhlcLogo className="h-9 w-auto" />
            <span className="inline-flex items-center gap-1 rounded-full bg-[#3b00b3]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Protected Console
            </span>
          </div>

          <h1 className="mt-5 text-xl font-extrabold text-[#0d002b]">
            KHLC Admin Console Sign In
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Sign in to manage Evolve 8.0 scheduled quizzes, question bank,
            student login slips, official results, and CRM leads.
          </p>

          {loginError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0d002b]">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d002b]">
                Admin Password / Passcode
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full rounded-xl border border-gray-200 bg-[#faf9ff] py-2.5 pl-3.5 pr-11 text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-[#3b00b3] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b00b3] px-4 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              <span>{loggingIn ? "Verifying..." : "Unlock Admin Console"}</span>
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
            <Link href="/evolve" className="font-bold hover:text-[#3b00b3]">
              ← Evolve 8.0 Portal
            </Link>
            <Link
              href="/evolve/quiz"
              className="font-bold text-[#3b00b3] hover:underline"
            >
              Student Exam Login →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const quizSidebarItems = [
    {
      id: "quizzes" as AdminSection,
      label: "Quiz Manager",
      badge: String(quizzes.length),
      icon: CalendarClock,
    },
    {
      id: "questions" as AdminSection,
      label: "Question Bank",
      badge: String(questions.length),
      icon: FileQuestion,
    },
    {
      id: "students" as AdminSection,
      label: "Student Roster",
      badge: String(students.length),
      icon: Users,
    },
    {
      id: "projects" as AdminSection,
      label: "Project Judging",
      badge: String(projects.length),
      icon: Cpu,
    },
  ];

  const opsSidebarItems = [
    {
      id: "crm" as AdminSection,
      label: "CRM Pipeline",
      badge: String(leads.length),
      icon: Kanban,
    },
    {
      id: "evolve" as AdminSection,
      label: "Evolve 8.0 Entries",
      badge: String(
        liveEvolveRegs.length ||
          leads.filter((l) => l.segment === "Evolve 8.0").length
      ),
      icon: Trophy,
    },
    {
      id: "enquiries" as AdminSection,
      label: "Enquiries & News",
      badge: String(liveEnquiries.length + subscribers.length),
      icon: Inbox,
    },
  ];

  const upcomingModules = [
    { label: "Partner Schools", icon: Building2 },
    { label: "Instructors & Deployment", icon: GraduationCap },
  ];

  const headerTitle: Record<AdminSection, string> = {
    quizzes: "Evolve 8.0 Quiz & Schedule Manager",
    questions: "Evolve 8.0 Question Bank",
    students: "Registered Students, Exam Slips & Live Attempts",
    projects: "Evolve 8.0 Project Track Proposals & Judging",
    crm: "School Partnerships & Growth CRM",
    evolve: "Evolve 8.0 School Registrations",
    enquiries: "Website Enquiry Inbox & Newsletter Subscribers",
  };

  return (
    <div className="flex min-h-screen bg-[#f4f3fa] text-[#0d002b]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0d002b]/60 lg:hidden print:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Dark Brand Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-[#100038] text-white transition-transform duration-200 lg:static lg:translate-x-0 print:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <Link href="/" className="flex items-center gap-2">
              <KhlcLogo className="h-9 w-auto" variant="dark" />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 pt-4">
            <span className="inline-block rounded-full bg-[#9dff13]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9dff13]">
              KHLC Admin Console
            </span>
          </div>

          {/* Quiz Engine Nav */}
          <div className="mt-4 px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
              Evolve 8.0 Quiz Engine
            </p>
          </div>
          <nav className="mt-1.5 space-y-1 px-3">
            {quizSidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-[#3b00b3] text-white shadow-md"
                      : "text-white/75 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        active ? "text-[#9dff13]" : "text-white/60"
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      active
                        ? "bg-[#9dff13] text-[#0d002b]"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* CRM & Operations Nav */}
          <div className="mt-5 px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
              Operations &amp; Growth
            </p>
          </div>
          <nav className="mt-1.5 space-y-1 px-3">
            {opsSidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-[#3b00b3] text-white shadow-md"
                      : "text-white/75 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        active ? "text-[#9dff13]" : "text-white/60"
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      active
                        ? "bg-[#9dff13] text-[#0d002b]"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Upcoming Modules */}
          <div className="mt-6 px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
              Next Modules
            </p>
            <div className="mt-2 space-y-1">
              {upcomingModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.label}
                    className="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs text-white/45"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{mod.label}</span>
                    </span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] uppercase">
                      Soon
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Site Links & DB Status */}
        <div className="border-t border-white/10 p-4 space-y-2.5">
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-[11px]">
            <Database
              className={`h-3.5 w-3.5 ${
                apiConnected ? "text-[#9dff13]" : "text-[#38e0ff]"
              }`}
            />
            <span className="text-white/80">
              {apiConnected
                ? dbStatus === "connected"
                  ? "Neon Postgres Connected"
                  : "Go API Connected"
                : "Local CRM Mode"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-white/75 px-1">
            <Link
              href="/evolve/quiz"
              className="inline-flex items-center gap-1 hover:text-[#9dff13]"
            >
              <span>Quiz Portal</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="/evolve/results"
              className="inline-flex items-center gap-1 hover:text-[#9dff13]"
            >
              <span>Results Page</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 py-2 text-[11px] font-bold text-white/80 hover:border-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-[#0d002b]"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#0d002b]">
                {headerTitle[activeSection]}
              </h1>
              <p className="text-[11px] text-gray-500">
                Kingshouse Learning Centre · Evolve 8.0 Competition &amp; CRM
                Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {apiBase && (
              <button
                type="button"
                onClick={() => syncWithBackend()}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#0d002b] hover:border-[#3b00b3]"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            <Link
              href="/evolve/results"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#faf6ff] border border-[#3b00b3]/20 px-3.5 py-2 text-xs font-extrabold text-[#3b00b3] hover:bg-[#3b00b3] hover:text-white transition-colors"
            >
              <span>Official Results</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeSection === "quizzes" && (
            <QuizManagerModule
              quizzes={quizzes}
              onCreateQuiz={handleCreateQuiz}
              onUpdateQuiz={handleUpdateQuiz}
              onDeleteQuiz={handleDeleteQuiz}
            />
          )}

          {activeSection === "questions" && (
            <QuestionBankModule
              questions={questions}
              quizzes={quizzes}
              onCreateQuestion={handleCreateQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onImportCsv={handleImportCsv}
            />
          )}

          {activeSection === "students" && (
            <QuizStudentsModule
              students={students}
              onCreateStudent={handleCreateStudent}
              onDeleteStudent={handleDeleteStudent}
              onImportRegistrations={handleImportRegistrations}
              onResetAttempt={handleResetAttempt}
            />
          )}

          {activeSection === "projects" && (
            <ProjectSubmissionsModule
              submissions={projects}
              onReviewProject={handleReviewProject}
            />
          )}

          {activeSection === "crm" && (
            <CrmModule
              leads={leads}
              onAddLead={handleAddLead}
              onUpdateLead={handleUpdateLead}
              onAddActivity={handleAddActivity}
              onDeleteLead={handleDeleteLead}
            />
          )}

          {activeSection === "evolve" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#0d002b]">
                    Evolve 8.0 Registered Schools &amp; Teams
                  </h2>
                  <p className="text-xs text-gray-500">
                    Live `/evolve` school registrations persisted in Neon
                    Postgres. Import test pupils into the Student Roster with
                    one click.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection("students")}
                    className="rounded-xl bg-[#100038] px-4 py-2.5 text-xs font-extrabold text-[#9dff13] hover:bg-[#3b00b3] hover:text-white"
                  >
                    Generate Exam Slips →
                  </button>
                  <Link
                    href="/evolve#register"
                    className="rounded-xl bg-[#3b00b3] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
                  >
                    Open Registration Form ↗
                  </Link>
                </div>
              </div>

              {liveEvolveRegs.length > 0 ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] uppercase text-gray-400">
                        <th className="py-3 px-3">Ref</th>
                        <th className="py-3 px-3">School</th>
                        <th className="py-3 px-3">Track</th>
                        <th className="py-3 px-3">Path &amp; Theme</th>
                        <th className="py-3 px-3">Coordinator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {liveEvolveRegs.map((reg) => (
                        <tr key={reg.id}>
                          <td className="py-3 px-3 font-extrabold text-[#3b00b3]">
                            {reg.referenceId}
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-bold">{reg.schoolName}</p>
                            <p className="text-xs text-gray-500">
                              {reg.schoolLocation}
                            </p>
                          </td>
                          <td className="py-3 px-3 uppercase text-xs font-bold">
                            {reg.track}
                          </td>
                          <td className="py-3 px-3 text-xs text-gray-600">
                            {reg.projectPath || "Online Test"}{" "}
                            {reg.projectTheme ? `· ${reg.projectTheme}` : ""}
                          </td>
                          <td className="py-3 px-3 text-xs">
                            <p className="font-bold">{reg.coordinatorName}</p>
                            <p className="text-gray-500">{reg.phone}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-[#faf9ff] p-6 text-center">
                  <p className="text-sm font-extrabold text-[#0d002b]">
                    No live school registrations submitted yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Schools registering on <code>/evolve#register</code> will
                    stream here automatically.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeSection === "enquiries" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-extrabold text-[#0d002b]">
                    Website Enquiry Inbox ({liveEnquiries.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Incoming submissions from the main website contact pathways
                    can be promoted to CRM deals in one click.
                  </p>
                </div>

                {liveEnquiries.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {liveEnquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-100 bg-[#faf9ff] p-4"
                      >
                        <div>
                          <span className="rounded-full bg-[#3b00b3]/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#3b00b3]">
                            {enq.pathway}
                          </span>
                          <h3 className="mt-1.5 text-sm font-extrabold text-[#0d002b]">
                            {enq.fullName} · {enq.orgDetail}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {enq.focus} · {enq.phone} · {enq.email}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => promoteEnquiryToCrm(enq)}
                          className="shrink-0 rounded-xl bg-[#3b00b3] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
                        >
                          Promote to CRM →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-[#faf9ff] p-6 text-center">
                    <p className="text-sm font-extrabold text-[#0d002b]">
                      No live API enquiries fetched yet
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Website enquiries sent to{" "}
                      <code>POST /api/v1/enquiries</code> will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Newsletter Subscribers Panel */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#0d002b]">
                      <Mail className="h-5 w-5 text-[#3b00b3]" />
                      <span>
                        Newsletter Subscribers ({subscribers.length})
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500">
                      Emails collected from the footer signup banner across all
                      public pages, stored in Neon Postgres.
                    </p>
                  </div>
                  {subscribers.length > 0 && (
                    <button
                      type="button"
                      onClick={exportSubscribersCsv}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#100038] px-4 py-2 text-xs font-extrabold text-[#9dff13] hover:bg-[#3b00b3] hover:text-white"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>

                {subscribers.length > 0 ? (
                  <div className="mt-4 divide-y divide-gray-100">
                    {subscribers.map((sub) => (
                      <div
                        key={sub.email}
                        className="flex items-center justify-between py-2.5 text-xs"
                      >
                        <span className="font-bold text-[#0d002b]">
                          {sub.email}
                        </span>
                        <span className="text-gray-400">
                          {new Date(sub.subscribedAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-center text-xs text-gray-500">
                    No newsletter subscribers recorded yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
