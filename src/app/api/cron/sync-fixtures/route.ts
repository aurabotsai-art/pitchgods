import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getWcMatches,
  mapStatus,
  mapStage,
  groupLetter,
  flagSlugForName,
  type FDMatch,
} from "@/lib/footballdata";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function teamCode(t: FDMatch["homeTeam"]) {
  return t.tla || (t.id ? `FD${t.id}` : null);
}

export async function GET(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let matches: FDMatch[];
  try {
    matches = await getWcMatches();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }

  // only matches with both teams known (skip TBD knockout slots)
  const real = matches.filter((m) => m.homeTeam?.name && m.awayTeam?.name);

  const admin = createAdminClient();

  const teamMap = new Map<
    string,
    { code: string; name: string; flag_slug: string | null; logo: string | null }
  >();
  for (const m of real) {
    for (const t of [m.homeTeam, m.awayTeam]) {
      const code = teamCode(t);
      if (code && !teamMap.has(code))
        teamMap.set(code, {
          code,
          name: t.name!,
          flag_slug: flagSlugForName(t.name),
          logo: t.crest,
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

  const fixtureRows = real.map((m) => ({
    ext_id: m.id,
    stage: mapStage(m.stage),
    group_name: groupLetter(m.group),
    kickoff_at: m.utcDate,
    home_code: teamCode(m.homeTeam),
    away_code: teamCode(m.awayTeam),
    home_name: m.homeTeam.name!,
    away_name: m.awayTeam.name!,
    status: mapStatus(m.status),
    score_home: m.score.fullTime.home,
    score_away: m.score.fullTime.away,
    ht_home: m.score.halfTime.home,
    ht_away: m.score.halfTime.away,
    minute: m.minute,
  }));

  let upserted = 0;
  for (let i = 0; i < fixtureRows.length; i += 100) {
    const chunk = fixtureRows.slice(i, i + 100);
    const { error } = await admin
      .from("fixtures")
      .upsert(chunk, { onConflict: "ext_id" });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    upserted += chunk.length;
  }

  return NextResponse.json({
    ok: true,
    teams: teamRows.length,
    fixtures: upserted,
    skipped_tbd: matches.length - real.length,
  });
}
