"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Search,
  Clock,
  Medal,
  Award,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Lock,
  RefreshCw,
} from "lucide-react";
import KhlcLogo from "@/components/KhlcLogo";
import FooterSection from "@/components/FooterSection";
import {
  apiRequest,
  formatDuration,
  levelLabel,
  type CompetitionLevel,
  type ResultsResponse,
  type LevelResults,
} from "@/lib/quizApi";

const LEVELS: { id: CompetitionLevel; label: string; classes: string }[] = [
  { id: "junior", label: "Junior", classes: "Primary 4 – 6" },
  { id: "intermediate", label: "Intermediate", classes: "JSS 1 – 3" },
  { id: "senior", label: "Senior", classes: "SS 1 – 3" },
];

export default function EvolveResultsPage() {
  const [activeLevel, setActiveLevel] = useState<CompetitionLevel>("junior");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [data, setData] = useState<ResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = useCallback(async (q: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const qs = params.toString();
      const res = await apiRequest<ResultsResponse>(
        `/api/v1/evolve/results${qs ? `?${qs}` : ""}`
      );
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load official Evolve 8.0 results right now."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(submittedQuery);
  }, [submittedQuery, fetchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery.trim());
  };

  const currentLevelData: LevelResults | undefined = data?.levels.find(
    (l) => l.level === activeLevel
  );

  return (
    <main className="min-h-screen bg-[#f4f3fa] text-[#0d002b] flex flex-col">
      {/* Dark Brand Hero & Lookup Bar */}
      <div className="bg-[#100038] text-white">
        <header className="border-b border-white/10 bg-[#140047]/90 px-4 py-3.5 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/evolve" className="flex items-center gap-3">
              <KhlcLogo className="h-9 w-auto" variant="dark" />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#9dff13]/15 px-3 py-1 text-[11px] font-extrabold text-[#9dff13]">
                <Trophy className="h-3.5 w-3.5" />
                EVOLVE 8.0 OFFICIAL RESULTS
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/evolve/quiz"
                className="rounded-lg bg-[#9dff13] px-3.5 py-2 text-xs font-extrabold text-[#0d002b] hover:bg-[#38e0ff] transition-colors"
              >
                Take Online Test →
              </Link>
              <Link
                href="/evolve"
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white/85 hover:text-[#9dff13]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Evolve 8.0</span>
              </Link>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9dff13]/30 bg-white/5 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#9dff13]">
            <Sparkles className="h-3.5 w-3.5" />
            Phase 1 · National Online General Test Rankings
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight">
            Evolve 8.0 <span className="text-[#9dff13]">National Rankings</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/75">
            Official passing pupils scoring <strong>700 / 1,000 (70%)</strong>{" "}
            and above across Junior, Intermediate, and Senior levels. Ties are
            ranked strictly by faster completion time.
          </p>

          {/* Individual Result Lookup Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-7 flex max-w-xl flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Exam ID (e.g. EV8-JUN-1001) or School Name..."
                className="w-full rounded-xl bg-white py-3 pl-10 pr-4 text-xs sm:text-sm font-medium text-[#0d002b] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9dff13]"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#9dff13] px-5 py-3 text-xs sm:text-sm font-extrabold text-[#0d002b] hover:bg-[#38e0ff] transition-colors"
            >
              Verify Result
            </button>
            {submittedQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSubmittedQuery("");
                }}
                className="rounded-xl border border-white/20 px-4 py-3 text-xs font-bold text-white hover:bg-white/10"
              >
                Clear
              </button>
            )}
          </form>

          {/* Exact Exam ID Lookup Card */}
          {data?.lookup && (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-[#9dff13]/40 bg-white/10 p-5 text-left backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-extrabold text-[#9dff13]">
                  {data.lookup.examCode} · {levelLabel(data.lookup.level)}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                    data.lookup.passed
                      ? "bg-[#9dff13] text-[#0d002b]"
                      : "bg-amber-400 text-[#0d002b]"
                  }`}
                >
                  {data.lookup.passed
                    ? `National Rank #${data.lookup.rank}`
                    : "Below Pass Mark"}
                </span>
              </div>
              <p className="mt-2 text-lg font-extrabold text-white">
                {data.lookup.fullName}
              </p>
              <p className="text-xs text-white/75">
                {data.lookup.schoolName}
                {data.lookup.className ? ` · ${data.lookup.className}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                <span>
                  Score:{" "}
                  <strong className="text-[#9dff13]">
                    {data.lookup.scoreOutOf1000} / 1,000
                  </strong>
                </span>
                <span>
                  Time:{" "}
                  <strong className="font-mono">
                    {formatDuration(data.lookup.timeTakenSeconds)}
                  </strong>
                </span>
              </div>
              {data.lookupNote && (
                <p className="mt-2 text-[11px] text-[#38e0ff]">
                  {data.lookupNote}
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Main Rankings Body */}
      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 space-y-8">
        {/* Level Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-gray-100">
            {LEVELS.map((lvl) => {
              const active = activeLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setActiveLevel(lvl.id)}
                  className={`rounded-xl px-4 py-2.5 text-left transition-all ${
                    active
                      ? "bg-[#3b00b3] text-white shadow-sm"
                      : "text-[#0d002b] hover:bg-[#faf6ff]"
                  }`}
                >
                  <p className="text-xs sm:text-sm font-extrabold leading-none">
                    {lvl.label}
                  </p>
                  <p
                    className={`mt-1 text-[10px] font-bold ${
                      active ? "text-[#9dff13]" : "text-gray-400"
                    }`}
                  >
                    {lvl.classes}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => fetchResults(submittedQuery)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0d002b] hover:border-[#3b00b3]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Standings</span>
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="text-sm font-bold text-gray-500">
              Loading official Evolve 8.0 national rankings...
            </p>
          </div>
        ) : !currentLevelData || !currentLevelData.resultsPublished ? (
          /* Pre-Publication State */
          <div className="rounded-3xl border border-[#3b00b3]/15 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf6ff] text-[#3b00b3]">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-[#0d002b]">
              {levelLabel(activeLevel)} Results Are Being Verified
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-gray-500 leading-relaxed">
              Kingshouse Learning Centre publishes official national rankings
              here immediately after the sitting window verification is complete
              (pass mark: 700 / 1,000, ties broken by faster completion time).
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/evolve/quiz"
                className="rounded-xl bg-[#3b00b3] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
              >
                Go to Student Quiz Portal →
              </Link>
              <Link
                href="/evolve"
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-extrabold text-[#0d002b] hover:border-[#3b00b3]"
              >
                Evolve 8.0 Competition Guide
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Strip */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-gray-400">
                  Verified Candidates
                </p>
                <p className="mt-1 text-2xl font-extrabold text-[#0d002b]">
                  {currentLevelData.totalParticipants}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-gray-400">
                  Passing Scholars (≥ {currentLevelData.passMark})
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                  {currentLevelData.totalPassed}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-gray-400">
                  Competition Standard
                </p>
                <p className="mt-1 text-sm font-extrabold text-[#3b00b3]">
                  Score / {currentLevelData.maxScore} · Faster Time Breaks Ties
                </p>
              </div>
            </div>

            {/* Top 3 Podium Showcase */}
            {currentLevelData.podium.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[#0d002b]">
                  <Medal className="h-5 w-5 text-[#3b00b3]" />
                  <span>Top 3 National Podium — {levelLabel(activeLevel)}</span>
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {currentLevelData.podium.map((entry) => {
                    const styles =
                      entry.rank === 1
                        ? "border-[#9dff13] bg-[#100038] text-white shadow-xl"
                        : entry.rank === 2
                        ? "border-[#3b00b3]/30 bg-white text-[#0d002b] shadow-sm"
                        : "border-amber-200 bg-white text-[#0d002b] shadow-sm";
                    return (
                      <div
                        key={entry.examCode}
                        className={`rounded-3xl border-2 p-6 ${styles}`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                              entry.rank === 1
                                ? "bg-[#9dff13] text-[#0d002b]"
                                : entry.rank === 2
                                ? "bg-[#3b00b3] text-white"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            <Trophy className="h-3.5 w-3.5" />
                            <span>#{entry.rank} National</span>
                          </span>
                          <span className="font-mono text-xs opacity-70">
                            {entry.examCode}
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-extrabold">
                          {entry.fullName}
                        </h3>
                        <p
                          className={`text-xs ${
                            entry.rank === 1 ? "text-white/75" : "text-gray-500"
                          }`}
                        >
                          {entry.schoolName}
                          {entry.schoolLocation
                            ? ` · ${entry.schoolLocation}`
                            : ""}
                        </p>
                        <div className="mt-5 flex items-end justify-between border-t border-current/10 pt-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase opacity-60">
                              Score
                            </p>
                            <p
                              className={`text-2xl font-extrabold ${
                                entry.rank === 1
                                  ? "text-[#9dff13]"
                                  : "text-[#3b00b3]"
                              }`}
                            >
                              {entry.scoreOutOf1000}
                              <span className="text-xs font-bold opacity-60">
                                /1000
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase opacity-60">
                              Completion Time
                            </p>
                            <p className="inline-flex items-center gap-1 font-mono text-sm font-extrabold">
                              <Clock className="h-3.5 w-3.5 opacity-70" />
                              {formatDuration(entry.timeTakenSeconds)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full Passing National Leaderboard */}
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d002b]">
                    Official Passing Leaderboard ({currentLevelData.leaderboard.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Ranked strictly by Score (High → Low), then Completion Time
                    (Fast → Slow).
                  </p>
                </div>
              </div>

              {currentLevelData.leaderboard.length === 0 ? (
                <div className="p-10 text-center text-xs text-gray-500">
                  No passing entries match your filter yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-[#faf9ff] text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">School</th>
                        <th className="py-3 px-4">Score / 1,000</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentLevelData.leaderboard.map((row) => (
                        <tr key={row.examCode} className="hover:bg-[#faf9ff]/60">
                          <td className="py-3.5 px-4 font-extrabold text-[#3b00b3]">
                            #{row.rank}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-extrabold text-[#0d002b]">
                              {row.fullName}
                            </p>
                            <p className="font-mono text-[11px] text-gray-400">
                              {row.examCode}
                              {row.className ? ` · ${row.className}` : ""}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-800">
                              {row.schoolName}
                            </p>
                            {row.schoolLocation && (
                              <p className="text-[11px] text-gray-400">
                                {row.schoolLocation}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-[#0d002b]">
                            {row.scoreOutOf1000}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs font-bold text-gray-600">
                            {formatDuration(row.timeTakenSeconds)}
                          </td>
                          <td className="py-3.5 px-4">
                            {row.finalist ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                                <Award className="h-3 w-3" />
                                Finalist
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Passed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <FooterSection />
    </main>
  );
}
