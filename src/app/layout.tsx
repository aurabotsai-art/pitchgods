import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { preconnect, prefetchDNS } from "react-dom";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// display face for headlines + the wordmark — confident, geometric, premium
const display = Space_Grotesk({
  variable: "--font-display",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchperfect-sooty.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PITCH GODS — out-predict your friends",
  description:
    "The free, real-time World Cup 2026 prediction game. Out-predict your friends, climb from nobody to legend. No money, pure glory.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Pitch Gods" },
};

export const viewport: Viewport = {
  themeColor: "#0a0e0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // warm up the connections we hit on first paint
  preconnect(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  preconnect("https://flagcdn.com");
  prefetchDNS("https://flagcdn.com");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
