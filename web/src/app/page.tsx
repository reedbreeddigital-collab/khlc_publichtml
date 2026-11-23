"use client";

import React, { useState, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CategoriesSection from "@/components/CategoriesSection";
import PopularCoursesSection from "@/components/PopularCoursesSection";
import CampusSection from "@/components/CampusSection";
import ProjectsEventsSection from "@/components/ProjectsEventsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ArticlesSection from "@/components/ArticlesSection";
import VideoContactSection from "@/components/VideoContactSection";
import FooterSection from "@/components/FooterSection";
import type { EnquiryPathwayId } from "@/data/khlc";

export default function Home() {
  const [selectedPathway, setSelectedPathway] =
    useState<EnquiryPathwayId>("schools");
  const [selectedContext, setSelectedContext] = useState<string>("");

  const handleSelectPathway = useCallback(
    (pathway: EnquiryPathwayId, context?: string) => {
      setSelectedPathway(pathway);
      setSelectedContext(context || "");
      const contactEl = document.getElementById("contact");
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: "smooth" });
      }
    },
    []
  );

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <HeroSection onSelectPathway={handleSelectPathway} />

      {/* 2. About Kingshouse */}
      <AboutSection onSelectPathway={handleSelectPathway} />

      {/* 3. Target Audience Segmentation (For Schools, Parents, Individuals, Institutional Partners) */}
      <CategoriesSection onSelectPathway={handleSelectPathway} />

      {/* 4. Our Programs & Services (ICT, Coding, Robotics, AI, Teacher Training, School Tech Programs) */}
      <PopularCoursesSection onSelectPathway={handleSelectPathway} />

      {/* 5. Why Kingshouse? & Our Impact */}
      <CampusSection onSelectPathway={handleSelectPathway} />

      {/* 6. Projects & Events (Evolve ICT Competition, School Engagements, Exhibitions) */}
      <ProjectsEventsSection onSelectPathway={handleSelectPathway} />

      {/* 7. Stakeholder Testimonials */}
      <TestimonialsSection />

      {/* 8. News & Resources */}
      <ArticlesSection onSelectPathway={handleSelectPathway} />

      {/* 9. Partnership Call to Action & Multi-Path Enquiry Hub + WhatsApp */}
      <VideoContactSection
        selectedPathway={selectedPathway}
        selectedContext={selectedContext}
        onPathwayChange={setSelectedPathway}
      />

      {/* Footer & Persistent WhatsApp Quick-Connect */}
      <FooterSection onSelectPathway={handleSelectPathway} />
    </main>
  );
}
