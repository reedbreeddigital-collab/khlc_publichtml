"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import { impactStats, type EnquiryPathwayId } from "@/data/khlc";

interface CampusSectionProps {
  onSelectPathway?: (pathway: EnquiryPathwayId, context?: string) => void;
}

const valueHighlights = [
  "Vetted, trained & continuously supervised ICT instructors",
  "Structured, age-appropriate curriculum from Primary to SS3",
  "Practical coding, robotics & AI projects—never textbook-only",
  "Termly CBT/practical assessments & parent-ready progress reports",
  "Seamless access to inter-school showcases like Evolve ICT",
];

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

export default function CampusSection({ onSelectPathway }: CampusSectionProps) {
  return (
    <section
      id="impact"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#f4fbff]/60 to-white py-20 lg:py-28"
    >
      {/* Subtle Ambient Right Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-10 h-96 w-96 rounded-full bg-[#38e0ff]/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Staggered Kingshouse Team & Learner Photos + Trust Badge */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="relative mx-auto w-full max-w-[520px] lg:col-span-6 lg:mx-0"
          >
            {/* Circular Dot Matrix */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 right-10 z-0 hidden sm:block"
            >
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
                {[
                  [32, 8], [44, 8], [56, 8], [68, 8],
                  [20, 20], [32, 20], [44, 20], [56, 20], [68, 20], [80, 20],
                  [8, 32], [20, 32], [32, 32], [44, 32], [56, 32], [68, 32], [80, 32], [92, 32],
                  [8, 44], [20, 44], [32, 44], [44, 44], [56, 44], [68, 44], [80, 44], [92, 44],
                  [8, 56], [20, 56], [32, 56], [44, 56], [56, 56], [68, 56], [80, 56], [92, 56],
                  [20, 68], [32, 68], [44, 68], [56, 68], [68, 68], [80, 68],
                  [32, 80], [44, 80], [56, 80], [68, 80],
                ].map(([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="1.8"
                    className="fill-[#3b00b3]/60"
                  />
                ))}
              </svg>
            </div>

            <div className="relative flex flex-col sm:block">
              {/* Top-Left Main Kingshouse Instructor Team Image */}
              <motion.div
                variants={riseUp}
                custom={0}
                className="relative z-10 w-full sm:w-[68%] aspect-[4/3.6] overflow-hidden rounded-2xl bg-[#100038] shadow-[0_18px_45px_rgba(13,0,43,0.14)]"
              >
                <img
                  src="/images/impact-team.webp"
                  alt="Kingshouse Learning Centre team of technology instructors and facilitators"
                  className="h-full w-full object-cover object-center"
                />
              </motion.div>

              {/* Bottom-Left Credibility Pill Card */}
              <motion.div
                variants={riseUp}
                custom={0.2}
                className="mt-4 sm:mt-5 inline-flex w-fit items-center gap-3.5 rounded-xl bg-[#3b00b3] px-5 py-3.5 text-white shadow-[0_12px_30px_rgba(59,0,179,0.28)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#9dff13]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-extrabold leading-none text-white">
                    100% Practical
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-white/80">
                    Managed Delivery Guarantee
                  </p>
                </div>
              </motion.div>

              {/* Bottom-Right Overlapping Framed Student Engagement Image */}
              <motion.div
                variants={riseUp}
                custom={0.3}
                className="mt-6 sm:mt-0 sm:absolute sm:top-[28%] sm:right-0 z-20 w-full sm:w-[56%] aspect-[4/3.7] overflow-hidden rounded-2xl border-[6px] border-white bg-[#100038] shadow-[0_20px_50px_rgba(13,0,43,0.16)]"
              >
                <img
                  src="/images/impact-students.webp"
                  alt="Engaged students participating actively in Kingshouse Learning Centre session"
                  className="h-full w-full object-cover object-top"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: Why Kingshouse Value Proposition */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="lg:col-span-6 lg:pl-6"
          >
            <motion.div
              variants={riseUp}
              custom={0}
              className="mb-3 inline-flex items-center gap-2"
            >
              <svg width="12" height="14" viewBox="0 0 14 16" fill="none">
                <path d="M7 0L14 8L7 16L0 8L7 0Z" fill="#9dff13" />
                <path d="M7 0L14 8L7 16V0Z" fill="#3b00b3" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#3b00b3]">
                WHY KINGSHOUSE?
              </span>
            </motion.div>

            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="text-3xl font-extrabold leading-[1.18] tracking-tight text-[#0d002b] sm:text-4xl"
            >
              Why Forward-Thinking Schools{" "}
              <span className="text-[#3b00b3]">Partner With Us</span>
            </motion.h2>

            <motion.p
              variants={riseUp}
              custom={0.2}
              className="mt-4 text-sm sm:text-[15px] leading-relaxed text-gray-600"
            >
              Running an outstanding school technology program shouldn&apos;t
              drain your administration with teacher turnover or outdated lesson
              notes. Kingshouse delivers a dependable, fully managed EdTech
              partnership that strengthens your academic reputation and delights
              parents.
            </motion.p>

            {/* Vertical Value Checklist */}
            <motion.div
              variants={riseUp}
              custom={0.3}
              className="mt-6 flex flex-col space-y-3"
            >
              {valueHighlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3b00b3]/10 text-[#3b00b3]">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#0d002b]">
                    {item}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={riseUp} custom={0.4} className="mt-8">
              <a
                href="#contact"
                onClick={(e) => {
                  if (onSelectPathway) {
                    e.preventDefault();
                    onSelectPathway("schools", "School Partnership Proposal");
                  }
                }}
                className="group inline-flex items-center gap-2 rounded-lg bg-[#3b00b3] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_10px_25px_rgba(59,0,179,0.25)] transition-all duration-200 hover:bg-[#9dff13] hover:text-[#0d002b]"
              >
                <span>Partner Your School Today</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Measurable Impact Strip (Our Impact) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-20 rounded-3xl bg-[#100038] p-7 sm:p-10 text-white shadow-[0_24px_60px_rgba(16,0,56,0.22)] relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#38e0ff]/20 blur-[90px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-10 h-60 w-60 rounded-full bg-[#9dff13]/15 blur-[90px]"
          />

          <div className="relative z-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9dff13]">
                OUR MEASURABLE IMPACT
              </span>
              <h3 className="mt-1.5 text-2xl font-extrabold sm:text-3xl">
                Proven Results Across Schools &amp; Communities
              </h3>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-white/75">
              Every partnership is backed by structured instructor deployment,
              hands-on student projects, and celebrated inter-school
              competitions.
            </p>
          </div>

          <div className="relative z-10 mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {impactStats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                variants={riseUp}
                custom={0.08 * idx}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-[#9dff13]">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-sm font-extrabold text-white">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">
                  {stat.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
