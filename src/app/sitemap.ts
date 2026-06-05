import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchgods.com";

export const revalidate = 3600; // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // static public surfaces
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/matches`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/hall`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/leagues`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/parties`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE}/parades`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // dynamic: every real WC2026 fixture -> "{Home} vs {Away} prediction" page
  let matchRoutes: MetadataRoute.Sitemap = [];
  try {
    const sb = createPublicClient();
    const { data } = await sb
      .from("fixtures")
      .select("id, kickoff_at")
      .order("kickoff_at", { ascending: true })
      .limit(200);
    matchRoutes = (data ?? []).map((f) => ({
      url: `${SITE}/matches/${f.id}`,
      lastModified: f.kickoff_at ? new Date(f.kickoff_at as string) : now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch {
    // fall back to static-only if the read fails
  }

  return [...staticRoutes, ...matchRoutes];
}
