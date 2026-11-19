"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: 1,
    name: "Wanda Shawvern",
    role: "Foundr & CEO UIPainter",
    company: "UIPainter",
    quote:
      "edustray transformed my learning journey! The platform is intuitive, the courses are top-notch, and the support is exceptional. I've gained real skills and confidence. Highly recommended for anyone serious about education.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 2,
    name: "Marcus Vance",
    role: "Lead Product Designer",
    company: "UIPainter",
    quote:
      "The hands-on curriculum and real-world projects helped me transition into a senior role within months. Every instructor brings deep industry knowledge and actionable feedback.",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 3,
    name: "Elena Rostova",
    role: "Full-Stack Engineer",
    company: "UIPainter",
    quote:
      "Studying at my own pace while having direct access to mentors made all the difference. The community and course quality are unmatched.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80",
  },
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

const cardFlipVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 45 : -45,
    y: 12,
    rotateZ: direction > 0 ? 2.5 : -2.5,
    rotateY: direction > 0 ? -12 : 12,
    scale: 0.96,
  }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    rotateZ: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.48,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -45 : 45,
    y: 10,
    rotateZ: direction > 0 ? -2.5 : 2.5,
    rotateY: direction > 0 ? 12 : -12,
    scale: 0.95,
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 1, 1] as const,
    },
  }),
};

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const current = testimonials[currentIndex];

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#f7f9ff] to-white py-20 lg:py-28"
    >
      {/* Ambient Left & Right Soft Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-10 h-80 w-80 rounded-full bg-[#38e0ff]/15 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-10 h-80 w-80 rounded-full bg-[#9dff13]/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
              TESTIMONIALS
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={riseUp}
            custom={0.1}
            className="text-3xl font-extrabold leading-tight tracking-tight text-[#0d002b] sm:text-4xl"
          >
            Discover How Our Learners Describe Their
            <br />
            <span className="text-[#3b00b3]">Path to Knowledge</span> and
            Confidence
          </motion.h2>
        </motion.div>

        {/* Testimonial Card Wrapper */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={riseUp}
          custom={0.2}
          style={{ perspective: 1200 }}
          className="relative mx-auto mt-12 max-w-4xl"
        >
          {/* Bottom-Left Dotted Matrix + Soft Circle Decoration */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -left-12 z-0 hidden sm:block"
          >
            <div className="relative h-32 w-40">
              <div className="absolute -top-4 right-2 h-28 w-28 rounded-full bg-[#38e0ff]/15" />
              <svg width="130" height="84" viewBox="0 0 130 84" fill="none">
                {Array.from({ length: 7 }).map((_, row) =>
                  Array.from({ length: 11 }).map((__, col) => (
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

          {/* Stacked Back Card Layers (Animated Diagonal Stack Effect) */}
          <motion.div
            key={`back2-${currentIndex}`}
            initial={{ rotate: -3.2, x: -4, y: 4 }}
            animate={{ rotate: -2.4, x: 0, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            aria-hidden="true"
            className="pointer-events-none absolute top-4 bottom-1 -left-3.5 right-6 z-0 rounded-2xl border border-[#3b00b3]/25 bg-white/80"
          />
          <motion.div
            key={`back1-${currentIndex}`}
            initial={{ rotate: -2.2, x: -3, y: 2 }}
            animate={{ rotate: -1.2, x: 0, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            aria-hidden="true"
            className="pointer-events-none absolute top-2 bottom-0.5 -left-2 right-3 z-[5] rounded-2xl border border-[#3b00b3]/35 bg-white/95"
          />

          {/* Left Prev Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="absolute top-1/2 -left-4 sm:-left-5 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#3b00b3]/30 bg-white text-[#0d002b] shadow-md transition-all hover:scale-110 hover:border-[#3b00b3] hover:bg-[#3b00b3] hover:text-white active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Right Next Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next testimonial"
            className="absolute top-1/2 -right-4 sm:-right-5 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#3b00b3]/30 bg-white text-[#0d002b] shadow-md transition-all hover:scale-110 hover:border-[#3b00b3] hover:bg-[#3b00b3] hover:text-white active:scale-95"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Main Animated Testimonial Card */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={cardFlipVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative z-10 rounded-2xl border border-[#3b00b3]/30 bg-white p-5 sm:p-7 shadow-[0_20px_50px_rgba(13,0,43,0.06)]"
            >
              <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-12">
                {/* Left Learner Portrait */}
                <div className="md:col-span-5">
                  <div className="relative aspect-[4/3.6] w-full overflow-hidden rounded-xl bg-[#100038]">
                    <img
                      src={current.image}
                      alt={current.name}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>

                {/* Right Quote & Author Details */}
                <div className="flex flex-col justify-between md:col-span-7 md:pr-4">
                  {/* Double Quote Mark Icon */}
                  <div className="mb-3">
                    <svg
                      width="28"
                      height="22"
                      viewBox="0 0 28 22"
                      fill="none"
                      className="text-[#0d002b]/70"
                    >
                      <path
                        d="M6.4 0C2.86538 0 0 2.86538 0 6.4C0 9.93462 2.86538 12.8 6.4 12.8C7.16 12.8 7.88 12.66 8.54 12.42C7.68 15.84 4.62 18.4 0.96 18.88L1.6 22C7.82 21.18 12.8 15.84 12.8 9.2V6.4C12.8 2.86538 9.93462 0 6.4 0ZM21.6 0C18.0654 0 15.2 2.86538 15.2 6.4C15.2 9.93462 18.0654 12.8 21.6 12.8C22.36 12.8 23.08 12.66 23.74 12.42C22.88 15.84 19.82 18.4 16.16 18.88L16.8 22C23.02 21.18 28 15.84 28 9.2V6.4C28 2.86538 25.1346 0 21.6 0Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  {/* Quote Text */}
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-500">
                    {current.quote}
                  </p>

                  {/* Bottom Row: Author Name/Role + Company Logo */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#0d002b]">
                        {current.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {current.role}
                      </p>
                    </div>

                    {/* UIPainter Brand Logo */}
                    <div className="flex items-center gap-1.5 text-[#3b00b3]">
                      <span className="text-base sm:text-lg font-extrabold tracking-tight">
                        {current.company}
                      </span>
                      <svg
                        width="22"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="5" y="4" width="14" height="12" rx="2" />
                        <path d="M12 2V4" />
                        <path d="M8 22L10 16" />
                        <path d="M16 22L14 16" />
                        <path d="M7 19H17" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
