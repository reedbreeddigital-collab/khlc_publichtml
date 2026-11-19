"use client";

import React from "react";
import { motion } from "framer-motion";

interface CategoryItem {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
}

const riseUp = {
  hidden: { opacity: 0, y: 40 },
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

const categories: CategoryItem[] = [
  {
    title: "Business Management",
    accentColor: "#38e0ff",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="h-11 w-11 text-[#00b8d9] transition-transform duration-300 group-hover:scale-110"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="6" y="6" width="36" height="36" rx="4" />
        <line x1="11" y1="11" x2="15" y2="11" />
        <rect x="12" y="29" width="4" height="8" rx="1" />
        <rect x="20" y="24" width="4" height="13" rx="1" />
        <rect x="28" y="27" width="4" height="10" rx="1" />
        <rect x="35" y="19" width="4" height="18" rx="1" />
        <path d="M13 22L21 16L29 19L37 12" />
        <circle cx="13" cy="22" r="2" fill="currentColor" />
        <circle cx="21" cy="16" r="2" fill="currentColor" />
        <circle cx="29" cy="19" r="2" fill="currentColor" />
        <circle cx="37" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Arts & Design",
    accentColor: "#e11d74",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="h-11 w-11 text-[#e11d74] transition-transform duration-300 group-hover:scale-110"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 8C14.0589 8 6 15.1634 6 24C6 32.8366 14.0589 40 24 40C26.7614 40 29 37.7614 29 35C29 33.72 28.48 32.56 27.64 31.68C26.84 30.84 26.4 29.72 26.4 28.5C26.4 26.0147 28.4147 24 30.9 24H34C38.4183 24 42 20.4183 42 16C42 11.5817 33.9411 8 24 8Z" />
        <circle cx="14.5" cy="20.5" r="2.2" />
        <circle cx="20.5" cy="15.5" r="2.2" />
        <circle cx="15.5" cy="28.5" r="2.2" />
        <circle cx="22.5" cy="33.5" r="2" />
        <path d="M36 6L33 20L37 21L40 7L36 6Z" />
        <path d="M34 21V39C34 40.6569 35.3431 42 37 42C38.6569 42 40 40.6569 40 39V21" />
      </svg>
    ),
  },
  {
    title: "Health & Fitness",
    accentColor: "#f59e0b",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="h-11 w-11 text-[#f59e0b] transition-transform duration-300 group-hover:scale-110"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="13" y="7" width="14" height="5" rx="1.5" />
        <path d="M15 12V16L11 20V38C11 39.6569 12.3431 41 14 41H26C27.6569 41 29 39.6569 29 38V20L25 16V12" />
        <rect x="11" y="23" width="18" height="11" />
        <path d="M20 26V31" />
        <path d="M17.5 28.5H22.5" />
        <rect
          x="32"
          y="25"
          width="12"
          height="6"
          rx="3"
          transform="rotate(35 32 25)"
        />
      </svg>
    ),
  },
  {
    title: "Personal Development",
    accentColor: "#10b981",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="h-11 w-11 text-[#10b981] transition-transform duration-300 group-hover:scale-110"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="6" y="8" width="36" height="32" rx="4" />
        <line x1="6" y1="16" x2="42" y2="16" />
        <circle cx="11" cy="12" r="1" fill="currentColor" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
        <path d="M18 24L13 28L18 32" />
        <path d="M30 24L35 28L30 32" />
        <line x1="26" y1="22" x2="22" y2="34" />
      </svg>
    ),
  },
  {
    title: "Video & Photography",
    accentColor: "#ef4444",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="h-11 w-11 text-[#ef4444] transition-transform duration-300 group-hover:scale-110"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="7" y="18" width="34" height="23" rx="3" />
        <path d="M7 14L39 8L41 15L8 20L7 14Z" />
        <line x1="15" y1="12.5" x2="18" y2="18.5" />
        <line x1="24" y1="11" x2="27" y2="17" />
        <line x1="33" y1="9.5" x2="36" y2="15.5" />
        <polygon points="21,25 21,34 29,29.5" />
      </svg>
    ),
  },
  {
    title: "Computer Science",
    accentColor: "#2563eb",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="h-11 w-11 text-[#2563eb] transition-transform duration-300 group-hover:scale-110"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="6" y="8" width="36" height="25" rx="3" />
        <line x1="6" y1="28" x2="42" y2="28" />
        <path d="M19 33L17 40H31L29 33" />
        <line x1="14" y1="40" x2="34" y2="40" />
        <circle cx="15" cy="18" r="2" />
        <circle cx="22" cy="14" r="2" />
        <circle cx="22" cy="22" r="2" />
        <line x1="17" y1="17" x2="20" y2="15" />
        <line x1="17" y1="19" x2="20" y2="21" />
        <line x1="28" y1="15" x2="36" y2="15" />
        <line x1="28" y1="19" x2="36" y2="19" />
        <line x1="28" y1="23" x2="33" y2="23" />
      </svg>
    ),
  },
  {
    title: "Digital Marketing",
    accentColor: "#f43f5e",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="h-11 w-11 text-[#f43f5e] transition-transform duration-300 group-hover:scale-110"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 24L32 12V34L12 24Z" />
        <rect x="8" y="21" width="5" height="7" rx="1.5" />
        <path d="M13 28L16 37C16.4 38.2 17.6 39 18.8 38.6C20 38.2 20.6 37 20.2 35.8L18 28" />
        <line x1="36" y1="16" x2="40" y2="13" />
        <line x1="37" y1="23" x2="42" y2="23" />
        <line x1="36" y1="30" x2="40" y2="33" />
      </svg>
    ),
  },
  {
    title: "Data Science",
    accentColor: "#3b00b3",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="h-11 w-11 text-[#3b00b3] transition-transform duration-300 group-hover:scale-110"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="7" y="7" width="34" height="34" rx="4" />
        <line x1="12" y1="12" x2="16" y2="12" />
        <rect x="13" y="29" width="4" height="8" rx="1" />
        <rect x="20" y="24" width="4" height="13" rx="1" />
        <rect x="27" y="27" width="4" height="10" rx="1" />
        <rect x="34" y="19" width="4" height="18" rx="1" />
        <path d="M14 22L21 16L29 20L36 12" />
        <circle cx="14" cy="22" r="2" fill="currentColor" />
        <circle cx="21" cy="16" r="2" fill="currentColor" />
        <circle cx="29" cy="20" r="2" fill="currentColor" />
        <circle cx="36" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
];

