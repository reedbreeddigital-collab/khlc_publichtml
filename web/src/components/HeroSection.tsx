"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import KhlcLogo from "@/components/KhlcLogo";
import {
  khlcContact,
  navLinks,
  type EnquiryPathwayId,
} from "@/data/khlc";
import {
  ArrowRight,
  Menu,
  X,
  MessageCircle,
  GraduationCap,
  Award,
  Sparkles,
  Download,
  Globe,
} from "lucide-react";

interface HeroSectionProps {
  onSelectPathway?: (pathway: EnquiryPathwayId, context?: string) => void;
}

const riseUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function HeroSection({ onSelectPathway }: HeroSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePartnerClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onSelectPathway) {
      e.preventDefault();
      onSelectPathway("schools", "School Technology Partnership Proposal");
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#100038] text-white">
      {/* 1. Strategic Institutional Announcement Bar */}
      <div className="w-full bg-gradient-to-r from-[#3b00b3] via-[#38e0ff] to-[#9dff13] py-2 px-4 text-center text-xs sm:text-[13px] font-semibold text-[#0d002b] tracking-tight">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>
            Now onboarding partner schools for structured{" "}
            <strong className="font-extrabold">
              ICT, Coding, Robotics &amp; AI
            </strong>{" "}
            programs.
          </span>
          <a
            href="#contact"
            onClick={handlePartnerClick}
            className="inline-flex items-center gap-1 font-extrabold underline decoration-[#0d002b]/60 underline-offset-2 hover:text-[#3b00b3]"
          >
            Request a School Proposal →
          </a>
        </p>
      </div>

      {/* 2. Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#140047]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="#" className="flex items-center group shrink-0">
            <KhlcLogo
              className="h-11 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              variant="dark"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-5 xl:gap-6"
          >
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={
                  item.href === "/evolve"
                    ? "rounded-full bg-[#9dff13]/15 px-3 py-1 text-xs font-extrabold text-[#9dff13] border border-[#9dff13]/35 transition-colors hover:bg-[#9dff13] hover:text-[#0d002b]"
                    : "text-sm font-medium text-white/90 transition-colors hover:text-[#9dff13]"
                }
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Conversion Actions: WhatsApp + Partner With Us */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={khlcContact.whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Kingshouse on WhatsApp"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-white/90 transition-all hover:border-[#9dff13] hover:bg-[#9dff13]/15 hover:text-[#9dff13]"
            >
              <MessageCircle className="h-4 w-4 text-[#9dff13]" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>

            <a
              href="#contact"
              onClick={handlePartnerClick}
              className="group inline-flex items-center gap-2 rounded-lg bg-[#9dff13] px-4 py-2.5 text-xs font-extrabold text-[#0d002b] shadow-[0_6px_20px_rgba(157,255,19,0.28)] transition-all hover:bg-[#38e0ff] hover:shadow-[0_6px_22px_rgba(56,224,255,0.35)]"
            >
              <span>Partner With Us</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white"
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#140047] px-4 pt-3 pb-6 lg:hidden">
            <div className="flex flex-col space-y-2.5">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/5 hover:text-[#9dff13]"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2.5 border-t border-white/10 pt-4 sm:flex-row">
                <a
                  href="#contact"
                  onClick={handlePartnerClick}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#9dff13] px-4 py-2.5 text-xs font-extrabold text-[#0d002b]"
                >
                  <span>Request School Proposal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href={khlcContact.whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white"
                >
                  <MessageCircle className="h-4 w-4 text-[#9dff13]" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. Main Hero Banner */}
      <section className="relative z-10 mx-auto flex flex-1 w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Background Ambient Glows & Geometric Accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#3b00b3]/50 blur-[130px]" />
          <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#38e0ff]/15 blur-[120px]" />
          <div className="absolute top-12 -left-24 h-[420px] w-[320px] -rotate-12 rounded-[60px] border-[28px] border-white/[0.025]" />
        </div>

        {/* Top-Right Dotted Pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 right-6 hidden sm:block lg:top-8 lg:right-10"
        >
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
            {[
              [35, 10], [55, 10], [75, 10],
              [20, 26], [40, 26], [60, 26], [80, 26], [96, 26],
              [10, 44], [30, 44], [50, 44], [70, 44], [90, 44], [104, 44],
              [14, 62], [34, 62], [54, 62], [74, 62], [94, 62],
              [24, 80], [44, 80], [64, 80], [84, 80],
              [40, 96], [60, 96], [78, 96],
            ].map(([cx, cy], idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="3.2"
                className="fill-[#9dff13]/75"
              />
            ))}
          </svg>
        </div>

        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Brand Positioning & Dual Conversion CTAs */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="lg:col-span-6 lg:pr-4"
          >
            {/* Eyebrow Badge */}
            <motion.div
              variants={riseUp}
              custom={0}
              className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#38e0ff]/25 bg-white/5 px-3.5 py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#9dff13]" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#38e0ff]">
                EMPOWERING SCHOOLS · INSPIRING FUTURE INNOVATORS
              </span>
            </motion.div>

            {/* Main Recommended Headline */}
            <motion.h1
              variants={riseUp}
              custom={0.1}
              className="text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[52px]"
            >
              Building Tomorrow&apos;s{" "}
              <span className="text-[#9dff13]">Innovators</span> Through{" "}
              <span className="text-[#38e0ff]">Technology</span> Education
            </motion.h1>

            {/* Value Proposition */}
            <motion.p
              variants={riseUp}
              custom={0.2}
              className="mt-5 max-w-xl text-sm sm:text-[15.5px] leading-relaxed text-white/80"
            >
              Technology education partnerships for{" "}
              <strong className="font-bold text-white">
                Nursery, Primary, and Secondary Schools
              </strong>
              . Kingshouse Learning Centre delivers structured, practical{" "}
              <strong className="font-bold text-white">
                Digital Literacy, Coding, Robotics (STEM), and AI
              </strong>
              —backed by our Cisco Networking Academy affiliation.
            </motion.p>

            {/* Dual CTA Buttons + Brochure Download */}
            <motion.div
              variants={riseUp}
              custom={0.3}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <a
                href="#contact"
                onClick={handlePartnerClick}
                className="group inline-flex items-center gap-2.5 rounded-lg bg-[#9dff13] px-6 py-3.5 text-sm font-extrabold text-[#0d002b] shadow-[0_0_25px_rgba(157,255,19,0.35)] transition-all duration-200 hover:bg-[#38e0ff] hover:shadow-[0_0_28px_rgba(56,224,255,0.45)]"
              >
                <span>Request a School Proposal</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href={khlcContact.brochureUrl}
                download="Kingshouse-School-Partnership-Brochure.pdf"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:border-[#9dff13] hover:bg-[#9dff13]/10 hover:text-[#9dff13]"
              >
                <Download className="h-4 w-4 text-[#9dff13]" />
                <span>School Brochure (PDF)</span>
              </a>
            </motion.div>

            {/* Quick Proof & Cisco Credibility Pills */}
            <motion.div
              variants={riseUp}
              custom={0.4}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-white/80"
            >
              <span className="inline-flex items-center gap-1.5 font-bold text-[#38e0ff]">
                <Globe className="h-3.5 w-3.5 text-[#9dff13]" />
                Cisco Networking Academy Affiliated
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#9dff13]" />
                Nursery, Primary &amp; Secondary
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#38e0ff]" />
                Learn → Practice → Build → Present
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: 3-Column Real Kingshouse Photo Bento Collage */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative lg:col-span-6"
          >
            <div className="relative mx-auto max-w-[560px] lg:max-w-none">
              <div className="grid grid-cols-3 items-center gap-3.5 sm:gap-4">
                {/* Column 1 */}
                <motion.div
                  variants={riseUp}
                  custom={0.15}
                  className="flex flex-col gap-3.5 sm:gap-4 pt-6"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-tl-[36px] rounded-tr-[14px] rounded-bl-[14px] rounded-br-[36px] border border-white/10 bg-[#1c0060] shadow-xl">
                    <img
                      src="/images/hero-laptop-focus.webp"
                      alt="Kingshouse student focused on practical laptop coding session"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="relative aspect-[4/4.3] w-full overflow-hidden rounded-tl-[14px] rounded-tr-[36px] rounded-bl-[36px] rounded-br-[14px] border border-white/10 bg-[#1c0060] shadow-xl">
                    <img
                      src="/images/hero-student-joy.webp"
                      alt="Smiling young innovator celebrating at Kingshouse Learning Centre event"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </motion.div>

                {/* Column 2 */}
                <motion.div
                  variants={riseUp}
                  custom={0.28}
                  className="flex flex-col gap-3.5 sm:gap-4 -mt-5"
                >
                  <div className="relative aspect-[4/4.4] w-full overflow-hidden rounded-tl-[14px] rounded-tr-[36px] rounded-bl-[36px] rounded-br-[14px] border border-white/10 bg-[#1c0060] shadow-xl">
                    <img
                      src="/images/hero-mentorship.webp"
                      alt="Kingshouse instructor mentoring student on laptop"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>

                  <div className="relative aspect-[4/5.6] w-full overflow-hidden rounded-tl-[36px] rounded-tr-[14px] rounded-bl-[14px] rounded-br-[36px] border border-white/10 bg-[#1c0060] shadow-xl">
                    <img
                      src="/images/hero-leadership.webp"
                      alt="Kingshouse Learning Centre leadership and stakeholder engagement"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </motion.div>

                {/* Column 3 */}
                <motion.div
                  variants={riseUp}
                  custom={0.4}
                  className="flex flex-col justify-center"
                >
                  <div className="relative aspect-[4/7.8] w-full overflow-hidden rounded-[44px] border border-white/10 bg-[#1c0060] shadow-xl">
                    <img
                      src="/images/hero-facilitator.webp"
                      alt="Kingshouse tech facilitator engaging students in interactive workshop"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Floating Badge 1: Partner Schools */}
              <motion.div
                variants={riseUp}
                custom={0.5}
                className="absolute top-[20%] -left-2 sm:-left-6 z-20 flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-[#0d002b] shadow-[0_12px_30px_rgba(0,0,0,0.3)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9dff13]/30">
                  <GraduationCap className="h-5 w-5 text-[#3b00b3]" />
                </div>
                <div className="pr-1">
                  <p className="text-sm font-extrabold leading-tight text-[#3b00b3]">
                    300+ schools
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">
                    Active EdTech Partners
                  </p>
                </div>
              </motion.div>

              {/* Floating Badge 2: Evolve ICT */}
              <motion.div
                variants={riseUp}
                custom={0.6}
                className="absolute bottom-[18%] -right-2 sm:-right-5 z-20 flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-[#0d002b] shadow-[0_12px_30px_rgba(0,0,0,0.3)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3b00b3] via-[#38e0ff] to-[#9dff13] text-white shadow-inner">
                  <Award className="h-5 w-5" />
                </div>
                <div className="pr-1">
                  <p className="text-xs font-extrabold text-[#0d002b]">
                    50,000+ Learners
                  </p>
                  <p className="text-[10px] font-medium text-gray-500">
                    &amp; Evolve ICT Champions
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
