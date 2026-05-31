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
};

export const getGlobalLeaderboard = unstable_cache(
  async (): Promise<LbEntry[]> => {
    const sb = createPublicClient();
    const { data } = await sb
      .from("profiles")
      .select("id, username, glory, level, flag_country")
      .order("glory", { ascending: false })
      .limit(50);
    return (data ?? []) as LbEntry[];
  },
  ["global-leaderboard"],
  { revalidate: 20, tags: ["leaderboard"] },
);
