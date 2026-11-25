"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  Sparkles,
  CheckCircle2,
  Calendar,
  Laptop,
  Cpu,
  Bot,
  Code2,
  FileText,
  Video,
  Award,
  MapPin,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import KhlcLogo from "@/components/KhlcLogo";
import EvolveRegistrationForm, {
  type RegistrationTrack,
} from "@/components/EvolveRegistrationForm";
import FooterSection from "@/components/FooterSection";
import { khlcContact } from "@/data/khlc";
import {
  evolveMeta,
  phase1Details,
  sdgThemes,
  projectRules,
  proposalSections,
  videoStructure,
  judgingCriteria,
  evolveTimeline,
} from "@/data/evolve";
import { getApiBase } from "@/lib/quizApi";

interface LiveScheduleItem {
  id: string;
  title: string;
  level: string;
  durationMinutes: number;
  startsAt: string;
  endsAt: string;
  passMark: number;
  maxScore: number;
  status: string;
  resultsPublished: boolean;
  questionCount: number;
}

type GuidelineTab = "rules" | "proposal" | "video" | "judging";

const evolveNav = [
  { label: "Tracks", href: "#tracks" },
  { label: "SDG Themes", href: "#themes" },
  { label: "Guidelines", href: "#guidelines" },
  { label: "Timeline", href: "#timeline" },
  { label: "Register", href: "#register" },
];

const riseUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const tabPanelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as const },
  },
};

