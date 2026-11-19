import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduStary | Upgrade Your Skills, Shape Your Future",
  description:
    "Gain practical experience with real-world projects that prepare you for the challenges of today's fast-changing job market.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
