"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Globe,
  Award,
  Download,
} from "lucide-react";
import {
  impactStats,
  partnershipModel,
  expectedOutcomes,
  ciscoAffiliation,
  khlcContact,
  type EnquiryPathwayId,
} from "@/data/khlc";

interface CampusSectionProps {
  onSelectPathway?: (pathway: EnquiryPathwayId, context?: string) => void;
}

const whyPartnerItems = [
  {
    title: "Structured Curriculum",
    detail:
      "Age-appropriate lesson plans and learning pathways designed around student development.",
  },
  {
    title: "Experienced Instructors",
    detail:
      "Qualified instructors who deliver practical, engaging technology lessons.",
  },
  {
    title: "Practical Learning",
    detail:
      "Students learn through projects, activities, challenges, and real-world applications.",
  },
  {
    title: "Flexible Delivery",
    detail:
      "Integrated into your school timetable, clubs, extracurriculars, holiday programs, or dedicated tech periods.",
  },
  {
    title: "Student Projects & Competitions",
    detail:
      "Opportunities for learners to showcase skills through projects, exhibitions, and Evolve 8.0.",
  },
  {
    title: "Teacher Support & Capacity Building",
    detail:
      "Ongoing support strengthening the capacity of your school's internal ICT and STEM teams.",
  },
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
        className="pointer-events-none absolute top-1/4 right-10 h-96 w-96 rounded-full bg-[#38e0ff]/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 1. Why Partner With KHLC? */}
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Staggered Kingshouse Team & Learner Photos + Trust Badge */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="relative mx-auto w-full max-w-[520px] lg:col-span-5 lg:mx-0"
          >
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
              <motion.div
                variants={riseUp}
                custom={0}
                className="relative z-10 w-full sm:w-[70%] aspect-[4/3.6] overflow-hidden rounded-2xl bg-[#100038] shadow-[0_18px_45px_rgba(13,0,43,0.14)]"
              >
                <img
                  src="/images/impact-team.webp"
                  alt="Kingshouse Learning Centre team of technology instructors and facilitators"
                  className="h-full w-full object-cover object-center"
                />
              </motion.div>

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
                    Managed Quality Assurance
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={riseUp}
                custom={0.3}
                className="mt-6 sm:mt-0 sm:absolute sm:top-[28%] sm:right-0 z-20 w-full sm:w-[58%] aspect-[4/3.7] overflow-hidden rounded-2xl border-[6px] border-white bg-[#100038] shadow-[0_20px_50px_rgba(13,0,43,0.16)]"
              >
                <img
                  src="/images/impact-students.webp"
                  alt="Engaged students participating actively in Kingshouse Learning Centre session"
                  className="h-full w-full object-cover object-top"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: 6 Brochure Value Pillars */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-7 lg:pl-4"
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
                WHY PARTNER WITH KHLC?
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

            <motion.div
              variants={riseUp}
              custom={0.2}
              className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2"
            >
              {whyPartnerItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3b00b3] text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-[#0d002b]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-gray-600">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={riseUp}
              custom={0.35}
              className="mt-7 flex flex-wrap items-center gap-3.5"
            >
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

              <a
                href={khlcContact.brochureUrl}
                download="Kingshouse-School-Partnership-Brochure.pdf"
                className="inline-flex items-center gap-2 rounded-lg border border-[#3b00b3]/25 bg-white px-5 py-3.5 text-xs sm:text-sm font-bold text-[#3b00b3] transition-all hover:border-[#3b00b3] hover:bg-[#faf6ff]"
              >
                <Download className="h-4 w-4" />
                <span>Download Brochure (PDF)</span>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* 2. Our Partnership Model (Brochure Page 4) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-20"
        >
          <motion.div variants={riseUp} custom={0} className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#3b00b3]">
              OUR PARTNERSHIP MODEL
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#0d002b]">
              A Structured Partnership.{" "}
              <span className="text-[#3b00b3]">Practical Learning.</span>{" "}
              Ongoing Support.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Kingshouse Learning Centre works closely with schools to provide a
              seamless, fully supported technology education experience.
            </p>
          </motion.div>

          <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* KHLC Provides */}
            <motion.div
              variants={riseUp}
              custom={0.1}
              className="rounded-3xl bg-[#3b00b3] p-7 sm:p-8 text-white shadow-[0_20px_50px_rgba(59,0,179,0.22)] lg:col-span-7"
            >
              <span className="inline-block rounded-full bg-[#9dff13] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0d002b]">
                KHLC Provides
              </span>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {partnershipModel.khlcProvides.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 rounded-xl bg-white/[0.08] p-3 text-xs sm:text-[13px] font-bold text-white"
                  >
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#9dff13] text-[#0d002b]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Your School Provides */}
            <motion.div
              variants={riseUp}
              custom={0.2}
              className="flex flex-col justify-between rounded-3xl border-2 border-[#3b00b3]/20 bg-white p-7 sm:p-8 shadow-[0_14px_38px_rgba(13,0,43,0.05)] lg:col-span-5"
            >
              <div>
                <span className="inline-block rounded-full bg-[#3b00b3]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
                  Your School Provides
                </span>
                <ul className="mt-5 space-y-3.5">
                  {partnershipModel.schoolProvides.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-xs sm:text-sm font-bold text-[#0d002b]"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#9dff13]/40 text-[#0d002b]">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-2xl bg-[#faf6ff] p-4 text-xs text-gray-600 border border-[#3b00b3]/10">
                <strong className="text-[#3b00b3]">Zero extra admin burden:</strong>{" "}
                Designed to help schools integrate technology education with
                experienced instructors, resources, and quality assurance.
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 3. Expected Outcomes (Brochure Page 5) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-16"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div
              variants={riseUp}
              custom={0.1}
              className="rounded-3xl border border-gray-100 bg-[#faf9ff] p-7 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b00b3]/10 text-[#3b00b3]">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
                    Expected Learner Outcomes
                  </span>
                  <h4 className="text-lg font-extrabold text-[#0d002b]">
                    Students Will
                  </h4>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {expectedOutcomes.studentsWill.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#3b00b3]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={riseUp}
              custom={0.2}
              className="flex flex-col justify-between rounded-3xl bg-[#160046] p-7 sm:p-8 text-white"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9dff13]/20 text-[#9dff13]">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9dff13]">
                      Expected Institutional Outcomes
                    </span>
                    <h4 className="text-lg font-extrabold text-white">
                      Schools Will
                    </h4>
                  </div>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {expectedOutcomes.schoolsWill.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-white/85"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#9dff13]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-6 rounded-xl bg-white/10 px-4 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#9dff13]">
                Raising a Generation of Creators, Innovators &amp;
                Problem-Solvers
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* 4. Cisco Networking Academy Affiliation Showcase (Brochure Page 6) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={riseUp}
          custom={0.15}
          className="mt-16 rounded-3xl border border-[#38e0ff]/35 bg-gradient-to-br from-[#f2fbff] via-white to-[#faf6ff] p-7 sm:p-10 shadow-[0_18px_45px_rgba(13,0,43,0.06)]"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#3b00b3]/10 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#3b00b3]">
                <Globe className="h-3.5 w-3.5" />
                <span>{ciscoAffiliation.eyebrow}</span>
              </div>

              <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#0d002b]">
                {ciscoAffiliation.title}
              </h3>

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-gray-600">
                {ciscoAffiliation.overview}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {ciscoAffiliation.domains.map((domain) => (
                  <span
                    key={domain}
                    className="rounded-lg border border-[#3b00b3]/20 bg-white px-3 py-1 text-xs font-extrabold text-[#3b00b3]"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#3b00b3]/15 bg-white p-6 shadow-sm lg:col-span-6">
              <div className="flex items-center gap-2.5 text-sm font-extrabold text-[#0d002b]">
                <Award className="h-5 w-5 text-[#3b00b3]" />
                <span>What This Means for Your School</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Partnering with KHLC connects your school to a globally
                recognized technology education ecosystem:
              </p>
              <ul className="mt-4 space-y-3">
                {ciscoAffiliation.schoolBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-[#0d002b]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3b00b3] text-[#9dff13]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* 5. Measurable Impact Strip */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-16 rounded-3xl bg-[#100038] p-7 sm:p-10 text-white shadow-[0_24px_60px_rgba(16,0,56,0.22)] relative overflow-hidden"
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