export default function EvolvePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<GuidelineTab>("rules");
  const [selectedTheme, setSelectedTheme] = useState<string | undefined>(
    undefined
  );
  const [selectedTrack, setSelectedTrack] = useState<
    RegistrationTrack | undefined
  >(undefined);
  const [liveSchedule, setLiveSchedule] = useState<LiveScheduleItem[]>([]);

  useEffect(() => {
    const apiBase = getApiBase();
    if (!apiBase) return;
    fetch(`${apiBase}/api/v1/evolve/schedule`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.levels)) {
          setLiveSchedule(data.levels);
        }
      })
      .catch(() => {});
  }, []);

  const liveWindowSummary = React.useMemo(() => {
    if (liveSchedule.length === 0) return phase1Details.testWindow;
    const starts = liveSchedule
      .map((s) => new Date(s.startsAt).getTime())
      .filter((t) => !Number.isNaN(t));
    const ends = liveSchedule
      .map((s) => new Date(s.endsAt).getTime())
      .filter((t) => !Number.isNaN(t));
    if (starts.length === 0 || ends.length === 0) return phase1Details.testWindow;
    const fmt = (ms: number) =>
      new Date(ms).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    return `${fmt(Math.min(...starts))} – ${fmt(Math.max(...ends))}`;
  }, [liveSchedule]);

  const jumpToRegister = (track?: RegistrationTrack, theme?: string) => {
    if (track) setSelectedTrack(track);
    if (theme) setSelectedTheme(theme);
    const el = document.getElementById("register");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#0d002b]">
      {/* 1. Hero & Header */}
      <div className="relative overflow-hidden bg-[#100038] text-white">
        {/* Announcement Strip */}
        <div className="w-full bg-gradient-to-r from-[#3b00b3] via-[#38e0ff] to-[#9dff13] py-2 px-4 text-center text-xs sm:text-[13px] font-semibold text-[#0d002b]">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
            <span>
              <strong className="font-extrabold">Evolve 8.0</strong>{" "}
              Registration: 22 Oct – 14 Nov 2026 · National Online General Test
              (Primary 4 to SS3) &amp; Coding, AI or Robotics Project Track.
            </span>
            <a
              href="#register"
              className="font-extrabold underline underline-offset-2 hover:text-[#3b00b3]"
            >
              Register Now →
            </a>
          </p>
        </div>

        {/* Navigation Bar */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#140047]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center group shrink-0">
                <KhlcLogo
                  className="h-10 sm:h-11 w-auto transition-transform duration-300 group-hover:scale-105"
                  variant="dark"
                />
              </Link>
              <span className="hidden sm:inline-block h-6 w-[1px] bg-white/15" />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#9dff13]/15 px-3 py-1 text-[11px] font-extrabold text-[#9dff13]">
                <Trophy className="h-3.5 w-3.5" />
                EVOLVE 8.0
              </span>
            </div>

            <nav className="hidden lg:flex items-center gap-6">
              {evolveNav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-white/90 transition-colors hover:text-[#9dff13]"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/evolve/quiz"
                className="text-sm font-bold text-[#38e0ff] transition-colors hover:text-[#9dff13]"
              >
                Online Test
              </Link>
              <Link
                href="/evolve/projects"
                className="text-sm font-bold text-white/90 transition-colors hover:text-[#9dff13]"
              >
                Submit Project
              </Link>
              <Link
                href="/evolve/results"
                className="text-sm font-bold text-white/90 transition-colors hover:text-[#9dff13]"
              >
                Results
              </Link>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/evolve/quiz"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#38e0ff]/40 bg-[#38e0ff]/10 px-3.5 py-2 text-xs font-extrabold text-[#38e0ff] hover:bg-[#38e0ff] hover:text-[#0d002b] transition-colors"
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Take Test</span>
              </Link>
              <a
                href="#register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#9dff13] px-4 py-2.5 text-xs font-extrabold text-[#0d002b] shadow-md hover:bg-[#38e0ff] transition-colors"
              >
                <span>Register School</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-white/10 bg-[#140047] px-4 pt-3 pb-5 lg:hidden"
              >
                <div className="flex flex-col space-y-2">
                  {evolveNav.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-2 py-2 text-sm font-medium text-white/90 hover:bg-white/5 hover:text-[#9dff13]"
                    >
                      {item.label}
                    </a>
                  ))}
                  <Link
                    href="/evolve/quiz"
                    className="rounded-lg px-2 py-2 text-sm font-bold text-[#9dff13]"
                  >
                    Take Phase 1 Online Test →
                  </Link>
                  <Link
                    href="/evolve/projects"
                    className="rounded-lg px-2 py-2 text-sm font-bold text-white/90"
                  >
                    Submit Project Proposal &amp; Video
                  </Link>
                  <Link
                    href="/evolve/results"
                    className="rounded-lg px-2 py-2 text-sm font-bold text-white/90"
                  >
                    Official National Results
                  </Link>
                  <Link
                    href="/"
                    className="rounded-lg px-2 py-2 text-sm font-medium text-[#38e0ff]"
                  >
                    ← Back to Kingshouse Main Site
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Hero Main Content */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#3b00b3]/50 blur-[130px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#38e0ff]/15 blur-[120px]"
          />

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <motion.div
              initial="hidden"
              animate="visible"
              className="lg:col-span-6"
            >
              <motion.div
                variants={riseUp}
                custom={0}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#9dff13]/30 bg-white/5 px-3.5 py-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#9dff13]" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#9dff13]">
                  KINGSHOUSE LEARNING CENTRE · {evolveMeta.motto}
                </span>
              </motion.div>

              <motion.h1
                variants={riseUp}
                custom={0.1}
                className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[54px]"
              >
                Evolve <span className="text-[#9dff13]">8.0</span> National
                School <span className="text-[#38e0ff]">Technology</span>{" "}
                Programme
              </motion.h1>

              <motion.p
                variants={riseUp}
                custom={0.2}
                className="mt-5 max-w-xl text-sm sm:text-[15.5px] leading-relaxed text-white/80"
              >
                Register your school for the{" "}
                <strong className="text-white">
                  National Online General Test
                </strong>{" "}
                (Primary 4 to SS3) and enter a 5-pupil team in our{" "}
                <strong className="text-white">
                  Coding, AI, or Robotics Project Track
                </strong>
                , leading to live grand finals in Lagos with{" "}
                <strong className="text-[#9dff13]">
                  ₦300,000, ₦200,000 &amp; ₦100,000
                </strong>{" "}
                in prizes, plus{" "}
                <strong className="text-white">
                  4th &amp; 5th place consolation prizes
                </strong>
                .
              </motion.p>

              <motion.div
                variants={riseUp}
                custom={0.3}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <a
                  href="#register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#9dff13] px-6 py-3.5 text-sm font-extrabold text-[#0d002b] shadow-[0_0_25px_rgba(157,255,19,0.35)] transition-all hover:bg-[#38e0ff]"
                >
                  <span>Register Your School</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>

                <Link
                  href="/evolve/quiz"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#38e0ff]/40 bg-[#38e0ff]/15 px-5 py-3.5 text-sm font-extrabold text-[#38e0ff] hover:bg-[#38e0ff] hover:text-[#0d002b] transition-colors"
                >
                  <Laptop className="h-4 w-4" />
                  <span>Student Exam Login</span>
                </Link>

                <Link
                  href="/evolve/projects"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3.5 text-sm font-bold text-white hover:border-[#38e0ff] hover:text-[#38e0ff] transition-colors"
                >
                  <Cpu className="h-4 w-4" />
                  <span>Submit Project</span>
                </Link>

                <Link
                  href="/evolve/results"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3.5 text-sm font-bold text-white hover:border-[#9dff13] hover:text-[#9dff13] transition-colors"
                >
                  <Trophy className="h-4 w-4" />
                  <span>National Results</span>
                </Link>
              </motion.div>

              <motion.div
                variants={riseUp}
                custom={0.38}
                className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-white/80"
              >
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#9dff13]" />
                  Live Finals: {evolveMeta.venue}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Laptop className="h-3.5 w-3.5 text-[#38e0ff]" />
                  250+ Live Finals Laptops
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#9dff13]" />
                  Test Window: {liveWindowSummary}
                </span>
              </motion.div>

              {liveSchedule.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {liveSchedule.map((item) => (
                    <Link
                      key={item.id}
                      href="/evolve/quiz"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-white/90 hover:border-[#9dff13]"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.status === "live"
                            ? "bg-[#9dff13] animate-pulse"
                            : item.status === "scheduled"
                            ? "bg-[#38e0ff]"
                            : "bg-gray-400"
                        }`}
                      />
                      <span className="capitalize">{item.level}:</span>
                      <span className="uppercase text-[#9dff13]">
                        {item.status}
                      </span>
                      <span className="text-white/60">
                        ({item.durationMinutes}m)
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right Visual Showcase + Prize Strip */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              custom={0.2}
              className="lg:col-span-6"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#1a005c] shadow-2xl">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <img
                    src="/images/evolve-grand-stage.webp"
                    alt="Winning schools holding prize cheques on stage at Evolve ICT Competition"
                    className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-[#140047] p-4 sm:p-5 text-center">
                  {evolveMeta.prizes.map((p, idx) => (
                    <motion.div
                      key={p.place}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.4 + idx * 0.1,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="px-2 py-2 sm:py-0"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#38e0ff]">
                        {p.place}
                      </p>
                      <p className="mt-1 text-base sm:text-xl font-extrabold text-[#9dff13]">
                        {p.amount}
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/70">
                        {p.note}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* 2. Two Concurrent Tracks Section */}
      <section id="tracks" className="relative overflow-hidden bg-[#faf9ff] py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              variants={riseUp}
              custom={0}
              className="mb-2 inline-flex items-center gap-2"
            >
              <svg width="12" height="14" viewBox="0 0 14 16" fill="none">
                <path d="M7 0L14 8L7 16L0 8L7 0Z" fill="#9dff13" />
                <path d="M7 0L14 8L7 16V0Z" fill="#3b00b3" />
              </svg>
              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#3b00b3]">
                TWO PARALLEL TRACKS
              </span>
            </motion.div>

            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="mt-1 text-3xl font-extrabold tracking-tight text-[#0d002b] sm:text-4xl"
            >
              Every School Stays Engaged From{" "}
              <span className="text-[#3b00b3]">Online Test</span> to{" "}
              <span className="text-[#3b00b3]">Live Build</span>
            </motion.h2>

            <motion.p
              variants={riseUp}
              custom={0.18}
              className="mt-3 text-sm text-gray-600"
            >
              Both tracks run concurrently. Even if a school&apos;s pupils miss
              the national test finals, the school still competes all the way
              through the Coding, AI, or Robotics Project Track.
            </motion.p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Track 1 Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={riseUp}
              custom={0.1}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-7 sm:p-8 shadow-[0_14px_40px_rgba(13,0,43,0.06)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3b00b3]/10 px-3.5 py-1 text-xs font-extrabold text-[#3b00b3]">
                    <Laptop className="h-3.5 w-3.5" />
                    PHASE 1 · NATIONAL ONLINE TEST
                  </span>
                  <span className="rounded-full bg-[#9dff13] px-3 py-1 text-[11px] font-extrabold text-[#0d002b]">
                    Primary 4 – SS3
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-extrabold text-[#0d002b]">
                  National Online General ICT Test
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
                  Open to all participating schools across a single national
                  window (<strong>{phase1Details.testWindow}</strong>). Scores
                  are out of <strong>{phase1Details.maxScore}</strong> with a{" "}
                  <strong>{phase1Details.passMark}</strong> pass mark across all
                  levels. Faster completion time breaks ties.
                </p>

                <div className="mt-6 space-y-3">
                  {phase1Details.levels.map((lvl, idx) => (
                    <motion.div
                      key={lvl.id}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        delay: 0.15 + idx * 0.08,
                        duration: 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="rounded-xl border border-gray-100 bg-[#faf9ff] p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#0d002b]">
                          {lvl.name} Level
                        </span>
                        <span className="rounded-md bg-[#3b00b3] px-2.5 py-0.5 text-[11px] font-bold text-white">
                          {lvl.classes}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {lvl.description}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <ul className="mt-5 space-y-2 text-xs font-medium text-[#0d002b]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3b00b3] shrink-0" />
                    <span>{phase1Details.quotaPerLevel}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3b00b3] shrink-0" />
                    <span>
                      Only passing pupils (700+) are nationally ranked within
                      their level
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-7 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => jumpToRegister("test")}
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#3b00b3] px-5 py-3 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
                >
                  <span>Register Pupils for Phase 1 Test</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>

            {/* Track 2 Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={riseUp}
              custom={0.22}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col justify-between rounded-3xl border border-[#3b00b3] bg-[#100038] p-7 sm:p-8 text-white shadow-[0_20px_50px_rgba(16,0,56,0.22)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-extrabold text-[#9dff13]">
                    <Cpu className="h-3.5 w-3.5" />
                    PROJECT TRACK · TEAM OF 5
                  </span>
                  <span className="rounded-full bg-[#38e0ff]/20 px-3 py-1 text-[11px] font-bold text-[#38e0ff]">
                    Primary &amp; Secondary
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-extrabold text-white">
                  Coding, AI &amp; Robotics Project Track
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/80">
                  Each school selects <strong>one team of 5 pupils</strong>,
                  chooses one path and one UN SDG theme, submits a structured
                  proposal, receives direct Kingshouse instructor feedback,
                  builds a working solution, and submits a{" "}
                  <strong>3-minute demo video</strong> to qualify for the Lagos
                  live finals.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    {
                      name: "Coding",
                      icon: Code2,
                      desc: "Scratch, PictoBlox, Web, Python & Apps",
                    },
                    {
                      name: "Artificial Intelligence",
                      icon: Sparkles,
                      desc: "Smart models, ML tools & AI solutions",
                    },
                    {
                      name: "Robotics",
                      icon: Bot,
                      desc: "Arduino kits, sensors & automation",
                    },
                  ].map((path, idx) => {
                    const Icon = path.icon;
                    return (
                      <motion.div
                        key={path.name}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                          delay: 0.2 + idx * 0.09,
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5 transition-colors hover:border-[#9dff13]/40 hover:bg-white/[0.08]"
                      >
                        <Icon className="h-5 w-5 text-[#9dff13]" />
                        <p className="mt-2 text-xs font-extrabold text-white">
                          {path.name}
                        </p>
                        <p className="mt-1 text-[11px] leading-snug text-white/70">
                          {path.desc}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                <ul className="mt-5 space-y-2 text-xs font-medium text-white/90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#9dff13] shrink-0" />
                    <span>
                      Proposal feedback sent to every school in Mid-January 2027
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#9dff13] shrink-0" />
                    <span>
                      2-month guided build period (January – February 2027)
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-7 pt-5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => jumpToRegister("project")}
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#9dff13] px-5 py-3 text-xs font-extrabold text-[#0d002b] hover:bg-[#38e0ff] transition-colors"
                >
                  <span>Register Your 5-Pupil Project Team</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Five UN SDG Project Themes */}
      <section id="themes" className="relative overflow-hidden bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              variants={riseUp}
              custom={0}
              className="mb-2 inline-flex items-center gap-2"
            >
              <svg width="12" height="14" viewBox="0 0 14 16" fill="none">
                <path d="M7 0L14 8L7 16L0 8L7 0Z" fill="#9dff13" />
                <path d="M7 0L14 8L7 16V0Z" fill="#3b00b3" />
              </svg>
              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#3b00b3]">
                PROJECT TRACK THEMES
              </span>
            </motion.div>

            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="mt-1 text-3xl font-extrabold tracking-tight text-[#0d002b] sm:text-4xl"
            >
              5 Real-World <span className="text-[#3b00b3]">UN SDG Themes</span>{" "}
              to Solve
            </motion.h2>

            <motion.p
              variants={riseUp}
              custom={0.18}
              className="mt-3 text-sm text-gray-600"
            >
              Select a theme below to pre-fill it in your school&apos;s Project
              Track registration form.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {sdgThemes.map((theme, idx) => {
              const themeVal = `Theme ${theme.number}: ${theme.title} (${theme.sdg})`;
              return (
                <motion.div
                  key={theme.number}
                  variants={riseUp}
                  custom={0.07 * idx}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-[#faf9ff] p-6 transition-colors duration-300 hover:border-[#3b00b3]/30 hover:bg-white hover:shadow-[0_18px_40px_rgba(59,0,179,0.1)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-[#3b00b3] px-2.5 py-1 text-[11px] font-extrabold text-white">
                        Theme {theme.number}
                      </span>
                      <span className="rounded-full bg-[#9dff13]/30 px-3 py-1 text-[11px] font-extrabold text-[#0d002b]">
                        {theme.sdg}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-extrabold text-[#0d002b] group-hover:text-[#3b00b3] transition-colors">
                      {theme.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-gray-600">
                      <strong className="text-[#0d002b]">The problem:</strong>{" "}
                      {theme.problem}
                    </p>

                    <p className="mt-3 rounded-xl bg-white p-3 text-xs font-semibold leading-relaxed text-[#3b00b3] border border-[#3b00b3]/10">
                      Challenge: {theme.challenge}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-200/70">
                    <button
                      type="button"
                      onClick={() => jumpToRegister("both", themeVal)}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0d002b] hover:text-[#3b00b3]"
                    >
                      <span>Select This Theme &amp; Register</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {/* Photo Callout Card */}
            <motion.div
              variants={riseUp}
              custom={0.35}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-[#100038] p-6 text-white min-h-[260px] shadow-lg"
            >
              <img
                src="/images/evolve-award.webp"
                alt="Evolve ICT Competition winners receiving cash prize award"
                className="absolute inset-0 h-full w-full object-cover object-top opacity-45 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#100038] via-[#100038]/65 to-transparent" />
              <div className="relative z-10">
                <span className="inline-block rounded-full bg-[#9dff13] px-3 py-1 text-[10px] font-extrabold uppercase text-[#0d002b]">
                  Build Real Solutions
                </span>
                <h3 className="mt-3 text-xl font-extrabold leading-snug">
                  From Classroom Ideas to Stage Champions
                </h3>
                <p className="mt-2 text-xs text-white/80">
                  Every team gets expert instructor feedback on their proposal
                  before the January–February 2027 build window.
                </p>
                <a
                  href="#register"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#9dff13] hover:text-[#38e0ff]"
                >
                  <span>Start School Registration</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Interactive Official Guidelines (Rules | Proposal | Video | Judging) */}
      <section id="guidelines" className="relative overflow-hidden bg-[#faf6ff]/80 py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              variants={riseUp}
              custom={0}
              className="mb-2 inline-flex items-center gap-2"
            >
              <svg width="12" height="14" viewBox="0 0 14 16" fill="none">
                <path d="M7 0L14 8L7 16L0 8L7 0Z" fill="#9dff13" />
                <path d="M7 0L14 8L7 16V0Z" fill="#3b00b3" />
              </svg>
              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#3b00b3]">
                OFFICIAL SCHOOL HANDBOOK
              </span>
            </motion.div>

            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="mt-1 text-3xl font-extrabold tracking-tight text-[#0d002b] sm:text-4xl"
            >
              Rules, Proposal Guide, Video &amp;{" "}
              <span className="text-[#3b00b3]">Judging Criteria</span>
            </motion.h2>
          </motion.div>

          {/* Animated Tabs */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={riseUp}
            custom={0.18}
            className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
          >
            {[
              { id: "rules" as GuidelineTab, label: "Competition Rules", icon: CheckCircle2 },
              { id: "proposal" as GuidelineTab, label: "Proposal Guide", icon: FileText },
              { id: "video" as GuidelineTab, label: "3-Min Video Guide", icon: Video },
              { id: "judging" as GuidelineTab, label: "Judging (100 Marks)", icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeGuideTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveGuideTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold transition-all ${
                    active
                      ? "bg-[#3b00b3] text-white shadow-md scale-[1.02]"
                      : "border border-gray-200 bg-white text-[#0d002b] hover:border-[#3b00b3]/40 hover:text-[#3b00b3]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Tab Panel with AnimatePresence */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={riseUp}
            custom={0.22}
            className="mt-8 rounded-3xl border border-[#3b00b3]/15 bg-white p-6 sm:p-8 shadow-[0_14px_40px_rgba(13,0,43,0.05)]"
          >
            <AnimatePresence mode="wait">
              {activeGuideTab === "rules" && (
                <motion.div
                  key="rules"
                  variants={tabPanelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h3 className="text-lg font-extrabold text-[#0d002b]">
                    Project Track Core Rules
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {projectRules.map((rule, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.35 }}
                        className="flex items-start gap-3 rounded-xl bg-[#faf9ff] p-3.5 text-xs sm:text-sm leading-relaxed text-[#0d002b]"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3b00b3] text-[10px] font-extrabold text-white">
                          {i + 1}
                        </span>
                        <span>{rule}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {activeGuideTab === "proposal" && (
                <motion.div
                  key="proposal"
                  variants={tabPanelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h3 className="text-lg font-extrabold text-[#0d002b]">
                    Proposal Structure &amp; Word Limits
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Submit one proposal per school using these exact headings in
                    order. Total max: <strong>300 words (Primary)</strong> /{" "}
                    <strong>500 words (Secondary)</strong>.
                  </p>
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-[#faf9ff] text-[#3b00b3]">
                          <th className="py-3 px-3 font-extrabold">Section</th>
                          <th className="py-3 px-3 font-extrabold text-center">
                            Primary Max
                          </th>
                          <th className="py-3 px-3 font-extrabold text-center">
                            Secondary Max
                          </th>
                          <th className="py-3 px-3 font-extrabold">
                            What to Write
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {proposalSections.map((row) => (
                          <tr key={row.section}>
                            <td className="py-3 px-3 font-bold text-[#0d002b]">
                              {row.section}
                            </td>
                            <td className="py-3 px-3 text-center font-extrabold text-[#3b00b3]">
                              {row.primaryMax}
                            </td>
                            <td className="py-3 px-3 text-center font-extrabold text-[#3b00b3]">
                              {row.secondaryMax}
                            </td>
                            <td className="py-3 px-3 text-gray-600">
                              {row.guide}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-[#faf6ff] font-extrabold text-[#0d002b]">
                          <td className="py-3 px-3">Total Word Limit</td>
                          <td className="py-3 px-3 text-center text-[#3b00b3]">
                            300
                          </td>
                          <td className="py-3 px-3 text-center text-[#3b00b3]">
                            500
                          </td>
                          <td className="py-3 px-3 text-xs font-medium text-gray-600">
                            Instructors send tailored feedback on every proposal
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeGuideTab === "video" && (
                <motion.div
                  key="video"
                  variants={tabPanelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h3 className="text-lg font-extrabold text-[#0d002b]">
                    Final Demo Video Structure (Maximum 3 Minutes)
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Use a steady camera, record in a quiet place, speak clearly,
                    and ensure every team member speaks or appears.
                  </p>
                  <div className="mt-5 space-y-3">
                    {videoStructure.map((step, i) => (
                      <motion.div
                        key={step.time}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.35 }}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-gray-100 bg-[#faf9ff] p-4"
                      >
                        <span className="inline-flex w-fit shrink-0 items-center rounded-lg bg-[#3b00b3] px-3 py-1 text-xs font-extrabold text-[#9dff13]">
                          {step.time}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#0d002b]">
                          {step.content}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeGuideTab === "judging" && (
                <motion.div
                  key="judging"
                  variants={tabPanelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h3 className="text-lg font-extrabold text-[#0d002b]">
                    Project Track Judging Criteria (100 Marks Total)
                  </h3>
                  <div className="mt-5 space-y-3">
                    {judgingCriteria.map((item, i) => (
                      <motion.div
                        key={item.criterion}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.35 }}
                        className="rounded-xl border border-gray-100 bg-[#faf9ff] p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-extrabold text-[#0d002b]">
                            {item.criterion}
                          </span>
                          <span className="rounded-full bg-[#3b00b3] px-3 py-0.5 text-xs font-extrabold text-[#9dff13]">
                            {item.marks} Marks
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600">
                          {item.detail}
                        </p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.marks * 4}%` }}
                            transition={{
                              delay: 0.15 + i * 0.06,
                              duration: 0.65,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="h-full rounded-full bg-gradient-to-r from-[#3b00b3] to-[#38e0ff]"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 5. Full Evolve 8.0 Timeline */}
      <section id="timeline" className="relative overflow-hidden bg-[#100038] py-20 lg:py-24 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-[#38e0ff]/12 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[#9dff13]/10 blur-[120px]"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.span
              variants={riseUp}
              custom={0}
              className="inline-block text-xs font-extrabold uppercase tracking-[0.15em] text-[#9dff13]"
            >
              PROGRAMME ROADMAP
            </motion.span>
            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              Evolve 8.0 Competition{" "}
              <span className="text-[#38e0ff]">Timeline</span>
            </motion.h2>
            <motion.p
              variants={riseUp}
              custom={0.18}
              className="mt-3 text-xs sm:text-sm text-white/75"
            >
              From national registration in October 2026 to the Live Grand
              Finals in Lagos in 2027.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {evolveTimeline.map((item, idx) => (
              <motion.div
                key={item.title}
                variants={riseUp}
                custom={0.045 * idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-colors hover:border-[#9dff13]/35 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-[#9dff13]/15 px-2.5 py-1 text-[11px] font-extrabold text-[#9dff13]">
                    {item.date}
                  </span>
                  <span className="text-xs font-bold text-white/40">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-3 text-sm sm:text-base font-extrabold text-white">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/75">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Dedicated Registration Form Section */}
      <section
        id="register"
        className="relative overflow-hidden bg-gradient-to-b from-[#faf9ff] via-white to-[#faf6ff] pt-20 pb-36 lg:pt-24 lg:pb-40"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto max-w-2xl text-center mb-10"
          >
            <motion.span
              variants={riseUp}
              custom={0}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#3b00b3]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[#3b00b3]"
            >
              <Trophy className="h-3.5 w-3.5" />
              OFFICIAL REGISTRATION
            </motion.span>
            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="mt-3 text-3xl font-extrabold tracking-tight text-[#0d002b] sm:text-4xl"
            >
              Register Your School for{" "}
              <span className="text-[#3b00b3]">Evolve 8.0</span>
            </motion.h2>
            <motion.p
              variants={riseUp}
              custom={0.18}
              className="mt-3 text-sm text-gray-600"
            >
              Instructors, school coordinators, principals, and proprietors can
              register pupils for the Phase 1 National Online General Test
              and/or enter a team of 5 for the Coding, AI, or Robotics Project
              Track below.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={riseUp}
            custom={0.15}
          >
            <EvolveRegistrationForm
              preselectedTheme={selectedTheme}
              preselectedTrack={selectedTrack}
            />
          </motion.div>

          {/* Quick WhatsApp Support Strip */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={riseUp}
            custom={0.2}
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#100038] p-5 text-white shadow-lg"
          >
            <div>
              <p className="text-sm font-extrabold">
                Need help registering multiple classes or choosing a path?
              </p>
              <p className="mt-0.5 text-xs text-white/75">
                Reach the Evolve 8.0 Competition Desk directly at{" "}
                <strong>{khlcContact.phones[0].display}</strong> /{" "}
                <strong>{khlcContact.phones[1].display}</strong> or{" "}
                <strong>{khlcContact.email}</strong>.
              </p>
            </div>
            <a
              href={khlcContact.whatsappUrl(
                "Hello Kingshouse Evolve 8.0 Team, our school would like assistance with Evolve 8.0 registration."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#9dff13] px-4 py-2.5 text-xs font-extrabold text-[#0d002b] hover:bg-[#38e0ff] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat Evolve Desk</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 7. Shared Footer */}
      <FooterSection />
    </main>
  );
}
