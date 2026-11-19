"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const highlights = [
  "The Most World Class Instructors",
  "Access Your Class Anywhere",
  "Flexible Course Plan",
];

const riseUp = {
  hidden: { opacity: 0, y: 40 },
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

export default function CampusSection() {
  return (
    <section
      id="campus"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#f4fbff]/60 to-white py-20 lg:py-28"
    >
      {/* Subtle Ambient Right Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-10 h-96 w-96 rounded-full bg-[#38e0ff]/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Staggered Overlapping Photos + 12% Course Success Badge + Dot Circle */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="relative mx-auto w-full max-w-[500px] lg:col-span-6 lg:mx-0"
          >
            {/* Circular Dot Matrix Top-Right of Left Image */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 right-12 z-0 hidden sm:block"
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
              {/* Top-Left Main Classroom Image */}
              <motion.div
                variants={riseUp}
                custom={0}
                className="relative z-10 w-full sm:w-[62%] aspect-[4/4.3] overflow-hidden rounded-2xl bg-gray-100 shadow-[0_18px_45px_rgba(13,0,43,0.1)]"
              >
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=700&q=80"
                  alt="Instructor guiding students in classroom"
                  className="h-full w-full object-cover"
                />
              </motion.div>

              {/* Bottom-Left 12% Course Success Pill Card */}
              <motion.div
                variants={riseUp}
                custom={0.2}
                className="mt-4 sm:mt-5 inline-flex w-fit items-center gap-3.5 rounded-xl bg-[#3b00b3] px-5 py-3.5 text-white shadow-[0_12px_30px_rgba(59,0,179,0.28)]"
              >
                {/* Certificate SVG Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#9dff13]">
                  <svg
                    viewBox="0 0 28 28"
                    fill="none"
                    className="h-6 w-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="5" width="22" height="16" rx="2" />
                    <line x1="7" y1="10" x2="14" y2="10" />
                    <line x1="7" y1="14" x2="12" y2="14" />
                    <circle cx="19" cy="14" r="3" />
                    <path d="M17.5 16.5L17 23L19 21.5L21 23L20.5 16.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-extrabold leading-none text-white">
                    12%
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-white/80">
                    Course Success
                  </p>
                </div>
              </motion.div>

              {/* Bottom-Right Overlapping Framed Student Image */}
              <motion.div
                variants={riseUp}
                custom={0.3}
                className="mt-6 sm:mt-0 sm:absolute sm:top-[24%] sm:right-0 z-20 w-full sm:w-[58%] aspect-[4/4.2] overflow-hidden rounded-2xl border-[6px] border-white bg-white shadow-[0_20px_50px_rgba(13,0,43,0.15)]"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80"
                  alt="Online learner with headphones and notebook"
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: Campus Copy, Checklist & CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="lg:col-span-6 lg:pl-6"
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
                CAMPUS
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="text-3xl font-extrabold leading-[1.2] tracking-tight text-[#0d002b] sm:text-4xl"
            >
              Cook Smarter and Tastier
              <br />
              with Our Online Classes
            </motion.h2>

            {/* Description Paragraph */}
            <motion.p
              variants={riseUp}
              custom={0.2}
              className="mt-5 text-sm leading-relaxed text-gray-500"
            >
              Enhance your knowledge and grow professionally by learning new
              skills anytime, anywhere. Access expert-led courses designed to
              help you succeed in your career, all from the comfort of your
              home.
            </motion.p>

            {/* Vertical Feature Checklist */}
            <motion.div
              variants={riseUp}
              custom={0.3}
              className="mt-6 flex flex-col space-y-3.5"
            >
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3b00b3]/10 text-[#3b00b3]">
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
                href="#more-campus"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#3b00b3] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_10px_25px_rgba(59,0,179,0.25)] transition-all duration-200 hover:bg-[#9dff13] hover:text-[#0d002b]"
              >
                <span>More About US</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom-Right Decorative Triple Zigzag Lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none mt-12 flex justify-end pr-8 lg:pr-24"
        >
          <svg
            width="95"
            height="42"
            viewBox="0 0 95 42"
            fill="none"
            className="text-[#0d002b]/10"
          >
            <path
              d="M2 12L24 3L47 12L70 3L93 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 24L24 15L47 24L70 15L93 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 36L24 27L47 36L70 27L93 36"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
