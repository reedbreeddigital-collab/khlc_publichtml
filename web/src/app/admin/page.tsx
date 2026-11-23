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
} from "lucide-react";
import KhlcLogo from "@/components/KhlcLogo";
import CrmModule from "@/components/admin/CrmModule";
import {
  initialCrmLeads,
  type CrmLead,
  type LeadActivity,
} from "@/data/crm";

type AdminSection = "crm" | "evolve" | "enquiries";

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

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("crm");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [leads, setLeads] = useState<CrmLead[]>(initialCrmLeads);
  const [apiConnected, setApiConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [liveEnquiries, setLiveEnquiries] = useState<LiveEnquiry[]>([]);
  const [liveEvolveRegs, setLiveEvolveRegs] = useState<LiveEvolveReg[]>([]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

  // Load persisted leads from localStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Persist leads to localStorage whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch {
      // ignore storage errors
    }
  }, [leads]);

  const syncWithBackend = useCallback(async () => {
    if (!apiBase) return;
    setSyncing(true);
    try {
      const [leadsRes, enqRes, evolveRes] = await Promise.all([
        fetch(`${apiBase}/api/v1/crm/leads`),
        fetch(`${apiBase}/api/v1/enquiries`),
        fetch(`${apiBase}/api/v1/evolve/registrations`),
      ]);
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
    } catch {
      setApiConnected(false);
    } finally {
      setSyncing(false);
    }
  }, [apiBase]);

  useEffect(() => {
    if (apiBase) {
      syncWithBackend();
    }
  }, [apiBase, syncWithBackend]);

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
        // local state already updated
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
        // local state already updated
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
        // local state already updated
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
        // local state already updated
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

  const sidebarItems = [
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
      label: "Enquiry Inbox",
      badge: String(liveEnquiries.length),
      icon: Inbox,
    },
  ];

  const upcomingModules = [
    { label: "Partner Schools", icon: Building2 },
    { label: "Instructors & Deployment", icon: GraduationCap },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f3fa] text-[#0d002b]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0d002b]/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Dark Brand Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-[#100038] text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Header */}
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

          {/* Primary Admin Nav */}
          <nav className="mt-4 space-y-1 px-3">
            {sidebarItems.map((item) => {
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

          {/* Upcoming Modules Preview */}
          <div className="mt-7 px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
              Next Modules
            </p>
            <div className="mt-2.5 space-y-1.5">
              {upcomingModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.label}
                    className="flex items-center justify-between rounded-xl px-2 py-2 text-xs text-white/45"
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

        {/* Bottom Site Links & Sync Status */}
        <div className="border-t border-white/10 p-4 space-y-2.5">
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-[11px]">
            <Database
              className={`h-3.5 w-3.5 ${
                apiConnected ? "text-[#9dff13]" : "text-[#38e0ff]"
              }`}
            />
            <span className="text-white/80">
              {apiConnected ? "Go API Connected" : "Local CRM Mode"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-white/70 px-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-[#9dff13]"
            >
              <span>Website</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="/evolve"
              className="inline-flex items-center gap-1 hover:text-[#9dff13]"
            >
              <span>Evolve 8.0</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
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
                {activeSection === "crm"
                  ? "School Partnerships & Growth CRM"
                  : activeSection === "evolve"
                  ? "Evolve 8.0 School Registrations"
                  : "Website Enquiry Inbox"}
              </h1>
              <p className="text-[11px] text-gray-500">
                Kingshouse Learning Centre · Business Development &amp;
                Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {apiBase && (
              <button
                type="button"
                onClick={syncWithBackend}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#0d002b] hover:border-[#3b00b3]"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Sync API</span>
              </button>
            )}
            <Link
              href="/evolve#register"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#faf6ff] border border-[#3b00b3]/20 px-3.5 py-2 text-xs font-extrabold text-[#3b00b3] hover:bg-[#3b00b3] hover:text-white transition-colors"
            >
              <span>Evolve 8.0 Form</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Active View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
                    Connect `NEXT_PUBLIC_API_URL` to your Go backend to stream
                    live `/evolve` form submissions here automatically.
                  </p>
                </div>
                <Link
                  href="/evolve#register"
                  className="rounded-xl bg-[#3b00b3] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
                >
                  Open Registration Form ↗
                </Link>
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
                    Showing Evolve 8.0 Leads inside CRM Pipeline
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {leads.filter((l) => l.segment === "Evolve 8.0").length}{" "}
                    Evolve 8.0 school deal(s) are currently tracked in the CRM
                    Pipeline. Deploy the Go backend and set{" "}
                    <code className="rounded bg-white px-1.5 py-0.5 text-[#3b00b3]">
                      NEXT_PUBLIC_API_URL
                    </code>{" "}
                    for live server-side sync.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection("crm")}
                    className="mt-4 rounded-xl bg-[#3b00b3] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
                  >
                    View in CRM Pipeline
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "enquiries" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-extrabold text-[#0d002b]">
                  Website Enquiry Inbox
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
                    Connect the Go backend (`NEXT_PUBLIC_API_URL`) to display
                    inbound `POST /api/v1/enquiries` submissions here, or add
                    leads directly inside the CRM Pipeline.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection("crm")}
                    className="mt-4 rounded-xl bg-[#3b00b3] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
                  >
                    Go to CRM Pipeline
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