export default function CategoriesSection() {
  return (
    <section
      id="categories"
      className="relative overflow-hidden bg-gradient-to-b from-[#faf9ff] via-white to-[#f5f3ff]/40 py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top-Left 3D Floating Stack of Books Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 left-2 hidden md:block lg:left-6"
        >
          <svg
            width="115"
            height="100"
            viewBox="0 0 115 100"
            fill="none"
            className="drop-shadow-md"
          >
            {/* Bottom Green/Lime Book */}
            <path d="M12 62L55 46L98 60L55 76L12 62Z" fill="#9dff13" />
            <path d="M12 62V72L55 86V76L12 62Z" fill="#10b981" />
            <path d="M55 76V86L98 70V60L55 76Z" fill="#e2e8f0" />
            {/* Middle Cyan Book */}
            <path d="M18 46L58 32L94 44L54 58L18 46Z" fill="#38e0ff" />
            <path d="M18 46V55L54 67V58L18 46Z" fill="#0284c7" />
            <path d="M54 58V67L94 53V44L54 58Z" fill="#f8fafc" />
            {/* Top Purple Book */}
            <path d="M24 30L58 18L88 28L54 40L24 30Z" fill="#a855f7" />
            <path d="M24 30V38L54 48V40L24 30Z" fill="#3b00b3" />
            <path d="M54 40V48L88 36V28L54 40Z" fill="#ffffff" />
            {/* Small Pencil on Bottom Right */}
            <rect
              x="48"
              y="78"
              width="38"
              height="7"
              rx="3.5"
              transform="rotate(-8 48 78)"
              fill="#3b00b3"
            />
            <circle cx="85" cy="76" r="3.5" fill="#9dff13" />
          </svg>
        </motion.div>

        {/* Bottom-Left Dotted Decorative Matrix + Soft Circle */}
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
                    className="fill-[#3b00b3]/45"
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
              CATEGORY
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={riseUp}
            custom={0.1}
            className="text-3xl font-extrabold leading-tight tracking-tight text-[#0d002b] sm:text-4xl"
          >
            Discover Leading{" "}
            <span className="text-[#3b00b3]">Course</span>
            <br />
            <span className="text-[#3b00b3]">Categories</span> to Elevate Your
            Skills
          </motion.h2>
        </motion.div>

        {/* 8-Card Category Grid (2 rows x 4 columns on desktop) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="relative z-10 mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((cat, idx) => (
            <motion.a
              key={cat.title}
              href="#courses"
              variants={riseUp}
              custom={0.08 * idx}
              className="group relative flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-8 text-center shadow-[0_8px_30px_rgba(13,0,43,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3b00b3]/20 hover:bg-[#faf8ff] hover:shadow-[0_14px_34px_rgba(59,0,179,0.09)]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-colors">
                {cat.icon}
              </div>
              <h3 className="text-sm font-bold text-[#0d002b] transition-colors group-hover:text-[#3b00b3]">
                {cat.title}
              </h3>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
