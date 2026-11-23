import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "Kingshouse Learning Centre | Building Tomorrow's Innovators Through Technology Education",
  description:
    "Kingshouse Learning Centre is a trusted EdTech partner in Lagos delivering structured ICT Education, Coding, Robotics, Artificial Intelligence, Teacher Training, and School Technology Programs for schools, learners, and institutional partners.",
  keywords: [
    "Kingshouse Learning Centre",
    "EdTech Nigeria",
    "School ICT Programs Lagos",
    "Coding and Robotics for Schools",
    "Evolve ICT Competition",
    "AI Education for Kids Lagos",
    "Teacher Technology Training Nigeria",
    "Amuwo Odofin ICT Centre",
  ],
  openGraph: {
    title:
      "Kingshouse Learning Centre | Building Tomorrow's Innovators Through Technology Education",
    description:
      "Trusted EdTech partner delivering structured, practical ICT, Coding, Robotics, AI, and Teacher Training programs to schools and learners.",
    type: "website",
    locale: "en_NG",
    siteName: "Kingshouse Learning Centre",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
