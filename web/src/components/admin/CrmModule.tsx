"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Download,
  LayoutGrid,
  List,
  PhoneCall,
  Mail,
  MessageCircle,
  MapPin,
  Calendar,
  Building2,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  X,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Send,
  Sparkles,
} from "lucide-react";
import {
  CRM_STAGES,
  CRM_SEGMENTS,
  formatNaira,
  normalizeNigeriaWhatsApp,
  type CrmLead,
  type LeadStage,
  type LeadSegment,
  type LeadPriority,
  type LeadActivity,
} from "@/data/crm";

interface CrmModuleProps {
  leads: CrmLead[];
  onAddLead: (lead: Omit<CrmLead, "id" | "createdAt" | "activities">) => void;
  onUpdateLead: (id: string, patch: Partial<CrmLead>) => void;
  onAddActivity: (id: string, activity: Omit<LeadActivity, "id" | "timestamp">) => void;
  onDeleteLead: (id: string) => void;
}

const KANBAN_STAGES: LeadStage[] = [
  "new",
  "contacted",
  "proposal",
  "negotiation",
  "won",
];

export default function CrmModule({
  leads,
  onAddLead,
  onUpdateLead,
  onAddActivity,
  onDeleteLead,
}: CrmModuleProps) {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("All");
  const [stageFilter, setStageFilter] = useState<string>("All");

  // Detail Drawer
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteType, setNoteType] = useState<LeadActivity["type"]>("Call");
  const [noteText, setNoteText] = useState("");

  // Add Lead Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrg, setNewOrg] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newRole, setNewRole] = useState("Proprietor / Principal");
  const [newSegment, setNewSegment] = useState<LeadSegment>("School Partnership");
  const [newStage, setNewStage] = useState<LeadStage>("new");
  const [newPriority, setNewPriority] = useState<LeadPriority>("High");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLocation, setNewLocation] = useState("Lagos");
  const [newProgram, setNewProgram] = useState(
    "Full School Technology Program (ICT + Coding + Robotics)"
  );
  const [newStudents, setNewStudents] = useState("250");
  const [newValue, setNewValue] = useState("1500000");
  const [newAssigned, setNewAssigned] = useState("BD Team · Lagos");
  const [newFollowUp, setNewFollowUp] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
  );
  const [newNotes, setNewNotes] = useState("");

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (segmentFilter !== "All" && lead.segment !== segmentFilter) {
        return false;
      }
      if (stageFilter !== "All" && lead.stage !== stageFilter) {
        return false;
      }
      if (!q) return true;
      return (
        lead.organization.toLowerCase().includes(q) ||
        lead.contactName.toLowerCase().includes(q) ||
        lead.location.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        lead.programInterest.toLowerCase().includes(q)
      );
    });
  }, [leads, search, segmentFilter, stageFilter]);

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) || null,
    [leads, selectedLeadId]
  );

  // KPIs
  const totalLeads = leads.length;
  const activePipelineValue = leads
    .filter((l) => l.stage !== "won" && l.stage !== "lost")
    .reduce((sum, l) => sum + (l.estimatedValueNgn || 0), 0);
  const wonLeads = leads.filter((l) => l.stage === "won");
  const wonValue = wonLeads.reduce(
    (sum, l) => sum + (l.estimatedValueNgn || 0),
    0
  );
  const highPriorityCount = leads.filter(
    (l) => l.priority === "High" && l.stage !== "won" && l.stage !== "lost"
  ).length;

  const moveStage = (lead: CrmLead, delta: -1 | 1) => {
    const idx = KANBAN_STAGES.indexOf(lead.stage);
    if (idx === -1) return;
    const nextIdx = idx + delta;
    if (nextIdx < 0 || nextIdx >= KANBAN_STAGES.length) return;
    onUpdateLead(lead.id, { stage: KANBAN_STAGES[nextIdx] });
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrg.trim() || !newContact.trim()) return;
    onAddLead({
      organization: newOrg.trim(),
      contactName: newContact.trim(),
      contactRole: newRole.trim(),
      segment: newSegment,
      stage: newStage,
      priority: newPriority,
      phone: newPhone.trim(),
      email: newEmail.trim(),
      location: newLocation.trim(),
      programInterest: newProgram.trim(),
      studentCount: parseInt(newStudents, 10) || undefined,
      estimatedValueNgn: parseInt(newValue.replace(/\D/g, ""), 10) || 0,
      assignedTo: newAssigned.trim(),
      nextFollowUp: newFollowUp,
      notes: newNotes.trim(),
    });
    setNewOrg("");
    setNewContact("");
    setNewPhone("");
    setNewEmail("");
    setNewNotes("");
    setShowAddModal(false);
  };

  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !noteText.trim()) return;
    onAddActivity(selectedLead.id, {
      type: noteType,
      summary: noteText.trim(),
      author: "KHLC Admin",
    });
    setNoteText("");
  };

  const exportCsv = () => {
    const headers = [
      "ID",
      "Organization",
      "Contact",
      "Role",
      "Segment",
      "Stage",
      "Priority",
      "Phone",
      "Email",
      "Location",
      "Program",
      "Students",
      "Est. Value (NGN)",
      "Next Follow-Up",
    ];
    const rows = filteredLeads.map((l) => [
      l.id,
      l.organization,
      l.contactName,
      l.contactRole,
      l.segment,
      l.stage,
      l.priority,
      l.phone,
      l.email,
      l.location,
      l.programInterest,
      l.studentCount ?? "",
      l.estimatedValueNgn,
      l.nextFollowUp,
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khlc-crm-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStageMeta = (stage: LeadStage) =>
    CRM_STAGES.find((s) => s.id === stage) || CRM_STAGES[0];

  return (
    <div className="space-y-6">
      {/* 1. KPI Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total CRM Leads
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3b00b3]/10 text-[#3b00b3]">
              <Users className="h-4.5 w-4.5" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#0d002b]">
            {totalLeads}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Schools, Evolve 8.0, Parents &amp; CSR Partners
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Active Pipeline Value
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#38e0ff]/20 text-[#0080a8]">
              <TrendingUp className="h-4.5 w-4.5" />
            </span>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#0d002b]">
            {formatNaira(activePipelineValue)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Open proposals &amp; negotiations
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Partners Won
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-700">
            {wonLeads.length}{" "}
            <span className="text-sm font-bold text-gray-500">
              ({formatNaira(wonValue)})
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Converted termly revenue
          </p>
        </div>

        <div className="rounded-2xl border border-[#3b00b3]/20 bg-[#100038] p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9dff13]">
              Hot Priority Leads
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#9dff13]">
              <Clock className="h-4.5 w-4.5" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">
            {highPriorityCount}
          </p>
          <p className="mt-1 text-xs text-white/75">
            High-priority deals needing follow-up
          </p>
        </div>
      </div>

      {/* 2. Toolbar: Search, Filters, View Switcher & Actions */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schools, contacts, locations, programs..."
              className="w-full rounded-xl border border-gray-200 bg-[#faf9ff] py-2.5 pr-4 pl-10 text-xs sm:text-sm text-[#0d002b] placeholder-gray-400 focus:border-[#3b00b3] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Segment Filter */}
          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            aria-label="Filter by segment"
            className="rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs font-bold text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
          >
            <option value="All">All Segments</option>
            {CRM_SEGMENTS.map((seg) => (
              <option key={seg} value={seg}>
                {seg}
              </option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            aria-label="Filter by stage"
            className="rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs font-bold text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
          >
            <option value="All">All Stages</option>
            {CRM_STAGES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="inline-flex rounded-xl border border-gray-200 bg-[#faf9ff] p-1">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                viewMode === "kanban"
                  ? "bg-[#3b00b3] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#0d002b]"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                viewMode === "table"
                  ? "bg-[#3b00b3] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#0d002b]"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#0d002b] hover:border-[#3b00b3] hover:text-[#3b00b3] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b00b3] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#9dff13] hover:text-[#0d002b]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* 3. Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {KANBAN_STAGES.map((stageId) => {
            const meta = getStageMeta(stageId);
            const stageLeads = filteredLeads.filter((l) => l.stage === stageId);
            const stageTotal = stageLeads.reduce(
              (s, l) => s + (l.estimatedValueNgn || 0),
              0
            );

            return (
              <div
                key={stageId}
                className="flex flex-col rounded-2xl border border-gray-100 bg-[#f6f5fc] p-3"
              >
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${meta.dotColor}`} />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0d002b]">
                      {meta.label}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-[#3b00b3] shadow-xs">
                    {stageLeads.length}
                  </span>
                </div>
                <p className="mb-3 px-1 text-[11px] font-bold text-gray-500">
                  {formatNaira(stageTotal)}
                </p>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-3">
                  {stageLeads.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white/50 p-4 text-center text-[11px] text-gray-400">
                      No leads in {meta.shortLabel}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#3b00b3]/30 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="rounded-md bg-[#faf6ff] px-2 py-0.5 text-[10px] font-extrabold text-[#3b00b3]">
                            {lead.segment}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                              lead.priority === "High"
                                ? "bg-rose-50 text-rose-600"
                                : lead.priority === "Medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {lead.priority}
                          </span>
                        </div>

                        <h4 className="mt-2.5 text-sm font-extrabold leading-snug text-[#0d002b] group-hover:text-[#3b00b3]">
                          {lead.organization}
                        </h4>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {lead.contactName} · {lead.contactRole}
                        </p>

                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                          <MapPin className="h-3 w-3 text-[#3b00b3] shrink-0" />
                          <span className="truncate">{lead.location}</span>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
                          <span className="text-xs font-extrabold text-[#0d002b]">
                            {formatNaira(lead.estimatedValueNgn)}
                          </span>

                          {/* Quick Stage Arrows */}
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              disabled={stageId === "new"}
                              onClick={() => moveStage(lead, -1)}
                              title="Move back one stage"
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-[#3b00b3] hover:text-[#3b00b3] disabled:opacity-25"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={stageId === "won"}
                              onClick={() => moveStage(lead, 1)}
                              title="Advance one stage"
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-[#3b00b3] hover:text-[#3b00b3] disabled:opacity-25"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-[#faf9ff] text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-4 font-extrabold">School / Lead</th>
                  <th className="py-3.5 px-4 font-extrabold">Segment</th>
                  <th className="py-3.5 px-4 font-extrabold">Stage</th>
                  <th className="py-3.5 px-4 font-extrabold">Est. Value</th>
                  <th className="py-3.5 px-4 font-extrabold">Follow-Up</th>
                  <th className="py-3.5 px-4 font-extrabold text-right">
                    Quick Contact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => {
                  const stageMeta = getStageMeta(lead.stage);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="cursor-pointer transition-colors hover:bg-[#faf6ff]/60"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-[#0d002b]">
                          {lead.organization}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lead.contactName} · {lead.location}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-[#faf6ff] px-2.5 py-1 text-[11px] font-bold text-[#3b00b3]">
                          {lead.segment}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={lead.stage}
                          onChange={(e) =>
                            onUpdateLead(lead.id, {
                              stage: e.target.value as LeadStage,
                            })
                          }
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-extrabold focus:outline-none ${stageMeta.badgeClass}`}
                        >
                          {CRM_STAGES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#0d002b]">
                        {formatNaira(lead.estimatedValueNgn)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {lead.nextFollowUp || "—"}
                      </td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${normalizeNigeriaWhatsApp(
                                lead.phone
                              )}?text=${encodeURIComponent(
                                `Hello ${lead.contactName}, reaching out from Kingshouse Learning Centre regarding ${lead.programInterest}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp lead"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              title="Email lead"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#faf6ff] text-[#3b00b3] hover:bg-[#3b00b3] hover:text-white transition-colors"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Slide-Over Lead Detail Drawer */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#0d002b]/50 backdrop-blur-xs"
          onClick={() => setSelectedLeadId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-gray-100 bg-[#100038] p-6 text-white">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#9dff13] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0d002b]">
                    {selectedLead.segment}
                  </span>
                  <span className="text-[11px] text-white/60">
                    ID: {selectedLead.id}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-extrabold">
                  {selectedLead.organization}
                </h3>
                <p className="mt-0.5 text-xs text-white/75">
                  {selectedLead.contactName} · {selectedLead.contactRole}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLeadId(null)}
                aria-label="Close drawer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Outreach Bar */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 bg-[#faf9ff] px-6 py-3.5">
              {selectedLead.phone && (
                <>
                  <a
                    href={`https://wa.me/${normalizeNigeriaWhatsApp(
                      selectedLead.phone
                    )}?text=${encodeURIComponent(
                      `Hello ${selectedLead.contactName}, following up from Kingshouse Learning Centre regarding ${selectedLead.programInterest} for ${selectedLead.organization}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3.5 py-2 text-xs font-extrabold text-[#0d002b] hover:opacity-90"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0d002b] hover:border-[#3b00b3]"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-[#3b00b3]" />
                    <span>{selectedLead.phone}</span>
                  </a>
                </>
              )}
              {selectedLead.email && (
                <a
                  href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(
                    `Kingshouse Learning Centre — ${selectedLead.programInterest}`
                  )}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0d002b] hover:border-[#3b00b3]"
                >
                  <Mail className="h-3.5 w-3.5 text-[#3b00b3]" />
                  <span>Email</span>
                </a>
              )}
            </div>

            {/* Editable Pipeline Fields */}
            <div className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Pipeline Stage
                  </label>
                  <select
                    value={selectedLead.stage}
                    onChange={(e) =>
                      onUpdateLead(selectedLead.id, {
                        stage: e.target.value as LeadStage,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-extrabold text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                  >
                    {CRM_STAGES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Priority
                  </label>
                  <select
                    value={selectedLead.priority}
                    onChange={(e) =>
                      onUpdateLead(selectedLead.id, {
                        priority: e.target.value as LeadPriority,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-extrabold text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Est. Termly Value (₦)
                  </label>
                  <input
                    type="number"
                    value={selectedLead.estimatedValueNgn}
                    onChange={(e) =>
                      onUpdateLead(selectedLead.id, {
                        estimatedValueNgn: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-extrabold text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Next Follow-Up
                  </label>
                  <input
                    type="date"
                    value={selectedLead.nextFollowUp}
                    onChange={(e) =>
                      onUpdateLead(selectedLead.id, {
                        nextFollowUp: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2 text-xs font-extrabold text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                  />
                </div>
              </div>

              {/* Metadata Details */}
              <div className="rounded-2xl border border-gray-100 bg-[#faf9ff] p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#0d002b]">
                  <Sparkles className="h-3.5 w-3.5 text-[#3b00b3]" />
                  <strong>Program:</strong> {selectedLead.programInterest}
                </div>
                <div className="flex items-center gap-2 text-[#0d002b]">
                  <MapPin className="h-3.5 w-3.5 text-[#3b00b3]" />
                  <strong>Location:</strong> {selectedLead.location}
                </div>
                <div className="flex items-center gap-2 text-[#0d002b]">
                  <Building2 className="h-3.5 w-3.5 text-[#3b00b3]" />
                  <strong>Student Population:</strong>{" "}
                  {selectedLead.studentCount
                    ? `${selectedLead.studentCount} learners`
                    : "Not specified"}
                </div>
                <div className="flex items-center gap-2 text-[#0d002b]">
                  <Calendar className="h-3.5 w-3.5 text-[#3b00b3]" />
                  <strong>Owner:</strong> {selectedLead.assignedTo} · Added{" "}
                  {selectedLead.createdAt}
                </div>
                {selectedLead.notes && (
                  <p className="mt-2 border-t border-gray-200/70 pt-2 text-gray-600 leading-relaxed">
                    {selectedLead.notes}
                  </p>
                )}
              </div>

              {/* Log Activity Form */}
              <form
                onSubmit={handleAddActivitySubmit}
                className="rounded-2xl border border-gray-200 p-4"
              >
                <p className="text-xs font-extrabold text-[#0d002b]">
                  Log Activity / Follow-Up Note
                </p>
                <div className="mt-2.5 flex gap-2">
                  <select
                    value={noteType}
                    onChange={(e) =>
                      setNoteType(e.target.value as LeadActivity["type"])
                    }
                    className="rounded-lg border border-gray-200 bg-[#faf9ff] px-2.5 py-2 text-xs font-bold text-[#0d002b]"
                  >
                    <option value="Call">Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Campus Visit">Campus Visit</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Note">Note</option>
                  </select>
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="e.g., Spoke with proprietress, scheduled lab demo..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-[#0d002b] focus:border-[#3b00b3] focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Save activity"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3b00b3] text-white hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>

              {/* Activity Timeline */}
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  Activity Timeline ({selectedLead.activities.length})
                </p>
                <div className="mt-3 space-y-2.5">
                  {selectedLead.activities.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      No activities logged yet.
                    </p>
                  ) : (
                    selectedLead.activities.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-xl border border-gray-100 bg-[#faf9ff] p-3 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded bg-[#3b00b3]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#3b00b3]">
                            {act.type}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {act.timestamp} · {act.author}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[#0d002b]">{act.summary}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteLead(selectedLead.id);
                    setSelectedLeadId(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Lead Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d002b]/60 p-4 backdrop-blur-xs"
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#0d002b]">
                  Add New CRM Lead
                </h3>
                <p className="text-xs text-gray-500">
                  Track a prospective school, Evolve 8.0 entry, parent, or CSR
                  partner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#3b00b3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    School / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    placeholder="e.g., Royal Heritage Schools"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="e.g., Mrs. Kemi Adewale"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Contact Role
                  </label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Segment
                  </label>
                  <select
                    value={newSegment}
                    onChange={(e) =>
                      setNewSegment(e.target.value as LeadSegment)
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  >
                    {CRM_SEGMENTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0803 000 0000"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin@school.edu.ng"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Amuwo Odofin, Lagos"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Est. Termly Value (₦)
                  </label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Pipeline Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as LeadStage)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  >
                    {CRM_STAGES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Priority &amp; Follow-Up Date
                  </label>
                  <div className="mt-1 flex gap-2">
                    <select
                      value={newPriority}
                      onChange={(e) =>
                        setNewPriority(e.target.value as LeadPriority)
                      }
                      className="rounded-xl border border-gray-200 bg-[#faf9ff] px-2.5 py-2.5 text-xs font-bold"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <input
                      type="date"
                      value={newFollowUp}
                      onChange={(e) => setNewFollowUp(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 bg-[#faf9ff] px-3 py-2.5 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Student Population (Optional)
                  </label>
                  <input
                    type="number"
                    value={newStudents}
                    onChange={(e) => setNewStudents(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d002b]">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={newAssigned}
                    onChange={(e) => setNewAssigned(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d002b]">
                  Program Interest
                </label>
                <input
                  type="text"
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d002b]">
                  Initial Notes
                </label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key context from first call or enquiry..."
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#3b00b3] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
                >
                  Save Lead to CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
