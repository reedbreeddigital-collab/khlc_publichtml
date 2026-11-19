"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Mail, PhoneCall } from "lucide-react";

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

export default function VideoContactSection() {
  return (
    <section
      id="video-contact"
      className="relative overflow-hidden bg-[#faf6ff]/60 py-16 lg:py-24"
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Video Container */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative pb-14 sm:pb-16"
        >
          {/* Bottom-Right Circular Dotted Pattern Decoration */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 -right-6 z-0 hidden sm:block"
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
                  className="fill-[#0d002b]/45"
                />
              ))}
            </svg>
          </div>

          {/* Main Video Thumbnail Card */}
          <motion.div
            variants={riseUp}
            custom={0}
            className="group relative z-10 aspect-[16/8.2] w-full overflow-hidden rounded-2xl bg-[#100038] shadow-[0_20px_55px_rgba(13,0,43,0.12)]"
          >
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80"
              alt="Students collaborating around a laptop"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#0d002b]/20 transition-colors group-hover:bg-[#0d002b]/30" />

            {/* Centered Play Button */}
            <button
              type="button"
              aria-label="Play video"
              className="absolute top-1/2 left-1/2 flex h-14 w-14 sm:h-16 sm:w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0d002b] shadow-[0_0_0_8px_rgba(255,255,255,0.25)] transition-all duration-300 hover:scale-110 hover:bg-[#9dff13]"
            >
              <Play className="h-5 w-5 translate-x-0.5 fill-current" />
            </button>
          </motion.div>

          {/* Overlapping Bottom Contact Banner */}
          <motion.div
            variants={riseUp}
            custom={0.2}
            className="relative z-20 mx-auto -mt-12 sm:-mt-14 max-w-3xl rounded-2xl bg-[#3b00b3] px-6 py-6 sm:px-10 sm:py-7 text-white shadow-[0_20px_45px_rgba(59,0,179,0.32)]"
          >
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              {/* Left: Our Email */}
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Mail className="h-3.5 w-3.5 text-[#38e0ff]" />
                  <span>Our Email</span>
                </div>
                <a
                  href="mailto:edustrayinfo@gmail.Com"
                  className="mt-1.5 text-base sm:text-lg font-extrabold tracking-tight text-white transition-colors hover:text-[#9dff13]"
                >
                  edustrayinfo@gmail.Com
                </a>
              </div>

              {/* Center Divider with "or" */}
              <div className="flex items-center gap-3 md:flex-col md:gap-1">
                <span className="h-[1px] w-10 bg-white/20 md:h-4 md:w-[1px]" />
                <span className="text-xs font-bold lowercase text-white/80">
                  or
                </span>
                <span className="h-[1px] w-10 bg-white/20 md:h-4 md:w-[1px]" />
              </div>

              {/* Right: Call US */}
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <PhoneCall className="h-3.5 w-3.5 text-[#9dff13]" />
                  <span>Call US</span>
                </div>
                <a
                  href="tel:+918123456789"
                  className="mt-1.5 text-base sm:text-lg font-extrabold tracking-tight text-white transition-colors hover:text-[#9dff13]"
                >
                  (+918) 123-456-789
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
