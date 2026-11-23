import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console & CRM | Kingshouse Learning Centre",
  description:
    "Internal Kingshouse Learning Centre admin dashboard for managing school partnerships, CRM pipeline, enquiries, and Evolve 8.0 registrations.",
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
  return <>{children}</>;
}
