import type { Metadata } from "next";
import AdminProvider from "@/components/admin/AdminProvider";

export const metadata: Metadata = {
  title: "Admin Console & CRM | Kingshouse Learning Centre",
  description:
    "Internal Kingshouse Learning Centre admin dashboard for managing Evolve 8.0 quizzes, question bank, student roster, project judging, CRM pipeline, and enquiries.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProvider>{children}</AdminProvider>;
}
