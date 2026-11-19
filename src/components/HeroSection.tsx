"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import KhlcLogo from "@/components/KhlcLogo";
import {
  ChevronDown,
  LayoutGrid,
  Search,
  User,
  Heart,
  ShoppingCart,
  ArrowRight,
  Star,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Home", hasDropdown: true },
  { label: "Pages", hasDropdown: true },
  { label: "Courses", hasDropdown: true },
  { label: "Blog", hasDropdown: true },
  { label: "Contact", hasDropdown: true },
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

export default function HeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#100038] text-white">
      {/* 1. Top Announcement Bar */}
      <div className="w-full bg-gradient-to-r from-[#3b00b3] via-[#38e0ff] to-[#9dff13] py-2 px-4 text-center text-xs sm:text-[13px] font-semibold text-[#0d002b] tracking-tight">
        <p>
          Today big dealoff <span className="font-extrabold">70%</span>. End in{" "}
          <span className="font-extrabold">30 Days 02 : 15 : 05</span> Hurry Up
        </p>
      </div>

      {/* 2. Navigation Bar */}
      <header className="relative z-20 border-b border-white/10 bg-[#1a005c]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="#" className="flex items-center group">
            <KhlcLogo className="h-12 w-auto transition-transform duration-300 group-hover:scale-105" variant="dark" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-1 text-sm font-medium text-white/90 transition-colors hover:text-[#9dff13]"
              >
                <span>{item.label}</span>
                {item.hasDropdown && (
                  <ChevronDown className="h-3.5 w-3.5 text-white/70" />
                )}
              </a>
            ))}
          </nav>

          {/* Right Action Controls: Categories + Search Pill & Icon Buttons */}
          <div className="hidden xl:flex items-center gap-4">
            {/* Categories + Search Combined Pill */}
            <div className="flex items-center rounded-full border border-white/15 bg-[#100038]/70 px-4 py-2 text-sm">
              <button
                type="button"
                className="flex items-center gap-2 pr-3.5 font-medium text-white/90 transition-colors hover:text-[#38e0ff]"
              >
                <LayoutGrid className="h-4 w-4 text-[#38e0ff]" />
                <span>Categories</span>
                <ChevronDown className="h-3.5 w-3.5 text-white/60" />
              </button>
              <div className="h-4 w-[1px] bg-white/15" />
              <div className="flex items-center pl-3.5">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-32 bg-transparent text-xs text-white placeholder-white/50 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Search"
                  className="text-white/70 transition-colors hover:text-[#9dff13]"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* User, Wishlist, Cart Circular Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Account"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition-all hover:border-[#38e0ff] hover:bg-[#38e0ff]/15 hover:text-white"
              >
                <User className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label="Wishlist"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition-all hover:border-[#38e0ff] hover:bg-[#38e0ff]/15 hover:text-white"
              >
                <Heart className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#38e0ff] text-[10px] font-bold text-[#0d002b]">
                  2
                </span>
              </button>

              <button
                type="button"
                aria-label="Cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition-all hover:border-[#9dff13] hover:bg-[#9dff13]/15 hover:text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#9dff13] text-[10px] font-bold text-[#0d002b]">
                  2
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#140047] px-4 pt-3 pb-6 lg:hidden">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className="flex items-center justify-between py-1.5 text-sm font-medium text-white/90 hover:text-[#9dff13]"
                >
                  <span>{item.label}</span>
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </a>
              ))}
              <div className="pt-2">
                <div className="flex items-center rounded-full border border-white/15 bg-[#100038] px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full bg-transparent text-sm text-white placeholder-white/50 focus:outline-none"
                  />
                  <Search className="h-4 w-4 text-white/70" />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. Main Hero Banner */}
      <section className="relative z-10 mx-auto flex flex-1 w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Subtle Background Decorative Watermark & Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {/* Ambient radial glow */}
          <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#3b00b3]/50 blur-[130px]" />
          <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#38e0ff]/15 blur-[120px]" />

          {/* Faint left geometric watermark */}
          <div className="absolute top-12 -left-24 h-[420px] w-[320px] -rotate-12 rounded-[60px] border-[28px] border-white/[0.02]" />

          {/* Faint bottom-right "e" watermark */}
          <span className="absolute -bottom-16 -right-6 select-none text-[320px] font-black leading-none text-white/[0.025]">
            e
          </span>
        </div>

        {/* Top-Right Circular Dotted Pattern (Lime Green) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 right-6 hidden sm:block lg:top-8 lg:right-10"
        >
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
            {[
              [35, 10], [55, 10], [75, 10],
              [20, 26], [40, 26], [60, 26], [80, 26], [96, 26],
              [10, 44], [30, 44], [50, 44], [70, 44], [90, 44], [104, 44],
              [14, 62], [34, 62], [54, 62], [74, 62], [94, 62],
              [24, 80], [44, 80], [64, 80], [84, 80],
              [40, 96], [60, 96], [78, 96],
            ].map(([cx, cy], idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="3.2"
                className="fill-[#9dff13]/75"
              />
            ))}
          </svg>
        </div>

        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Hero Copy & CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="lg:col-span-6 lg:pr-6"
          >
            {/* Eyebrow Badge */}
            <motion.div
              variants={riseUp}
              custom={0}
              className="mb-5 inline-flex items-center gap-2.5"
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                  <path d="M7 0L14 8L7 16L0 8L7 0Z" fill="#38e0ff" />
                  <path d="M7 0L14 8L7 16V0Z" fill="#9dff13" />
                </svg>
              </span>
              <span className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] text-white">
                LEARN BEYOND LIMITS
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={riseUp}
              custom={0.1}
              className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[54px]"
            >
              Upgrade Your{" "}
              <span className="text-[#9dff13]">Skills,</span>
              <br />
              <span className="text-[#9dff13]">Shape</span> Your Future
            </motion.h1>

            {/* Subtitle Paragraph */}
            <motion.p
              variants={riseUp}
              custom={0.2}
              className="mt-5 max-w-lg text-sm sm:text-[15px] leading-relaxed text-white/80"
            >
              Gain practical experience with real-world projects that prepare
              you for the challenges of today&apos;s fast-changing job market
            </motion.p>

            {/* Primary CTA Button */}
            <motion.div variants={riseUp} custom={0.3} className="mt-8">
              <a
                href="#courses"
                className="group inline-flex items-center gap-2.5 rounded-lg bg-[#3b00b3] border border-[#38e0ff]/40 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(59,0,179,0.6)] transition-all duration-200 hover:bg-[#9dff13] hover:border-[#9dff13] hover:text-[#0d002b] hover:shadow-[0_0_25px_rgba(157,255,19,0.4)]"
              >
                <span>Find Courses</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column: 3-Column Student Bento Collage + Floating Badges */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative lg:col-span-6"
          >
            <div className="relative mx-auto max-w-[540px] lg:max-w-none">
              {/* 3-Column Asymmetric Grid */}
              <div className="grid grid-cols-3 items-center gap-3.5 sm:gap-5">
                {/* Column 1: 2 Stacked Cards */}
                <motion.div
                  variants={riseUp}
                  custom={0.15}
                  className="flex flex-col gap-3.5 sm:gap-5 pt-6"
                >
                  {/* Top-Left Student Card */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-tl-[36px] rounded-tr-[14px] rounded-bl-[14px] rounded-br-[36px] bg-[#ff8da1] shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80"
                      alt="Student with headphones and notebook"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>

                  {/* Bottom-Left Student Card */}
                  <div className="relative aspect-[4/4.3] w-full overflow-hidden rounded-tl-[14px] rounded-tr-[36px] rounded-bl-[36px] rounded-br-[14px] bg-[#38e0ff] shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
                      alt="Smiling student holding folders"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </motion.div>

                {/* Column 2: 2 Stacked Cards (shifted upward) */}
                <motion.div
                  variants={riseUp}
                  custom={0.28}
                  className="flex flex-col gap-3.5 sm:gap-5 -mt-6"
                >
                  {/* Top-Middle Student Card */}
                  <div className="relative aspect-[4/4.4] w-full overflow-hidden rounded-tl-[14px] rounded-tr-[36px] rounded-bl-[36px] rounded-br-[14px] bg-[#ff6584] shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                      alt="Happy student giving thumbs up"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>

                  {/* Bottom-Middle Tall Student Card */}
                  <div className="relative aspect-[4/5.6] w-full overflow-hidden rounded-tl-[36px] rounded-tr-[14px] rounded-bl-[14px] rounded-br-[36px] bg-[#38e0ff]/90 shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80"
                      alt="Male student with yellow folder pointing up"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </motion.div>

                {/* Column 3: 1 Tall Pill Card */}
                <motion.div
                  variants={riseUp}
                  custom={0.4}
                  className="flex flex-col justify-center"
                >
                  <div className="relative aspect-[4/7.8] w-full overflow-hidden rounded-[44px] bg-[#a594f9] shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80"
                      alt="Female student in yellow sweater"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Floating Badge 1: 4.9 Student Rating (Left overlap) */}
              <motion.div
                variants={riseUp}
                custom={0.5}
                className="absolute top-[22%] -left-3 sm:-left-8 z-20 flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-[#0d002b] shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9dff13]/25">
                  <Star className="h-4.5 w-4.5 fill-[#3b00b3] text-[#3b00b3]" />
                </div>
                <div className="pr-1">
                  <p className="text-sm font-extrabold leading-tight text-[#3b00b3]">
                    4.9
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">
                    Student Rating
                  </p>
                </div>
              </motion.div>

              {/* Floating Badge 2: 10K+ Students Enrolled (Right overlap) */}
              <motion.div
                variants={riseUp}
                custom={0.6}
                className="absolute bottom-[22%] -right-2 sm:-right-6 z-20 flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-[#0d002b] shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3b00b3] via-[#38e0ff] to-[#9dff13] text-xs font-extrabold text-white shadow-inner">
                  10K+
                </div>
                <div className="pr-1">
                  <p className="text-xs font-bold text-[#0d002b]">
                    Students Enrolled
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
