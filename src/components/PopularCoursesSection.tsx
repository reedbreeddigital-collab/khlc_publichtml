"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, User, Star, ArrowRight } from "lucide-react";

const filterTabs = ["All Courses", "Trending", "Popularity", "Featured"];

interface CourseItem {
  id: number;
  date: string;
  students: string;
  rating: string;
  title: string;
  price: string;
  image: string;
  category: string;
}

const courses: CourseItem[] = [
  {
    id: 1,
    date: "22 Dec",
    students: "50 Sutudents",
    rating: "(4.7) Rating",
    title: "Transformative Teaching Workshop",
    price: "$9.00",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    category: "Trending",
  },
  {
    id: 2,
    date: "23 Dec",
    students: "50 Sutudents",
    rating: "(4.7) Rating",
    title: "Creative Minds, Inspired Teaching",
    price: "$9.00",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    category: "Popularity",
  },
  {
    id: 3,
    date: "24 Dec",
    students: "50 Sutudents",
    rating: "(4.7) Rating",
    title: "Creative Pulse – Inspire the Educator Within",
    price: "$9.00",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    category: "Featured",
  },
  {
    id: 4,
    date: "25 Dec",
    students: "50 Sutudents",
    rating: "(4.7) Rating",
    title: "MindShift – Teaching with a New Vision",
    price: "$9.00",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
    category: "Trending",
  },
];

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

export default function PopularCoursesSection() {
  const [activeFilter, setActiveFilter] = useState("All Courses");

  return (
    <section
      id="courses"
      className="relative overflow-hidden bg-[#faf6ff]/70 py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Bottom-Left Dotted Decorative Matrix + Soft Circle */}
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
                POPULAR COURSES
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="text-3xl font-extrabold leading-tight tracking-tight text-[#0d002b] sm:text-4xl"
            >
              Learn In-Demand{" "}
              <span className="text-[#3b00b3]">Skills</span>
              <br />
              Build Your Future
            </motion.h2>
          </div>

          {/* Filter Tabs */}
          <motion.div
            variants={riseUp}
            custom={0.18}
            className="flex flex-wrap items-center gap-6"
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
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#3b00b3]" />
                  )}
                </button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* 2x2 Course Card Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="relative z-10 mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {courses.map((course, idx) => (
            <motion.div
              key={course.id}
              variants={riseUp}
              custom={0.1 * idx}
              className="group flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_10px_35px_rgba(13,0,43,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3b00b3]/20 hover:shadow-[0_18px_40px_rgba(59,0,179,0.09)]"
            >
              {/* Left Thumbnail with Date Pill & Bookmark Icon */}
              <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl sm:h-40 sm:w-48">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Top-Left Date Badge */}
                <span className="absolute top-2.5 left-2.5 rounded-md bg-[#3b00b3] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                  {course.date}
                </span>

                {/* Top-Right Bookmark Button */}
                <button
                  type="button"
                  aria-label="Bookmark course"
                  className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#0d002b] shadow-sm transition-colors hover:bg-[#9dff13] hover:text-[#0d002b]"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Right Course Content */}
              <div className="flex flex-1 flex-col justify-between w-full py-1">
                {/* Meta Row: Students & Rating */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full border border-gray-300 text-gray-500">
                      <User className="h-2.5 w-2.5" />
                    </span>
                    <span>{course.students}</span>
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[#facc15] text-[#facc15]" />
                    <span>{course.rating}</span>
                  </span>
                </div>

                {/* Course Title */}
                <h3 className="mt-3 text-base sm:text-[17px] font-extrabold leading-snug text-[#0d002b] transition-colors group-hover:text-[#3b00b3]">
                  <a href="#enroll">{course.title}</a>
                </h3>

                {/* Bottom Row: Price & Enroll Link */}
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3.5">
                  <span className="text-sm font-extrabold text-[#3b00b3]">
                    {course.price}
                  </span>

                  <a
                    href="#enroll"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0d002b] transition-colors hover:text-[#3b00b3]"
                  >
                    <span>Enroll Course</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
