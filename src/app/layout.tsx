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
  title: "LabVerse | Universal Virtual Science & Engineering Laboratory",
  description: "Interactive browser-based virtual laboratory spanning Physics, Chemistry, Electronics, Mechanics, Quantum, Nuclear, Biology, and Finance with real-time simulations, fault injection, AI tutoring, and certified lab reports.",
  keywords: ["LabVerse", "Virtual Laboratory", "Physics Simulation", "Chemistry Lab", "Electronics", "Quantum Mechanics", "Antenna Design", "Gel Electrophoresis", "Rutherford Scattering", "AI Tutor", "STEM Education"],
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
