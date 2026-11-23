"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Laptop,
  Handshake,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { audienceSegments, type EnquiryPathwayId } from "@/data/khlc";

interface CategoriesSectionProps {
  onSelectPathway?: (pathway: EnquiryPathwayId, context?: string) => void;
}

const segmentIcons = [Building2, Users, Laptop, Handshake];

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

export default function CategoriesSection({
  onSelectPathway,
}: CategoriesSectionProps) {
  return (
    <section
      id="for-schools"
      className="relative overflow-hidden bg-gradient-to-b from-[#faf9ff] via-white to-[#f5f3ff]/50 py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Bottom-Left Dotted Decorative Matrix */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -left-4 hidden sm:block lg:left-2"
        >
          <div className="relative h-32 w-36">
            <div className="absolute -top-3 right-0 h-28 w-28 rounded-full bg-[#38e0ff]/10" />
            <svg width="120" height="84" viewBox="0 0 120 84" fill="none">
              {Array.from({ length: 7 }).map((_, row) =>
                Array.from({ length: 10 }).map((__, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={8 + col * 11}
                    cy={8 + row * 11}
                    r="1.7"
                    className="fill-[#3b00b3]/40"
                  />
                ))
              )}
            </svg>
          </div>
        </div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto max-w-2xl text-center"
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
              WHO WE SERVE
            </span>
          </motion.div>

          <motion.h2
            variants={riseUp}
            custom={0.1}
            className="text-3xl font-extrabold leading-tight tracking-tight text-[#0d002b] sm:text-4xl"
          >
            Tailored Technology Pathways for{" "}
            <span className="text-[#3b00b3]">Schools, Families</span> &amp;{" "}
            <span className="text-[#3b00b3]">Partners</span>
          </motion.h2>

          <motion.p
            variants={riseUp}
            custom={0.18}
            className="mt-4 text-sm sm:text-[15px] leading-relaxed text-gray-600"
          >
            Whether you manage a school seeking a dependable STEM curriculum or
            a parent raising a young innovator, choose the pathway designed for
            your goals.
          </motion.p>
        </motion.div>

        {/* 4-Card Segmented Audience Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="relative z-10 mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {audienceSegments.map((seg, idx) => {
            const Icon = segmentIcons[idx % segmentIcons.length];
            const isPrimarySchoolCard = idx === 0;

            return (
              <motion.div
                key={seg.title}
                variants={riseUp}
                custom={0.08 * idx}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 ${
                  isPrimarySchoolCard
                    ? "border-[#3b00b3] bg-[#100038] text-white shadow-[0_20px_45px_rgba(59,0,179,0.22)]"
                    : "border-gray-100 bg-white text-[#0d002b] shadow-[0_10px_32px_rgba(13,0,43,0.05)] hover:border-[#3b00b3]/25 hover:shadow-[0_16px_38px_rgba(59,0,179,0.1)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                        isPrimarySchoolCard
                          ? "bg-[#9dff13] text-[#0d002b]"
                          : "bg-[#3b00b3]/10 text-[#3b00b3]"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                        isPrimarySchoolCard
                          ? "bg-white/10 text-[#9dff13]"
                          : "bg-[#3b00b3]/8 text-[#3b00b3]"
                      }`}
                    >
                      {seg.badge}
                    </span>
                  </div>

                  <h3
                    className={`mt-5 text-lg font-extrabold ${
                      isPrimarySchoolCard ? "text-white" : "text-[#0d002b]"
                    }`}
                  >
                    {seg.title}
                  </h3>

                  <p
                    className={`mt-2.5 text-xs leading-relaxed ${
                      isPrimarySchoolCard ? "text-white/80" : "text-gray-600"
                    }`}
                  >
                    {seg.description}
                  </p>

                  <ul className="mt-5 space-y-2">
                    {seg.highlights.map((point) => (
                      <li
                        key={point}
                        className={`flex items-start gap-2 text-xs font-medium ${
                          isPrimarySchoolCard
                            ? "text-white/90"
                            : "text-[#0d002b]/85"
                        }`}
                      >
                        <CheckCircle2
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                            isPrimarySchoolCard
                              ? "text-[#9dff13]"
                              : "text-[#3b00b3]"
                          }`}
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-current/10">
                  <a
                    href="#contact"
                    onClick={(e) => {
                      if (onSelectPathway) {
                        e.preventDefault();
                        onSelectPathway(seg.id, seg.title);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs font-extrabold transition-colors ${
                      isPrimarySchoolCard
                        ? "text-[#9dff13] hover:text-[#38e0ff]"
                        : "text-[#3b00b3] hover:text-[#0d002b]"
                    }`}
                  >
                    <span>{seg.ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
