"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, ArrowRight, Check } from "lucide-react";
import { programs, type EnquiryPathwayId } from "@/data/khlc";

interface PopularCoursesSectionProps {
  onSelectPathway?: (pathway: EnquiryPathwayId, context?: string) => void;
}

const filterTabs = [
  "All Programs",
  "For Schools",
  "Coding & STEM",
  "Educator Training",
] as const;

type FilterTab = (typeof filterTabs)[number];

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

export default function PopularCoursesSection({
  onSelectPathway,
}: PopularCoursesSectionProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All Programs");

  const filteredPrograms =
    activeFilter === "All Programs"
      ? programs
      : programs.filter((item) => item.filterGroup === activeFilter);

  return (
    <section
      id="programs"
      className="relative overflow-hidden bg-[#faf6ff]/70 py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Bottom-Left Dotted Decorative Matrix */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 -left-6 hidden sm:block lg:-left-8"
        >
          <div className="relative h-32 w-36">
            <div className="absolute -top-3 right-0 h-28 w-28 rounded-full bg-[#38e0ff]/12" />
            <svg width="110" height="78" viewBox="0 0 110 78" fill="none">
              {Array.from({ length: 7 }).map((_, row) =>
                Array.from({ length: 9 }).map((__, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={8 + col * 11}
                    cy={8 + row * 11}
                    r="1.7"
                    className="fill-[#3b00b3]/45"
                  />
                ))
              )}
            </svg>
          </div>
        </div>

        {/* Header Row: Left Title & Right Filter Tabs */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
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
                OUR PROGRAMS &amp; SERVICES
              </span>
            </motion.div>

            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="text-3xl font-extrabold leading-tight tracking-tight text-[#0d002b] sm:text-4xl"
            >
              Practical Technology Programs Built for{" "}
              <span className="text-[#3b00b3]">Real-World Impact</span>
            </motion.h2>
          </div>

          {/* Functional Filter Tabs */}
          <motion.div
            variants={riseUp}
            custom={0.18}
            className="flex flex-wrap items-center gap-5 sm:gap-6"
          >
            {filterTabs.map((tab) => {
              const isActive = tab === activeFilter;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`relative pb-1.5 text-xs sm:text-sm font-bold transition-colors ${
                    isActive
                      ? "text-[#0d002b]"
                      : "text-gray-500 hover:text-[#3b00b3]"
                  }`}
                >
                  {tab}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#3b00b3]" />
                  )}
                </button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Programs 2-Column Horizontal Cards Grid */}
        <div className="relative z-10 mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredPrograms.map((program, idx) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0.06 * idx }}
              className="group flex flex-col sm:flex-row items-stretch gap-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_10px_35px_rgba(13,0,43,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3b00b3]/25 hover:shadow-[0_18px_40px_rgba(59,0,179,0.09)]"
            >
              {/* Left Thumbnail with Program Badge */}
              <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-xl sm:h-auto sm:w-48 bg-[#100038]">
                <img
                  src={program.image}
                  alt={program.title}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 rounded-md bg-[#3b00b3] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                  {program.tag}
                </span>
              </div>

              {/* Right Program Details */}
              <div className="flex flex-1 flex-col justify-between py-0.5">
                <div>
                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-[#3b00b3]" />
                      <span>{program.audience}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#0099cc]" />
                      <span>{program.delivery}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2.5 text-base sm:text-[17px] font-extrabold leading-snug text-[#0d002b] transition-colors group-hover:text-[#3b00b3]">
                    {program.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">
                    {program.description}
                  </p>

                  {/* Outcomes */}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                    {program.outcomes.map((outcome) => (
                      <span
                        key={outcome}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0d002b]"
                      >
                        <Check className="h-3 w-3 text-[#3b00b3] stroke-[3]" />
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-[11px] font-bold text-[#3b00b3]">
                    {program.filterGroup}
                  </span>

                  <a
                    href="#contact"
                    onClick={(e) => {
                      if (onSelectPathway) {
                        e.preventDefault();
                        onSelectPathway(program.pathway, program.title);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0d002b] transition-colors hover:text-[#3b00b3]"
                  >
                    <span>Request Program Info</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
