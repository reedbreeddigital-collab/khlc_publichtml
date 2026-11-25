"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarClock,
  FileQuestion,
  Users,
  Cpu,
  Kanban,
  Trophy,
  Inbox,
  ArrowRight,
  ClipboardList,
  Clock,
} from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { formatDuration } from "@/lib/quizApi";

export default function AdminOverviewPage() {
  const {
    quizzes,
    questions,
    students,
    attempts,
    projects,
    leads,
    liveEvolveRegs,
    liveEnquiries,
    subscribers,
  } = useAdmin();

  const cards = [
    {
      href: "/admin/quizzes",
      label: "Scheduled Quizzes",
      value: quizzes.length,
      sub: `${quizzes.filter((q) => q.status === "live").length} live now`,
      icon: CalendarClock,
    },
    {
      href: "/admin/questions",
      label: "Question Bank",
      value: questions.length,
      sub: "Shared & level-specific MCQs",
      icon: FileQuestion,
    },
    {
      href: "/admin/students",
      label: "Student Roster",
      value: students.length,
      sub: `${attempts.length} quiz attempt(s) logged`,
      icon: Users,
    },
    {
      href: "/admin/projects",
      label: "Project Submissions",
      value: projects.length,
      sub: "Proposals, videos & 100-mark rubric",
      icon: Cpu,
    },
    {
      href: "/admin/crm",
      label: "CRM Pipeline",
      value: leads.length,
      sub: "School & partner deals",
      icon: Kanban,
    },
    {
      href: "/admin/evolve",
      label: "Evolve 8.0 Entries",
      value: liveEvolveRegs.length,
      sub: "Registered schools & teams",
      icon: Trophy,
    },
    {
      href: "/admin/enquiries",
      label: "Enquiries & Subscribers",
      value: liveEnquiries.length + subscribers.length,
      sub: `${liveEnquiries.length} enquiries · ${subscribers.length} newsletter`,
      icon: Inbox,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#3b00b3]/35 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf6ff] text-[#3b00b3] group-hover:bg-[#3b00b3] group-hover:text-[#9dff13] transition-colors">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#3b00b3] transition-colors" />
              </div>
              <p className="mt-4 text-2xl font-extrabold text-[#0d002b]">
                {card.value}
              </p>
              <p className="text-xs font-extrabold text-[#0d002b]">
                {card.label}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Live Quiz Attempts Feed */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#3b00b3]" />
            <div>
              <h2 className="text-base font-extrabold text-[#0d002b]">
                Recent Student Quiz Attempts ({attempts.length})
              </h2>
              <p className="text-xs text-gray-500">
                Live feed from Neon Postgres across Junior, Intermediate, and
                Senior sittings.
              </p>
            </div>
          </div>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b00b3] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
          >
            <span>Open Student Roster &amp; Log</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {attempts.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-500">
            No student quiz attempts recorded yet. Students can sit exams at{" "}
            <Link href="/evolve/quiz" className="font-bold text-[#3b00b3] underline">
              /evolve/quiz
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 divide-y divide-gray-100">
            {attempts.slice(0, 8).map((att) => (
              <div
                key={att.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
              >
                <div>
                  <p className="font-extrabold text-[#0d002b]">
                    {att.fullName}{" "}
                    <span className="font-mono text-[#3b00b3]">
                      ({att.examCode})
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {att.schoolName} · {att.level.toUpperCase()} ·{" "}
                    {new Date(att.startedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-[#3b00b3]" />
                    {formatDuration(att.timeTakenSeconds)}
                  </span>
                  <span className="font-extrabold text-[#0d002b]">
                    {att.scoreOutOf1000} / 1,000
                  </span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
