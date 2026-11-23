"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, PhoneCall } from "lucide-react";
import {
  khlcContact,
  approachSteps,
  type EnquiryPathwayId,
} from "@/data/khlc";

interface AboutSectionProps {
  onSelectPathway?: (pathway: EnquiryPathwayId, context?: string) => void;
}

const tabs = [
  {
    id: "about",
    label: "Who We Are",
    description:
      "Technology is no longer an optional addition to education. Kingshouse Learning Centre (KHLC) is a leading EdTech organization that partners with Nursery, Primary, and Secondary schools to deliver structured, engaging, and practical technology education—without the burden of developing the curriculum, recruiting specialized instructors, or managing programs alone.",
  },
  {
    id: "mission",
    label: "Our Mission",
    description:
      "To equip learners with practical digital, computational, and problem-solving skills that prepare them for further education, future careers, and an increasingly technology-driven world—while empowering schools with reliable, managed STEM delivery.",
  },
  {
    id: "vision",
    label: "Our Vision",
    description:
      "Raising a generation of creators, innovators, and problem-solvers by connecting African schools and learners to industry-aligned curricula, hands-on engineering, and globally recognized Cisco Networking Academy pathways.",
  },
];

const pillars = [
  "Structured Age-Graded Curricula",
  "Experienced & Supervised Instructors",
  "Flexible Timetable & Club Delivery",
  "Cisco Networking Academy Affiliated",
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

export default function AboutSection({ onSelectPathway }: AboutSectionProps) {
  const [activeTab, setActiveTab] = useState("about");
  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#f7f5ff]/50 to-[#eef9ff]/40 py-20 lg:py-28"
    >
      {/* Subtle Ambient Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#38e0ff]/15 blur-[110px]"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Authentic Kingshouse Lab + Certification Inset */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="relative mx-auto w-full max-w-[480px] lg:col-span-6 lg:mx-0"
          >
            <motion.div
              variants={riseUp}
              custom={0}
              className="relative aspect-[4/3.8] w-full overflow-hidden rounded-2xl bg-[#100038] shadow-[0_20px_50px_rgba(13,0,43,0.14)] sm:ml-6"
            >
              <img
                src="/images/about-students-lab.webp"
                alt="Students collaborating on laptops during a Kingshouse practical ICT session"
                className="h-full w-full object-cover object-center"
              />
            </motion.div>

            {/* Overlapping Bottom-Left Inset Card */}
            <motion.div
              variants={riseUp}
              custom={0.2}
              className="absolute -bottom-8 -left-2 sm:-left-6 z-10 h-44 w-52 sm:h-48 sm:w-60 overflow-hidden rounded-2xl border-[6px] border-white bg-[#100038] shadow-[0_18px_40px_rgba(13,0,43,0.18)]"
            >
              <img
                src="/images/about-certificate.webp"
                alt="Students proudly receiving certificates at Kingshouse Learning Centre"
                className="h-full w-full object-cover object-top"
              />
            </motion.div>
          </motion.div>

          {/* Right Column: About KHLC Copy, Tabs, Pillars & CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="lg:col-span-6 lg:pl-4 pt-6 lg:pt-0"
          >
            {/* Eyebrow */}
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
                ABOUT KINGSHOUSE LEARNING CENTRE
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="text-3xl font-extrabold leading-[1.18] tracking-tight text-[#0d002b] sm:text-4xl"
            >
              Empowering Schools,{" "}
              <span className="text-[#3b00b3]">Inspiring Future</span>{" "}
              Innovators
            </motion.h2>

            {/* Interactive Pill Tabs */}
            <motion.div
              variants={riseUp}
              custom={0.2}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-[#3b00b3] text-white shadow-[0_8px_20px_rgba(59,0,179,0.28)]"
                        : "border border-gray-200 bg-white text-[#0d002b]/80 hover:border-[#3b00b3]/30 hover:text-[#3b00b3]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </motion.div>

            {/* Description Paragraph */}
            <motion.p
              variants={riseUp}
              custom={0.28}
              className="mt-5 text-sm sm:text-[15px] leading-relaxed text-gray-600"
            >
              {currentTab.description}
            </motion.p>

            {/* 2x2 Feature Checklist */}
            <motion.div
              variants={riseUp}
              custom={0.36}
              className="mt-6 grid grid-cols-1 gap-y-3.5 gap-x-6 sm:grid-cols-2"
            >
              {pillars.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3b00b3]/10 text-[#3b00b3]">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#0d002b]">
                    {item}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Bottom CTA Row */}
            <motion.div
              variants={riseUp}
              custom={0.44}
              className="mt-8 flex flex-wrap items-center gap-5"
            >
              <a
                href="#contact"
                onClick={(e) => {
                  if (onSelectPathway) {
                    e.preventDefault();
                    onSelectPathway("schools", "Partnership Consultation");
                  }
                }}
                className="group inline-flex items-center gap-2 rounded-lg bg-[#3b00b3] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_10px_25px_rgba(59,0,179,0.25)] transition-all duration-200 hover:bg-[#9dff13] hover:text-[#0d002b]"
              >
                <span>Schedule a Consultation</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href={khlcContact.phones[0].href}
                className="group flex items-center gap-3"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0d002b] text-white shadow-md transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#3b00b3]">
                  <PhoneCall className="h-4.5 w-4.5 text-[#9dff13]" />
                </span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Speak With Our Team
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#0d002b] transition-colors group-hover:text-[#3b00b3]">
                    {khlcContact.phones[0].display}
                  </span>
                </div>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Brochure Signature 4-Step Framework: Learn -> Practice -> Build -> Present */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-20 rounded-3xl border border-[#3b00b3]/15 bg-white p-6 sm:p-8 shadow-[0_16px_45px_rgba(13,0,43,0.06)]"
        >
          <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-5 md:flex-row md:items-end">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#3b00b3]">
                OUR PRACTICAL APPROACH
              </span>
              <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-[#0d002b]">
                Learn → Practice → Build → Present
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-500">
              Our program emphasizes practical learning rather than theory.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {approachSteps.map((item, idx) => (
              <motion.div
                key={item.title}
                variants={riseUp}
                custom={0.08 * idx}
                className="relative rounded-2xl border border-gray-100 bg-[#faf9ff] p-5 transition-all hover:-translate-y-1 hover:border-[#3b00b3]/30 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-[#3b00b3] px-2.5 py-1 text-[11px] font-extrabold text-[#9dff13]">
                    {item.step}
                  </span>
                  {idx < approachSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block h-4 w-4 text-[#3b00b3]/40" />
                  )}
                </div>
                <h4 className="mt-3.5 text-base font-extrabold text-[#0d002b]">
                  {item.title}
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
