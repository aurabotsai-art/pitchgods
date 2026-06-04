import { unstable_cache } from "next/cache";
import { createPublicClient } from "./supabase/public";

export type Team = {
  code: string;
  name: string;
  flag: string | null;
  flag_slug: string | null;
  logo: string | null;
};

export type FixtureRow = {
  id: number;
  stage: string;
  group_name: string | null;
  kickoff_at: string;
  home_code: string | null;
  away_code: string | null;
  home_name: string;
  away_name: string;
  status: string;
  score_home: number | null;
  score_away: number | null;
  minute: number | null;
};

const FIXTURE_COLS =
  "id, stage, group_name, kickoff_at, home_code, away_code, home_name, away_name, status, score_home, score_away, minute";

// Teams change almost never -> cache long.
export const getTeams = unstable_cache(
  async (): Promise<Team[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("teams")
      .select("code, name, flag, flag_slug, logo");
    return (data ?? []) as Team[];
  },
  ["teams"],
  { revalidate: 3600, tags: ["teams"] },
);

export async function getTeamsMap(): Promise<Map<string, Team>> {
  const teams = await getTeams();
  return new Map(teams.map((t) => [t.code, t]));
}

// Fixtures list — short revalidate so live scores surface quickly.
export const getFixtures = unstable_cache(
  async (): Promise<FixtureRow[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("fixtures")
      .select(FIXTURE_COLS)
      .order("kickoff_at", { ascending: true });
    return (data ?? []) as FixtureRow[];
  },
  ["fixtures-list"],
  { revalidate: 30, tags: ["fixtures"] },
);

export function getFixture(id: number): Promise<FixtureRow | null> {
  return unstable_cache(
    async (): Promise<FixtureRow | null> => {
      const sb = createPublicClient();
      const { data } = await sb
        .from("fixtures")
        .select(FIXTURE_COLS + ", resolved")
        .eq("id", id)
        .maybeSingle();
      return (data as FixtureRow | null) ?? null;
    },
    ["fixture", String(id)],
    { revalidate: 30, tags: ["fixtures", `fixture-${id}`] },
  )();
}

export type LbEntry = {
  id: string;
  username: string | null;
  glory: number;
  level: number;
  flag_country: string | null;
  name_color: string | null;
  flair: string | null;
};

export type Chaos = {
  id: number;
  multiplier: number;
  title: string | null;
  ends_at: string;
  sponsor_name: string | null;
};

export const getActiveChaos = unstable_cache(
  async (): Promise<Chaos | null> => {
    const sb = createPublicClient();
    const nowIso = new Date().toISOString();
    const { data } = await sb
      .from("events")
      .select("id, multiplier, title, ends_at, sponsor_name")
      .eq("type", "chaos_hour")
      .lte("starts_at", nowIso)
      .gte("ends_at", nowIso)
      .order("multiplier", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data as Chaos | null) ?? null;
  },
  ["active-chaos"],
  { revalidate: 15, tags: ["events"] },
);

export type HotTake = { id: number; question: string; yes: number; no: number };

export const getActiveHotTake = unstable_cache(
  async (): Promise<HotTake | null> => {
    const sb = createPublicClient();
    const { data: ht } = await sb
      .from("hot_takes")
      .select("id, question")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!ht) return null;
    const { data: votes } = await sb
      .from("hot_take_votes")
      .select("vote")
      .eq("hot_take_id", ht.id);
    const yes = (votes ?? []).filter((v) => v.vote).length;
    const no = (votes ?? []).filter((v) => !v.vote).length;
    return { id: ht.id, question: ht.question, yes, no };
  },
  ["active-hot-take"],
  { revalidate: 15, tags: ["hot-takes"] },
);

export type CountryRow = { code: string; glory: number; players: number };

export const getCountryLeaderboard = unstable_cache(
  async (): Promise<CountryRow[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("profiles")
      .select("flag_country, glory")
      .not("flag_country", "is", null);
    const map = new Map<string, { glory: number; players: number }>();
    for (const r of data ?? []) {
      const c = r.flag_country as string;
      if (!c) continue;
      const e = map.get(c) ?? { glory: 0, players: 0 };
      e.glory += (r.glory as number) ?? 0;
      e.players += 1;
      map.set(c, e);
    }
    return [...map.entries()]
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => b.glory - a.glory)
      .slice(0, 50);
  },
  ["country-leaderboard"],
  { revalidate: 30, tags: ["leaderboard"] },
);

export type Sponsor = {
  id: number;
  name: string;
  slot: string;
  logo_url: string | null;
  link_url: string | null;
  blurb: string | null;
};

export function getSponsor(slot: string): Promise<Sponsor | null> {
  return unstable_cache(
    async (): Promise<Sponsor | null> => {
      const sb = createPublicClient();
      const { data } = await sb
        .from("sponsors")
        .select("id, name, slot, logo_url, link_url, blurb")
        .eq("slot", slot)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data as Sponsor | null) ?? null;
    },
    ["sponsor", slot],
    { revalidate: 60, tags: ["sponsors"] },
  )();
}

export const getGlobalLeaderboard = unstable_cache(
  async (): Promise<LbEntry[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("profiles")
      .select("id, username, glory, level, flag_country, name_color, flair")
      .order("glory", { ascending: false })
      .limit(50);
    return (data ?? []) as LbEntry[];
  },
  ["global-leaderboard"],
  { revalidate: 20, tags: ["leaderboard"] },
);
