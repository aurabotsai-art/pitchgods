import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { preconnect, prefetchDNS } from "react-dom";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchgods.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pitch Gods — Free Halal World Cup 2026 Prediction Game",
    template: "%s · Pitch Gods",
  },
  description:
    "The free, halal World Cup 2026 prediction game. Predict every match, climb the leaderboard, make a private league with your friends. No betting, no money — pure glory.",
  keywords: [
    "world cup predictor",
    "world cup 2026 predictions",
    "football prediction game",
    "soccer prediction game",
    "prediction league",
    "match prediction",
    "halal prediction game",
    "free football game",
    "pitch gods",
  ],
  applicationName: "Pitch Gods",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Pitch Gods" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Pitch Gods",
    url: SITE_URL,
    title: "Pitch Gods — Free Halal World Cup 2026 Prediction Game",
    description:
      "Predict every World Cup 2026 match, climb the leaderboard, make a private league with your crew. Free, halal, no betting.",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Pitch Gods" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pitch Gods — Free World Cup 2026 Prediction Game",
    description:
      "Out-predict your friends this World Cup. Free, halal, no betting. Pure glory.",
    images: ["/api/og"],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Pitch Gods",
      url: SITE_URL,
      logo: `${SITE_URL}/api/og`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Pitch Gods",
      description:
        "Free, halal World Cup 2026 football prediction game.",
      publisher: { "@id": `${SITE_URL}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/leaderboard?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
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
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
