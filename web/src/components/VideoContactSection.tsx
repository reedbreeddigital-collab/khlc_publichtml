"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  PhoneCall,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle2,
  Building2,
  Users,
  Handshake,
  GraduationCap,
  Download,
} from "lucide-react";
import { khlcContact, type EnquiryPathwayId } from "@/data/khlc";

interface VideoContactSectionProps {
  selectedPathway?: EnquiryPathwayId;
  selectedContext?: string;
  onPathwayChange?: (pathway: EnquiryPathwayId) => void;
}

const pathwayConfig: {
  id: EnquiryPathwayId;
  label: string;
  shortLabel: string;
  subtitle: string;
  orgLabel: string;
  orgPlaceholder: string;
  focusLabel: string;
  focusOptions: string[];
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "schools",
    label: "School Partnerships",
    shortLabel: "For Schools",
    subtitle:
      "Request a custom proposal for ICT, Coding, Robotics, AI, or Teacher Training at your school.",
    orgLabel: "School Name & Location",
    orgPlaceholder: "e.g., Gracefield Academy, Festac / Amuwo Odofin",
    focusLabel: "Primary Program Interest",
    focusOptions: [
      "Full School Technology Program (ICT + Coding + Robotics)",
      "Coding & Robotics Club Partnership",
      "Artificial Intelligence & Digital Literacy Track",
      "Teacher Training & Capacity Building",
      "Evolve ICT Competition Registration",
    ],
    icon: Building2,
  },
  {
    id: "parents",
    label: "Parents & Learners",
    shortLabel: "Parents / Learners",
    subtitle:
      "Enquire about after-school, weekend, or holiday tech programs for your child or individual skill tracks.",
    orgLabel: "Learner's Age / Class (or Individual)",
    orgPlaceholder: "e.g., Age 10 (Primary 5) or Individual Adult Track",
    focusLabel: "Preferred Learning Track",
    focusOptions: [
      "Kids Coding (Scratch, Python, Web)",
      "Robotics & Hands-On STEM Club",
      "ICT Foundations & Digital Literacy",
      "Artificial Intelligence for Young Innovators",
      "Individual Career Tech Training",
    ],
    icon: Users,
  },
  {
    id: "partners",
    label: "Institutional Partners",
    shortLabel: "Partners / CSR",
    subtitle:
      "Partner with Kingshouse on Evolve ICT Competition sponsorships, school labs, or community STEM impact.",
    orgLabel: "Organization / Institution Name",
    orgPlaceholder: "e.g., Corporate Foundation, NGO, or EdTech Partner",
    focusLabel: "Collaboration Area",
    focusOptions: [
      "Evolve ICT Competition Sponsorship",
      "School Computer / Robotics Lab Donation",
      "Community Youth Digital Inclusion Project",
      "Government / NGO Education Initiative",
    ],
    icon: Handshake,
  },
  {
    id: "instructors",
    label: "Instructor Applications",
    shortLabel: "Join as Instructor",
    subtitle:
      "Passionate about teaching ICT, Coding, Robotics, or AI to young learners? Apply to join our faculty.",
    orgLabel: "Years of Teaching / Tech Experience",
    orgPlaceholder: "e.g., 3 years teaching Python & Robotics in Lagos",
    focusLabel: "Area of Specialization",
    focusOptions: [
      "ICT & Digital Literacy Instructor",
      "Coding Instructor (Scratch / Python / Web)",
      "Robotics & Embedded Systems Facilitator",
      "AI & Data Literacy Educator",
    ],
    icon: GraduationCap,
  },
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

