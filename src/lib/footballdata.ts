// football-data.org v4 client + mapping. Real WC2026 data on the free tier.
// Header: X-Auth-Token. Free tier ~10 req/min — fetch lists in one call.

const BASE = "https://api.football-data.org/v4";

function token() {
  const t = process.env.FOOTBALL_DATA_TOKEN;
  if (!t) throw new Error("FOOTBALL_DATA_TOKEN is not set");
  return t;
}

export type FDTeam = {
  id: number | null;
  name: string | null;
  tla: string | null;
  crest: string | null;
};
export type FDMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  matchday: number | null;
  minute: number | null;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
};

async function fd(path: string): Promise<{ matches: FDMatch[] }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Auth-Token": token() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`football-data ${path} -> ${res.status}`);
  return (await res.json()) as { matches: FDMatch[] };
}

export async function getWcMatches(): Promise<FDMatch[]> {
  return (await fd("/competitions/WC/matches")).matches ?? [];
}

export async function getLiveWcMatches(): Promise<FDMatch[]> {
  // IN_PLAY + PAUSED = currently live
  return (await fd("/competitions/WC/matches?status=IN_PLAY,PAUSED")).matches ?? [];
}

export function mapStatus(s: string): "scheduled" | "live" | "finished" {
  if (["IN_PLAY", "PAUSED", "LIVE"].includes(s)) return "live";
  if (["FINISHED", "AWARDED"].includes(s)) return "finished";
  return "scheduled";
}

export function mapStage(stage: string): string {
  const s = (stage || "").toUpperCase();
  if (s.includes("GROUP")) return "group";
  if (s.includes("LAST_16") || s.includes("ROUND_OF_16")) return "r16";
  if (s.includes("QUARTER")) return "qf";
  if (s.includes("SEMI")) return "sf";
  if (s.includes("THIRD")) return "3rd";
  if (s.includes("FINAL")) return "final";
  return "group";
}

export function groupLetter(g: string | null): string | null {
  if (!g) return null;
  const m = g.match(/GROUP[_ ]?([A-L])/i);
  return m ? m[1].toUpperCase() : null;
}

const NAME_TO_SLUG: Record<string, string> = {
  argentina: "ar", brazil: "br", france: "fr", england: "gb-eng",
  scotland: "gb-sct", wales: "gb-wls", spain: "es", germany: "de",
  portugal: "pt", netherlands: "nl", belgium: "be", croatia: "hr",
  morocco: "ma", japan: "jp", "south korea": "kr", "korea republic": "kr",
  "united states": "us", usa: "us", mexico: "mx", canada: "ca",
  uruguay: "uy", colombia: "co", ecuador: "ec", senegal: "sn",
  switzerland: "ch", denmark: "dk", italy: "it", poland: "pl",
  serbia: "rs", ghana: "gh", nigeria: "ng", cameroon: "cm",
  "ivory coast": "ci", "cote d'ivoire": "ci", tunisia: "tn", algeria: "dz",
  egypt: "eg", australia: "au", "saudi arabia": "sa", qatar: "qa",
  iran: "ir", "ir iran": "ir", "costa rica": "cr", panama: "pa",
  "new zealand": "nz", ukraine: "ua", austria: "at", turkey: "tr",
  "turkiye": "tr", norway: "no", sweden: "se", greece: "gr", peru: "pe",
  chile: "cl", paraguay: "py", "united arab emirates": "ae", iraq: "iq",
  oman: "om", jordan: "jo", "south africa": "za", mali: "ml",
  "cape verde": "cv", "south sudan": "ss", uzbekistan: "uz", curacao: "cw",
  haiti: "ht", "new caledonia": "nc", honduras: "hn", "el salvador": "sv",
  jamaica: "jm", angola: "ao", venezuela: "ve", bolivia: "bo",
};

export function flagSlugForName(name: string | null): string | null {
  if (!name) return null;
  return NAME_TO_SLUG[name.trim().toLowerCase()] ?? null;
}
