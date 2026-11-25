import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolve 8.0 Project Track Portal | Proposal & 3-Min Video Submission",
  description:
    "Submit your school's 6-section Evolve 8.0 Project Track proposal (300-word Primary / 500-word Secondary), upload your 3-minute demo video link, and view instructor feedback.",
};

export default function EvolveProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
