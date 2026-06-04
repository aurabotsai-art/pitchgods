import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pitch Gods",
    short_name: "Pitch Gods",
    description:
      "The free World Cup 2026 prediction game. Out-predict your friends, climb to legend.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e0a",
    theme_color: "#0a0e0a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
