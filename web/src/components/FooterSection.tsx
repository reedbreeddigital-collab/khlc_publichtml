"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import KhlcLogo from "@/components/KhlcLogo";
import {
  Mail,
  Send,
  ArrowRight,
  ChevronsUp,
  MessageCircle,
  Check,
} from "lucide-react";
import {
  khlcContact,
  navLinks,
  type EnquiryPathwayId,
} from "@/data/khlc";
import { getApiBase } from "@/lib/quizApi";

interface FooterSectionProps {
  onSelectPathway?: (pathway: EnquiryPathwayId, context?: string) => void;
}

const programLinks = [
  { label: "ICT Education", href: "/#programs" },
  { label: "Coding & Software Dev", href: "/#programs" },
  { label: "Robotics & STEM", href: "/#programs" },
  { label: "Artificial Intelligence", href: "/#programs" },
  { label: "Teacher Training", href: "/#programs" },
  { label: "Evolve 8.0 Competition", href: "/evolve" },
];

const riseUp = {
  hidden: { opacity: 0, y: 36 },
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

export default function FooterSection({ onSelectPathway }: FooterSectionProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newsletterEmail.trim();
    if (!cleaned) return;
    setSubscribing(true);
    setSubscribeError("");
    const apiBase = getApiBase();
    try {
      if (apiBase) {
        const res = await fetch(`${apiBase}/api/v1/newsletter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleaned }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Unable to save subscription.");
        }
      }
      setSubscribed(true);
      setNewsletterEmail("");
    } catch (err) {
      setSubscribeError(
        err instanceof Error ? err.message : "Could not subscribe right now."
      );
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="relative bg-[#100038] text-white">
      {/* 1. Overlapping Partnership & Updates Banner */}
      <div className="relative z-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={riseUp}
          custom={0}
          className="relative -translate-y-1/2 overflow-hidden rounded-2xl bg-[#3b00b3] px-6 py-8 sm:px-12 sm:py-10 shadow-[0_20px_50px_rgba(13,0,43,0.35)]"
        >
          {/* Decorative Wave Curves */}
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
            <div className="text-center lg:text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#9dff13]">
                STAY CONNECTED WITH KINGSHOUSE
              </span>
              <h3 className="mt-1.5 text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl">
                Get Evolve ICT Updates &amp; School EdTech Resources
              </h3>
            </div>

            {subscribed ? (
              <div className="flex items-center gap-2.5 rounded-xl bg-white/15 px-5 py-3.5 text-xs sm:text-sm font-bold text-[#9dff13] backdrop-blur-sm">
                <Check className="h-4 w-4" />
                <span>
                  Thank you! You&apos;re subscribed to Kingshouse updates.
                </span>
              </div>
            ) : (
              <div className="w-full max-w-md">
                <form
                  onSubmit={handleSubscribe}
                  className="flex w-full items-center rounded-xl bg-white p-1.5 shadow-lg"
                >
                  <div className="flex flex-1 items-center gap-2.5 pl-3.5 text-gray-400">
                    <Mail className="h-4 w-4 shrink-0" />
                    <input
                      type="email"
                      required
                      disabled={subscribing}
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your school or personal email"
                      className="w-full bg-transparent text-xs sm:text-sm text-[#0d002b] placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={subscribing}
                    aria-label="Subscribe for updates"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3b00b3] text-white transition-all hover:bg-[#9dff13] hover:text-[#0d002b] disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                {subscribeError && (
                  <p className="mt-2 text-xs font-bold text-[#9dff13]">
                    {subscribeError}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 2. Main 4-Column Footer Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-2 pb-16 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12"
        >
          {/* Column 1: KHLC Brand + Mission Summary + Partner CTA */}
          <motion.div
            variants={riseUp}
            custom={0}
            className="lg:col-span-4 lg:pr-6"
          >
            <a href="/" className="inline-flex items-center group">
              <KhlcLogo
                className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
                variant="dark"
              />
            </a>

            <p className="mt-4 max-w-xs text-xs leading-relaxed text-white/75">
              Building tomorrow&apos;s innovators through structured, practical
              ICT, Coding, Robotics, Artificial Intelligence, and teacher
              development programs across Lagos and beyond.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/#contact"
                onClick={(e) => {
                  if (onSelectPathway) {
                    e.preventDefault();
                    onSelectPathway("schools", "School Partnership Proposal");
                  }
                }}
                className="group inline-flex items-center gap-2 rounded-lg bg-[#9dff13] px-4 py-2.5 text-xs font-extrabold text-[#0d002b] transition-all hover:bg-[#38e0ff]"
              >
                <span>Partner Your School</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href="/#contact"
                onClick={(e) => {
                  if (onSelectPathway) {
                    e.preventDefault();
                    onSelectPathway("instructors", "Instructor Application");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-all hover:border-[#9dff13] hover:text-[#9dff13]"
              >
                <span>Become an Instructor</span>
              </a>
            </div>
          </motion.div>

          {/* Column 2: Explore Navigation */}
          <motion.div variants={riseUp} custom={0.1} className="lg:col-span-2">
            <h4 className="text-sm font-extrabold text-white">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-white/75">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-[#9dff13]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Programs & Events */}
          <motion.div variants={riseUp} custom={0.2} className="lg:col-span-3">
            <h4 className="text-sm font-extrabold text-white">
              Programs &amp; Initiatives
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-white/75">
              {programLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-[#9dff13]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Official Kingshouse Contact */}
          <motion.div variants={riseUp} custom={0.3} className="lg:col-span-3">
            <h4 className="text-sm font-extrabold text-white">Contact Us</h4>
            <ul className="mt-4 space-y-3 text-xs text-white/80">
              <li>
                <span className="font-bold text-white">Address:</span>{" "}
                {khlcContact.address}
              </li>
              <li>
                <span className="font-bold text-white">Telephone:</span>{" "}
                <a
                  href={khlcContact.phones[0].href}
                  className="hover:text-[#9dff13]"
                >
                  {khlcContact.phones[0].raw}
                </a>
                ,{" "}
                <a
                  href={khlcContact.phones[1].href}
                  className="hover:text-[#9dff13]"
                >
                  {khlcContact.phones[1].raw}
                </a>
              </li>
              <li>
                <span className="font-bold text-white">Email:</span>{" "}
                <a
                  href={khlcContact.emailHref}
                  className="hover:text-[#9dff13] break-all"
                >
                  {khlcContact.email}
                </a>
              </li>
            </ul>

            <div className="mt-5">
              <a
                href={khlcContact.whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#9dff13]/40 bg-[#9dff13]/10 px-4 py-2 text-xs font-bold text-[#9dff13] transition-all hover:bg-[#9dff13] hover:text-[#0d002b]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp Partnerships Desk</span>
              </a>
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
        <div
          aria-hidden="true"
          className="pointer-events-none hidden lg:block absolute inset-y-0 left-0 w-[52%] bg-[#9dff13]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 93% 100%, 0% 100%)",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-3.5 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p className="font-medium text-white lg:text-[#0d002b]">
            Copyright © {new Date().getFullYear()}{" "}
            <span className="font-extrabold">Kingshouse Learning Centre</span>.
            All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <a href="/#for-schools" className="transition-colors hover:text-[#9dff13]">
              School Partnerships
            </a>
            <span className="text-white/40">·</span>
            <a href="/evolve" className="transition-colors hover:text-[#9dff13]">
              Evolve 8.0
            </a>
            <span className="text-white/40">·</span>
            <a href="/#contact" className="transition-colors hover:text-[#9dff13]">
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* Persistent Floating WhatsApp Quick-Connect Button */}
      <a
        href={khlcContact.whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Kingshouse Learning Centre on WhatsApp"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-xs font-extrabold text-[#0d002b] shadow-[0_12px_30px_rgba(37,211,102,0.4)] transition-transform hover:scale-105"
      >
        <MessageCircle className="h-4.5 w-4.5 fill-[#0d002b] text-[#0d002b]" />
        <span className="hidden sm:inline">Chat on WhatsApp</span>
      </a>
    </footer>
  );
}