export default function VideoContactSection({
  selectedPathway = "schools",
  selectedContext = "",
  onPathwayChange,
}: VideoContactSectionProps) {
  const [activeTab, setActiveTab] = useState<EnquiryPathwayId>(selectedPathway);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orgDetail, setOrgDetail] = useState("");
  const [focus, setFocus] = useState(pathwayConfig[0].focusOptions[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setActiveTab(selectedPathway);
    const cfg =
      pathwayConfig.find((p) => p.id === selectedPathway) || pathwayConfig[0];
    setFocus(cfg.focusOptions[0]);
    if (selectedContext) {
      setMessage((prev) =>
        prev.trim() === ""
          ? `Hello Kingshouse team, I am reaching out regarding: ${selectedContext}.`
          : prev
      );
    }
    setSubmitted(false);
  }, [selectedPathway, selectedContext]);

  const currentConfig =
    pathwayConfig.find((p) => p.id === activeTab) || pathwayConfig[0];

  const handleTabSwitch = (id: EnquiryPathwayId) => {
    setActiveTab(id);
    const cfg = pathwayConfig.find((p) => p.id === id) || pathwayConfig[0];
    setFocus(cfg.focusOptions[0]);
    setSubmitted(false);
    if (onPathwayChange) {
      onPathwayChange(id);
    }
  };

  const buildSummaryMessage = () => {
    return [
      `Hello Kingshouse Learning Centre,`,
      `Pathway: ${currentConfig.label}`,
      `Name: ${fullName || "Prospective Partner"}`,
      `Phone: ${phone || "N/A"}`,
      `Email: ${email || "N/A"}`,
      `${currentConfig.orgLabel}: ${orgDetail || "N/A"}`,
      `Interest: ${focus}`,
      message ? `Details: ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#faf6ff]/80 pt-20 pb-36 lg:pt-24 lg:pb-40"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="mx-auto max-w-2xl text-center"
        >
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
              PARTNERSHIPS &amp; ENQUIRIES
            </span>
          </motion.div>

          <motion.h2
            variants={riseUp}
            custom={0.1}
            className="text-3xl font-extrabold leading-tight tracking-tight text-[#0d002b] sm:text-4xl"
          >
            Let&apos;s Build the{" "}
            <span className="text-[#3b00b3]">Future</span> Together
          </motion.h2>

          <motion.p
            variants={riseUp}
            custom={0.18}
            className="mt-3 text-sm sm:text-[15px] text-gray-600"
          >
            We would be delighted to customize a technology education program
            that aligns with your school&apos;s vision and goals.{" "}
            <strong className="text-[#0d002b]">
              {khlcContact.closingMotto}
            </strong>
          </motion.p>
        </motion.div>

        {/* Main Two-Column Conversion Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={riseUp}
          custom={0.2}
          className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12"
        >
          {/* Left: Direct Business Development Contact Card */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#100038] p-7 sm:p-8 text-white shadow-[0_22px_55px_rgba(16,0,56,0.22)] lg:col-span-5 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#38e0ff]/20 blur-[85px]"
            />

            <div className="relative z-10">
              <span className="inline-block rounded-full bg-[#9dff13]/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#9dff13]">
                Direct Business Development
              </span>
              <h3 className="mt-4 text-2xl font-extrabold leading-snug">
                Connect Directly With Kingshouse Learning Centre
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-white/75">
                Prospective school proprietors, principals, parents, and
                corporate partners can reach our team directly by phone, email,
                or WhatsApp for rapid proposals and campus visits.
              </p>

              {/* Contact Items */}
              <div className="mt-7 space-y-5">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#9dff13]">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Centre Address
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-white">
                      {khlcContact.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#38e0ff]">
                    <PhoneCall className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Let&apos;s Talk (Telephone)
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-sm font-extrabold">
                      {khlcContact.phones.map((phoneItem, i) => (
                        <React.Fragment key={phoneItem.raw}>
                          <a
                            href={phoneItem.href}
                            className="hover:text-[#9dff13] transition-colors"
                          >
                            {phoneItem.display}
                          </a>
                          {i === 0 && <span className="text-white/30">|</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#9dff13]">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Official Email
                    </p>
                    <a
                      href={khlcContact.emailHref}
                      className="mt-0.5 block text-sm font-extrabold text-white hover:text-[#9dff13] transition-colors break-all"
                    >
                      {khlcContact.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp & Brochure Instant CTAs */}
            <div className="relative z-10 mt-8 rounded-2xl border border-[#9dff13]/30 bg-white/[0.06] p-4 space-y-2.5">
              <p className="text-xs font-bold text-white">
                Prefer an instant conversation or brochure?
              </p>
              <p className="text-[11px] text-white/75">
                Message our partnerships desk on WhatsApp or download our
                official School Partnership Brochure PDF.
              </p>
              <a
                href={khlcContact.whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#9dff13] px-4 py-3 text-xs font-extrabold text-[#0d002b] transition-all hover:bg-[#38e0ff]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat With Us on WhatsApp</span>
              </a>
              <a
                href={khlcContact.brochureUrl}
                download="Kingshouse-School-Partnership-Brochure.pdf"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-all hover:border-[#38e0ff] hover:text-[#38e0ff]"
              >
                <Download className="h-4 w-4" />
                <span>Download School Brochure (PDF)</span>
              </a>
            </div>
          </div>

          {/* Right: Multi-Path Interactive Enquiry Form */}
          <div className="rounded-3xl border border-[#3b00b3]/15 bg-white p-6 sm:p-8 shadow-[0_18px_45px_rgba(13,0,43,0.06)] lg:col-span-7">
            {/* 4 Dedicated Pathway Tabs */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {pathwayConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabSwitch(tab.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2.5 py-3 text-center transition-all ${
                      isActive
                        ? "border-[#3b00b3] bg-[#3b00b3] text-white shadow-md"
                        : "border-gray-200 bg-[#faf9ff] text-[#0d002b] hover:border-[#3b00b3]/35 hover:text-[#3b00b3]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-[#9dff13]" : "text-[#3b00b3]"
                      }`}
                    />
                    <span className="text-[11px] font-extrabold leading-tight">
                      {tab.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-extrabold text-[#0d002b]">
                {currentConfig.label}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {currentConfig.subtitle}
              </p>
            </div>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-lg font-extrabold text-[#0d002b]">
                  Your {currentConfig.label} Request Is Ready!
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
                  Thank you,{" "}
                  <strong className="text-[#0d002b]">{fullName}</strong>. Send
                  your enquiry directly to our business development team via
                  WhatsApp or Email for immediate response.
                </p>

                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <a
                    href={khlcContact.whatsappUrl(buildSummaryMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b00b3] px-5 py-3 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Send via WhatsApp Now</span>
                  </a>
                  <a
                    href={`mailto:${khlcContact.email}?subject=${encodeURIComponent(
                      `${currentConfig.label} — ${fullName}`
                    )}&body=${encodeURIComponent(buildSummaryMessage())}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3b00b3]/30 bg-white px-5 py-3 text-xs font-extrabold text-[#3b00b3] hover:bg-[#faf6ff] transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Send via Email</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-bold text-gray-500 underline hover:text-[#0d002b]"
                >
                  Edit enquiry details
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="khlc-name"
                      className="block text-xs font-bold text-[#0d002b]"
                    >
                      Full Name *
                    </label>
                    <input
                      id="khlc-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Mrs. Funke Adebayo"
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] placeholder-gray-400 focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="khlc-phone"
                      className="block text-xs font-bold text-[#0d002b]"
                    >
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      id="khlc-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g., 0803 123 4567"
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] placeholder-gray-400 focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="khlc-email"
                      className="block text-xs font-bold text-[#0d002b]"
                    >
                      Email Address *
                    </label>
                    <input
                      id="khlc-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@school.edu.ng"
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] placeholder-gray-400 focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="khlc-org"
                      className="block text-xs font-bold text-[#0d002b]"
                    >
                      {currentConfig.orgLabel} *
                    </label>
                    <input
                      id="khlc-org"
                      type="text"
                      required
                      value={orgDetail}
                      onChange={(e) => setOrgDetail(e.target.value)}
                      placeholder={currentConfig.orgPlaceholder}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] placeholder-gray-400 focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="khlc-focus"
                    className="block text-xs font-bold text-[#0d002b]"
                  >
                    {currentConfig.focusLabel}
                  </label>
                  <select
                    id="khlc-focus"
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  >
                    {currentConfig.focusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="khlc-msg"
                    className="block text-xs font-bold text-[#0d002b]"
                  >
                    Additional Details (Optional)
                  </label>
                  <textarea
                    id="khlc-msg"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your preferred start term, number of students, or questions..."
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#faf9ff] px-3.5 py-2.5 text-xs sm:text-sm text-[#0d002b] placeholder-gray-400 focus:border-[#3b00b3] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#3b00b3] px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(59,0,179,0.28)] transition-all hover:bg-[#9dff13] hover:text-[#0d002b]"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Enquiry</span>
                  </button>

                  <a
                    href={khlcContact.whatsappUrl(buildSummaryMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#3b00b3] hover:text-[#0d002b]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Or send directly on WhatsApp →</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
