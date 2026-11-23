"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  ArrowRight,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  resourceArticles,
  type ResourceArticle,
  type EnquiryPathwayId,
} from "@/data/khlc";

interface ArticlesSectionProps {
  onSelectPathway?: (pathway: EnquiryPathwayId, context?: string) => void;
}

const riseUp = {
  hidden: { opacity: 0, y: 36 },
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

export default function ArticlesSection({
  onSelectPathway,
}: ArticlesSectionProps) {
  const [activeArticle, setActiveArticle] = useState<ResourceArticle | null>(
    null
  );

  return (
    <section
      id="resources"
      className="relative overflow-hidden bg-white pt-20 pb-24 lg:pt-24 lg:pb-28"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Bottom-Left Dotted Decorative Matrix */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -left-8 z-0 hidden sm:block"
        >
          <div className="relative h-32 w-36">
            <div className="absolute -top-4 right-0 h-28 w-28 rounded-full bg-[#38e0ff]/12" />
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

        {/* Header Row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
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
                NEWS &amp; RESOURCES
              </span>
            </motion.div>

            <motion.h2
              variants={riseUp}
              custom={0.1}
              className="text-3xl font-extrabold leading-tight tracking-tight text-[#0d002b] sm:text-4xl"
            >
              EdTech Insights, Event Recaps &amp;{" "}
              <span className="text-[#3b00b3]">School Guides</span>
            </motion.h2>
          </div>

          <motion.div variants={riseUp} custom={0.18}>
            <a
              href="#contact"
              onClick={(e) => {
                if (onSelectPathway) {
                  e.preventDefault();
                  onSelectPathway("schools", "Request Curriculum Brochure");
                }
              }}
              className="group inline-flex items-center gap-2 rounded-lg bg-[#3b00b3] px-5 py-3 text-xs font-bold text-white shadow-[0_8px_20px_rgba(59,0,179,0.22)] transition-all duration-200 hover:bg-[#9dff13] hover:text-[#0d002b]"
            >
              <span>Request School Curriculum Pack</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </motion.div>

        {/* 3-Column Resource Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="relative z-10 mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {resourceArticles.map((article, idx) => (
            <motion.article
              key={article.id}
              variants={riseUp}
              custom={0.1 * idx}
              className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_10px_35px_rgba(13,0,43,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3b00b3]/20 hover:shadow-[0_18px_40px_rgba(59,0,179,0.09)]"
            >
              <div>
                <div className="relative aspect-[16/10.5] w-full overflow-hidden rounded-xl bg-[#100038]">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-[#3b00b3] px-2.5 py-1 text-[10px] font-extrabold text-white">
                    {article.category}
                  </span>
                </div>

                {/* Meta Row */}
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#3b00b3]" />
                    <span>{article.date}</span>
                  </span>
                  <span className="h-3.5 w-[1px] bg-gray-200" />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{article.readTime}</span>
                  </span>
                </div>

                <h3 className="mt-3 text-base font-extrabold leading-snug text-[#0d002b] transition-colors group-hover:text-[#3b00b3]">
                  <button
                    type="button"
                    onClick={() => setActiveArticle(article)}
                    className="text-left"
                  >
                    {article.title}
                  </button>
                </h3>

                <p className="mt-2.5 text-xs leading-relaxed text-gray-600">
                  {article.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveArticle(article)}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0d002b] transition-colors group-hover:text-[#3b00b3]"
                >
                  <span>Read Full Brief</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* Interactive Article Reader Modal */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveArticle(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d002b]/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                aria-label="Close article"
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[#0d002b] hover:bg-[#3b00b3] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="inline-block rounded-full bg-[#3b00b3]/10 px-3 py-1 text-[11px] font-extrabold text-[#3b00b3]">
                {activeArticle.category} · {activeArticle.date}
              </span>

              <h3 className="mt-3 pr-8 text-xl sm:text-2xl font-extrabold leading-snug text-[#0d002b]">
                {activeArticle.title}
              </h3>

              <div className="mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#100038]">
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="h-full w-full object-cover object-top"
                />
              </div>

              <div className="mt-5 rounded-xl bg-[#faf6ff] p-4 border border-[#3b00b3]/15">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#3b00b3]">
                  Key Takeaways
                </p>
                <ul className="mt-2.5 space-y-2">
                  {activeArticle.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-xs font-medium text-[#0d002b]"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3b00b3]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 space-y-3 text-sm leading-relaxed text-gray-600">
                {activeArticle.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="text-xs font-bold text-gray-500 hover:text-[#0d002b]"
                >
                  Close Brief
                </button>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    const title = activeArticle.title;
                    setActiveArticle(null);
                    if (onSelectPathway) {
                      onSelectPathway("schools", `Enquiry via: ${title}`);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#3b00b3] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#9dff13] hover:text-[#0d002b] transition-colors"
                >
                  <span>Discuss This With Kingshouse</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
