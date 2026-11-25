import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolve 8.0 Online Test Portal | Kingshouse Learning Centre",
  description:
    "Candidate login and timed National Online General Test portal for Evolve 8.0 (Junior, Intermediate, and Senior levels).",
};

export default function EvolveQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
