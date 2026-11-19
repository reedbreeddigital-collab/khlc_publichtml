"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, PhoneCall } from "lucide-react";

const tabs = [
  {
    id: "mission",
    label: "Our Mission",
    description:
      "At edustray, we believe language is the key to connecting people, cultures, and opportunities. Our mission is to make language learning engaging, accessible, and effective for everyone regardless of age, background, or goal",
  },
  {
    id: "vision",
    label: "Our Vision",
    description:
      "We envision a world where practical digital and creative education empowers every learner to unlock their fullest potential, bridge global skill gaps, and lead tomorrow's innovation economy with confidence.",
  },
  {
    id: "value",
    label: "Our Value",
    description:
      "Excellence, hands-on mentorship, inclusive community, and real-world impact guide every course we design—ensuring you gain job-ready expertise that lasts a lifetime.",
  },
];

const features = [
  "Personal Training",
  "Diet Strategy",
  "Private Studio",
  "Transformation",
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

export default function AboutSection() {
  const [activeTab, setActiveTab] = useState("mission");

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
          {/* Left Column: Main Image + Overlapping Inset Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="relative mx-auto w-full max-w-[460px] lg:col-span-6 lg:mx-0"
          >
            {/* Main Rounded Image */}
            <motion.div
              variants={riseUp}
              custom={0}
              className="relative aspect-[4/4.2] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-[0_20px_50px_rgba(13,0,43,0.12)] sm:ml-6"
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
                alt="Student studying notes at desk"
                className="h-full w-full object-cover object-center"
              />
            </motion.div>

            {/* Overlapping Bottom-Left Inset Card with Thick White Border */}
            <motion.div
              variants={riseUp}
              custom={0.2}
              className="absolute -bottom-6 -left-2 sm:-left-6 z-10 h-44 w-44 sm:h-52 sm:w-52 overflow-hidden rounded-2xl border-[6px] border-white bg-[#f59e0b] shadow-[0_18px_40px_rgba(13,0,43,0.18)]"
            >
              <img
                src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=600&q=80"
                alt="Student holding laptop with idea"
                className="h-full w-full object-cover object-top"
              />
            </motion.div>
          </motion.div>

          {/* Right Column: About Copy, Tabs, Checklist & CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="lg:col-span-6 lg:pl-4"
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
                ABOUT US
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="text-3xl font-extrabold leading-[1.2] tracking-tight text-[#0d002b] sm:text-4xl"
            >
              Empowering Your Life{" "}
              <span className="text-[#3b00b3]">Future</span>
              <br />
              <span className="text-[#3b00b3]">with Excellence</span> in
              Education
            </motion.h2>

            {/* Interactive Pill Tabs: Our Mission | Our Vision | Our Value */}
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
              className="mt-5 text-sm leading-relaxed text-gray-500"
            >
              {currentTab.description}
            </motion.p>

            {/* 2x2 Feature Checklist */}
            <motion.div
              variants={riseUp}
              custom={0.36}
              className="mt-6 grid grid-cols-1 gap-y-3.5 gap-x-6 sm:grid-cols-2"
            >
              {features.map((item) => (
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

            {/* Bottom CTA Row: More About Us Button + Phone Contact */}
            <motion.div
              variants={riseUp}
              custom={0.44}
              className="mt-8 flex flex-wrap items-center gap-5"
            >
              <a
                href="#more-about"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#3b00b3] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_10px_25px_rgba(59,0,179,0.25)] transition-all duration-200 hover:bg-[#9dff13] hover:text-[#0d002b]"
              >
                <span>More About Us</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href="tel:+91123456789"
                className="group flex items-center gap-3"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0d002b] text-white shadow-md transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#3b00b3]">
                  <PhoneCall className="h-4.5 w-4.5 text-[#9dff13]" />
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#0d002b] transition-colors group-hover:text-[#3b00b3]">
                  (+91) 123-456-789
                </span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
