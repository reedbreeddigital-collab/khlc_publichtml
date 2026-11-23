import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolve 8.0 | Compete. Build. Solve. — Kingshouse Learning Centre",
  description:
    "Register your school for Evolve 8.0 by Kingshouse Learning Centre. Free National Online ICT Test (Primary 4 to SS3) and Project Track in Coding, AI, and Robotics. Live finals at Skill Up Academy, Lagos with ₦500,000, ₦200,000 & ₦100,000 prizes.",
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
