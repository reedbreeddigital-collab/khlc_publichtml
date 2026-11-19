"use client";

import React from "react";
import { motion } from "framer-motion";
import KhlcLogo from "@/components/KhlcLogo";
import { Mail, Send, ArrowRight, ChevronsUp } from "lucide-react";

const usefulLinks = [
  "Marketplace",
  "kindergarten",
  "University",
  "GYM Coaching",
  "Cooking",
];

const companyLinks = [
  "Contact Us",
  "Become Teacher",
  "Blog",
  "Instructor",
  "Events",
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

export default function FooterSection() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-[#100038] text-white">
      {/* 1. Overlapping Newsletter CTA Banner */}
      <div className="relative z-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={riseUp}
          custom={0}
          className="relative -translate-y-1/2 overflow-hidden rounded-2xl bg-[#3b00b3] px-6 py-8 sm:px-12 sm:py-10 shadow-[0_20px_50px_rgba(13,0,43,0.35)]"
        >
          {/* Decorative Subtle Wave Curves Inside Banner */}
          <svg
            aria-hidden="true"
            viewBox="0 0 600 200"
            fill="none"
            className="pointer-events-none absolute top-0 right-0 h-full w-3/5 text-white/10"
          >
            <path
              d="M120 220C200 100 320 0 520 -20"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M240 240C320 120 440 40 620 20"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="520"
              cy="160"
              r="110"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-between gap-6 lg:flex-row">
            {/* Left Heading */}
            <h3 className="text-center text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl lg:text-left">
              Sign Up today to get the
              <br />
              latest inspiration &amp; insights
            </h3>

            {/* Right Email Input Box */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-md items-center rounded-xl bg-white p-1.5 shadow-lg"
            >
              <div className="flex flex-1 items-center gap-2.5 pl-3.5 text-gray-400">
                <Mail className="h-4 w-4 shrink-0" />
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  className="w-full bg-transparent text-xs sm:text-sm text-[#0d002b] placeholder-gray-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3b00b3] text-white transition-all hover:bg-[#9dff13] hover:text-[#0d002b]"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* 2. Main 4-Column Footer Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-4 pb-16 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12"
        >
          {/* Column 1: KHLC Brand + Bio + Contact Us Button */}
          <motion.div
            variants={riseUp}
            custom={0}
            className="lg:col-span-4 lg:pr-6"
          >
            <a href="#" className="inline-flex items-center group">
              <KhlcLogo className="h-14 w-auto transition-transform duration-300 group-hover:scale-105" variant="dark" />
            </a>

            <p className="mt-4 max-w-xs text-xs leading-relaxed text-white/70">
              Access expert-led courses designed to help you succeed in your
              career, all from the comfort of your home.
            </p>

            <div className="mt-6">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#3b00b3] border border-[#38e0ff]/30 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#9dff13] hover:border-[#9dff13] hover:text-[#0d002b]"
              >
                <span>Contact Us</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>

          {/* Column 2: Useful Links */}
          <motion.div variants={riseUp} custom={0.1} className="lg:col-span-2">
            <h4 className="text-sm font-extrabold text-white">Useful Links</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-white/75">
              {usefulLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="transition-colors hover:text-[#9dff13]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Our Company */}
          <motion.div variants={riseUp} custom={0.2} className="lg:col-span-3">
            <h4 className="text-sm font-extrabold text-white">Our Company</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-white/75">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="transition-colors hover:text-[#9dff13]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Get Contact & Social Icons */}
          <motion.div variants={riseUp} custom={0.3} className="lg:col-span-3">
            <h4 className="text-sm font-extrabold text-white">Get Contact</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-white/80">
              <li>
                <span className="font-bold text-white">Phone:</span> (+91)
                123-456-789
              </li>
              <li>
                <span className="font-bold text-white">Email:</span>{" "}
                edustray@gmail.com
              </li>
              <li>
                <span className="font-bold text-white">Location:</span> North
                America, USA
              </li>
            </ul>

            {/* Social Media Buttons (X, Facebook, Instagram, LinkedIn) */}
            <div className="mt-5 flex items-center gap-2.5">
              {[
                {
                  label: "X",
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  label: "Facebook",
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ),
                },
                {
                  label: "LinkedIn",
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:border-[#9dff13] hover:bg-[#9dff13] hover:text-[#0d002b]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll-to-Top Floating Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="absolute bottom-14 right-6 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#3b00b3] text-white shadow-lg transition-all hover:bg-[#9dff13] hover:text-[#0d002b]"
      >
        <ChevronsUp className="h-4 w-4" />
      </button>

      {/* 3. Bottom Diagonal Split Copyright Bar */}
      <div className="relative overflow-hidden bg-[#3b00b3]">
        {/* Left Lime-Green Angled Polygon Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none hidden lg:block absolute inset-y-0 left-0 w-[48%] bg-[#9dff13]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 93% 100%, 0% 100%)",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-3.5 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p className="font-medium text-white lg:text-[#0d002b]">
            Copyright © 2026{" "}
            <span className="font-extrabold">Ordianit</span> All Rights Reserved
          </p>

          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <a href="#" className="transition-colors hover:text-[#9dff13]">
              Terms of service
            </a>
            <span className="text-white/40">-</span>
            <a href="#" className="transition-colors hover:text-[#9dff13]">
              Subscription
            </a>
            <span className="text-white/40">-</span>
            <a href="#" className="transition-colors hover:text-[#9dff13]">
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
