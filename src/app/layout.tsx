import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { APIUsageIndicator } from "@/components/APIUsageIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthBridge - Accessible Healthcare Communication",
  description: "Real-time healthcare communication assistant for Deaf and Hard-of-Hearing patients. Features live captions, medical term simplification, and video consultations.",
  keywords: ["healthcare", "accessibility", "DHH", "deaf", "hard of hearing", "telehealth", "medical communication"],
  openGraph: {
    title: "HealthBridge - Accessible Healthcare Communication",
    description: "Empowering Deaf and Hard-of-Hearing patients with real-time captioning and medical term clarification.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HealthBridge",
    description: "Accessible healthcare communication for DHH patients",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <APIUsageIndicator />
      </body>
    </html>
  );
}
