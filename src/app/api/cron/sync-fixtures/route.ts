import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getWcFixtures,
  mapStatus,
  flagSlugForName,
  type AFFixture,
} from "@/lib/apifootball";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function stageFromRound(round: string): string {
  const r = round.toLowerCase();
  if (r.includes("group")) return "group";
  if (r.includes("16")) return "r16";
  if (r.includes("quarter")) return "qf";
  if (r.includes("semi")) return "sf";
  if (r.includes("3rd") || r.includes("third")) return "3rd";
  if (r.includes("final")) return "final";
  return "group";
}

export async function GET(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let fixtures: AFFixture[];
  try {
    fixtures = await getWcFixtures();
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 502 },
    );
  }

  const admin = createAdminClient();

  // de-dupe teams across fixtures
  const teamMap = new Map<
    number,
    { code: string; ext_id: number; name: string; flag_slug: string | null; logo: string }
  >();
  for (const f of fixtures) {
    for (const t of [f.teams.home, f.teams.away]) {
      if (!teamMap.has(t.id))
        teamMap.set(t.id, {
          code: `AF${t.id}`,
          ext_id: t.id,
          name: t.name,
          flag_slug: flagSlugForName(t.name),
          logo: t.logo,
        });
    }
  }

  const teamRows = [...teamMap.values()];
  if (teamRows.length > 0) {
    const { error } = await admin
      .from("teams")
      .upsert(teamRows, { onConflict: "code" });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const fixtureRows = fixtures.map((f) => ({
    ext_id: f.fixture.id,
    stage: stageFromRound(f.league.round),
    group_name: null as string | null,
    kickoff_at: f.fixture.date,
    home_code: `AF${f.teams.home.id}`,
    away_code: `AF${f.teams.away.id}`,
    home_name: f.teams.home.name,
    away_name: f.teams.away.name,
    status: mapStatus(f.fixture.status.short),
    score_home: f.goals.home,
    score_away: f.goals.away,
    ht_home: f.score.halftime.home,
    ht_away: f.score.halftime.away,
    minute: f.fixture.status.elapsed,
  }));

  let upserted = 0;
  // chunk to stay within payload limits
  for (let i = 0; i < fixtureRows.length; i += 100) {
    const chunk = fixtureRows.slice(i, i + 100);
    const { error } = await admin
      .from("fixtures")
      .upsert(chunk, { onConflict: "ext_id", ignoreDuplicates: false });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    upserted += chunk.length;
  }

  return NextResponse.json({
    ok: true,
    teams: teamRows.length,
    fixtures: upserted,
  });
}
