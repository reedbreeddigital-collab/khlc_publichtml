import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolve 8.0 | Compete. Build. Solve. — Kingshouse Learning Centre",
  description:
    "Register your school for Evolve 8.0 by Kingshouse Learning Centre. National Online General Test (Primary 4 to SS3) and Project Track in Coding, AI, and Robotics, leading to live grand finals in Lagos with ₦300,000, ₦200,000 & ₦100,000 in prizes plus 4th & 5th place consolation prizes.",
  openGraph: {
    title: "Evolve 8.0 | Compete. Build. Solve. — Kingshouse Learning Centre",
    description:
      "National Online ICT Test + Coding, AI & Robotics Project Track for Primary and Secondary schools.",
    type: "website",
    locale: "en_NG",
  },
};

export default function EvolveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
