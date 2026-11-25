"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, Sparkles } from "lucide-react";
import { projectsAndEvents, type EnquiryPathwayId } from "@/data/khlc";

interface ProjectsEventsSectionProps {
  onSelectPathway?: (pathway: EnquiryPathwayId, context?: string) => void;
}

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

export default function ProjectsEventsSection({
  onSelectPathway,
}: ProjectsEventsSectionProps) {
  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-[#faf6ff]/70 py-20 lg:py-28"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
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
                PROJECTS &amp; EVENTS
              </span>
            </motion.div>

            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="text-3xl font-extrabold leading-tight tracking-tight text-[#0d002b] sm:text-4xl"
            >
              Evidence of Impact:{" "}
              <span className="text-[#3b00b3]">Evolve ICT Competition</span>{" "}
              &amp; School Showcases
            </motion.h2>
          </div>

          <motion.div variants={riseUp} custom={0.18}>
            <Link
              href="/evolve"
              className="group inline-flex items-center gap-2 rounded-lg bg-[#3b00b3] px-5 py-3 text-xs font-bold text-white shadow-[0_8px_20px_rgba(59,0,179,0.22)] transition-all duration-200 hover:bg-[#9dff13] hover:text-[#0d002b]"
            >
              <span>Explore &amp; Register for Evolve 8.0</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Featured Flagship Banner: Evolve 2.0 Grand Stage */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={riseUp}
          custom={0.15}
          className="mt-10 overflow-hidden rounded-3xl bg-[#100038] text-white shadow-[0_24px_60px_rgba(13,0,43,0.18)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Wide Stage Photo */}
            <div className="relative lg:col-span-7 min-h-[260px] sm:min-h-[340px]">
              <img
                src="/images/evolve-grand-stage.webp"
                alt="Winning partner schools holding grand prize cheques on stage at the Evolve 2.0 ICT Competition"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#100038]/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#100038]/40" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[#9dff13] px-3.5 py-1.5 text-[11px] font-extrabold text-[#0d002b] shadow-md">
                <Trophy className="h-3.5 w-3.5" />
                EVOLVE 8.0 · NOW OPEN
              </span>
            </div>

            {/* Banner Narrative */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 lg:p-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38e0ff]">
                <Sparkles className="h-3.5 w-3.5 text-[#9dff13]" />
                <span>Flagship National School Tech Programme</span>
              </div>

              <h3 className="mt-3 text-2xl font-extrabold leading-snug text-white sm:text-[26px]">
                Evolve 8.0: Compete. Build. Solve.
              </h3>

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-white/80">
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
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/evolve#register"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#9dff13] px-4 py-2.5 text-xs font-extrabold text-[#0d002b] transition-colors hover:bg-[#38e0ff]"
                >
                  <span>Register Your School</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/evolve"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:border-[#38e0ff] hover:text-[#38e0ff]"
                >
                  <span>View Guidelines &amp; Themes</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4-Card Projects & School Engagements Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projectsAndEvents.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.08 * idx }}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_10px_30px_rgba(13,0,43,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3b00b3]/25 hover:shadow-[0_16px_38px_rgba(59,0,179,0.1)]"
            >
              <div>
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#100038]">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-[#100038]/85 px-2.5 py-1 text-[10px] font-bold text-[#9dff13] backdrop-blur-sm">
                    {project.badge}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-sm sm:text-[15px] font-extrabold leading-snug text-[#0d002b] group-hover:text-[#3b00b3] transition-colors">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">
                    {project.summary}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 px-4 py-3 text-[11px] font-extrabold text-[#3b00b3]">
                {project.metric}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partner School Delegation Snapshot Strip */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={riseUp}
          custom={0.2}
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          <div className="group relative overflow-hidden rounded-2xl bg-[#100038] aspect-[16/9]">
            <img
              src="/images/gallery-school-1.webp"
              alt="Partner school students and educators representing their school at Evolve 2.0 ICT Competition"
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d002b]/90 via-[#0d002b]/40 to-transparent p-4">
              <p className="text-xs font-extrabold text-[#9dff13]">
                Partner School Delegations
              </p>
              <p className="text-xs text-white/85">
                Schools represented with pride alongside dedicated educators and
                coaches.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-[#100038] aspect-[16/9]">
            <img
              src="/images/gallery-school-2.webp"
              alt="Young learners at the Evolve 2.0 ICT Competition hosted by Kingshouse Learning Centre"
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d002b]/90 via-[#0d002b]/40 to-transparent p-4">
              <p className="text-xs font-extrabold text-[#38e0ff]">
                Building Early Digital Confidence
              </p>
              <p className="text-xs text-white/85">
                Primary and secondary learners gaining stage confidence and
                practical tech fluency.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
