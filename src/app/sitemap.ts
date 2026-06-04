import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchgods.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // public, shareable surfaces worth indexing
  const routes = [
    "",
    "/matches",
    "/leaderboard",
    "/hall",
    "/leagues",
    "/parties",
    "/parades",
    "/privacy",
    "/terms",
  ];
  return routes.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));
}
