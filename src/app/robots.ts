import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchgods.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // don't index API routes, auth callback, or per-user app screens
      disallow: ["/api/", "/auth/", "/home", "/shop", "/agent", "/predict"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
