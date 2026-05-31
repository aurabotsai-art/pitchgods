// API-Football (api-sports.io) client + mapping helpers.
// World Cup league id = 1. Configure season via env (default 2026).

const BASE = "https://v3.football.api-sports.io";
export const WC_LEAGUE = 1;
export const WC_SEASON = Number(process.env.API_FOOTBALL_SEASON ?? "2026");

function key() {
  const k = process.env.API_FOOTBALL_KEY;
  if (!k) throw new Error("API_FOOTBALL_KEY is not set");
  return k;
}

async function af<T = unknown>(
  path: string,
  params: Record<string, string | number>,
): Promise<T[]> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  );
  const res = await fetch(`${BASE}${path}?${qs}`, {
    headers: { "x-apisports-key": key() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API-Football ${path} -> ${res.status}`);
  const json = (await res.json()) as { response?: T[]; errors?: unknown };
  return json.response ?? [];
}

export type AFFixture = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
  };
  league: { round: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  score: { halftime: { home: number | null; away: number | null } };
};

export type AFEvent = {
  time: { elapsed: number | null; extra: number | null };
  team: { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { name: string | null };
  type: string;
  detail: string;
  comments: string | null;
};

export const getWcFixtures = () =>
  af<AFFixture>("/fixtures", { league: WC_LEAGUE, season: WC_SEASON });

export const getLiveWcFixtures = () =>
  af<AFFixture>("/fixtures", { league: WC_LEAGUE, season: WC_SEASON, live: "all" });

export const getFixtureEvents = (extFixtureId: number) =>
  af<AFEvent>("/fixtures/events", { fixture: extFixtureId });

export const getFixtureById = (extFixtureId: number) =>
  af<AFFixture>("/fixtures", { id: extFixtureId });

// status mapping: API-Football short -> our status
export function mapStatus(short: string): "scheduled" | "live" | "finished" {
  if (["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"].includes(short))
    return "live";
  if (["FT", "AET", "PEN"].includes(short)) return "finished";
  return "scheduled";
}

// Country / team name -> flagcdn slug (best effort; falls back to crest logo).
const NAME_TO_SLUG: Record<string, string> = {
  argentina: "ar", brazil: "br", france: "fr", england: "gb-eng",
  scotland: "gb-sct", wales: "gb-wls", spain: "es", germany: "de",
  portugal: "pt", netherlands: "nl", belgium: "be", croatia: "hr",
  morocco: "ma", japan: "jp", "south korea": "kr", korea: "kr",
  "united states": "us", usa: "us", mexico: "mx", canada: "ca",
  uruguay: "uy", colombia: "co", ecuador: "ec", senegal: "sn",
  switzerland: "ch", denmark: "dk", italy: "it", poland: "pl",
  serbia: "rs", ghana: "gh", nigeria: "ng", cameroon: "cm",
  "ivory coast": "ci", "cote d'ivoire": "ci", tunisia: "tn", algeria: "dz",
  egypt: "eg", australia: "au", "saudi arabia": "sa", qatar: "qa",
  iran: "ir", "costa rica": "cr", panama: "pa", "new zealand": "nz",
  ukraine: "ua", austria: "at", turkey: "tr", "turkiye": "tr",
  norway: "no", sweden: "se", greece: "gr", peru: "pe", chile: "cl",
  paraguay: "py", "united arab emirates": "ae", iraq: "iq", oman: "om",
  jordan: "jo", "south africa": "za", mali: "ml", "cape verde": "cv",
  "south sudan": "ss", uzbekistan: "uz",
};

export function flagSlugForName(name: string): string | null {
  return NAME_TO_SLUG[name.trim().toLowerCase()] ?? null;
}

// Synthesize a commentary line from an event.
export function eventText(ev: AFEvent): { type: string; text: string } {
  const min = ev.time.elapsed ?? 0;
  const extra = ev.time.extra ? `+${ev.time.extra}` : "";
  const t = `${min}${extra}'`;
  const team = ev.team?.name ?? "";
  const player = ev.player?.name ?? "";
  const type = ev.type?.toLowerCase() ?? "";

  if (type === "goal") {
    if (ev.detail === "Missed Penalty")
      return { type: "var", text: `${t} PENALTY MISSED — ${player} (${team})` };
    const assist = ev.assist?.name ? ` (assist ${ev.assist.name})` : "";
    return { type: "goal", text: `⚽ GOAL ${t} — ${player}${assist} for ${team}` };
  }
  if (type === "card") {
    const card = ev.detail?.includes("Red") ? "🟥 RED" : "🟨";
    return { type: "card", text: `${card} ${t} — ${player} (${team})` };
  }
  if (type === "subst")
    return { type: "subst", text: `🔁 ${t} — Sub for ${team}: ${player}` };
  if (type === "var")
    return { type: "var", text: `📺 VAR ${t} — ${ev.detail} (${team})` };
  return { type: "comment", text: `${t} — ${ev.detail} (${team})` };
}
