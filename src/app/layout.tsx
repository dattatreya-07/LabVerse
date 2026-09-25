import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LabVerse | AI-Guided Virtual Physics & Electronics Laboratory",
  description: "Interactive browser-based Ohm's Law virtual laboratory with real-time physical simulation, fault injection, RAG AI tutoring, and PDF report export.",
  keywords: ["LabVerse", "Virtual Laboratory", "Ohm's Law", "Electronics", "Physics Simulation", "AI Tutor", "RAG"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col transition-colors duration-200">{children}</body>
    </html>
  );
}
