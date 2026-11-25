import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolve 8.0 Official National Results & Rankings | Kingshouse Learning Centre",
  description:
    "View official Evolve 8.0 Phase 1 National Online General Test rankings, top 3 podiums, and individual candidate results across Junior, Intermediate, and Senior levels.",
};

export default function EvolveResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
