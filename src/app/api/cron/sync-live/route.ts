import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWcMatches, mapStatus, type FDMatch } from "@/lib/footballdata";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

type DbFix = {
  id: number;
  ext_id: number;
  status: string;
  score_home: number | null;
  score_away: number | null;
  home_code: string | null;
  away_code: string | null;
  resolved: boolean;
};

export async function GET(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  let matches: FDMatch[];
  try {
    matches = await getWcMatches();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
  const byExt = new Map(matches.map((m) => [m.id, m]));

  const { data: dbFixtures } = await admin
    .from("fixtures")
    .select("id, ext_id, status, score_home, score_away, home_code, away_code, resolved")
    .not("ext_id", "is", null)
    .eq("resolved", false);

  let updated = 0;
  let goals = 0;

  for (const f of (dbFixtures ?? []) as DbFix[]) {
    const m = byExt.get(f.ext_id);
    if (!m) continue;
    const status = mapStatus(m.status);
    const nh = m.score.fullTime.home ?? f.score_home ?? 0;
    const na = m.score.fullTime.away ?? f.score_away ?? 0;
    const oh = f.score_home ?? 0;
    const oa = f.score_away ?? 0;

    const changed =
      status !== f.status || nh !== oh || na !== oa;
    if (!changed) continue;

    // synthesize goal events from score deltas (free tier has no scorer)
    const events: {
      fixture_id: number;
      minute: number | null;
      type: string;
      team_code: string | null;
      text: string;
      ext_key: string;
    }[] = [];
    for (let g = oh + 1; g <= nh; g++)
      events.push({
        fixture_id: f.id,
        minute: m.minute ?? null,
        type: "goal",
        team_code: f.home_code,
        text: `⚽ GOAL — home side! (${g}–${na})`,
        ext_key: `g-home-${g}`,
      });
    for (let g = oa + 1; g <= na; g++)
      events.push({
        fixture_id: f.id,
        minute: m.minute ?? null,
        type: "goal",
        team_code: f.away_code,
        text: `⚽ GOAL — away side! (${nh}–${g})`,
        ext_key: `g-away-${g}`,
      });
    if (events.length > 0) {
      await admin
        .from("match_events")
        .upsert(events, { onConflict: "fixture_id,ext_key", ignoreDuplicates: true });
      goals += events.length;
    }

    await admin
      .from("fixtures")
      .update({
        status,
        score_home: nh,
        score_away: na,
        ht_home: m.score.halfTime.home,
        ht_away: m.score.halfTime.away,
        minute: m.minute,
      })
      .eq("id", f.id);
    updated++;
  }

  return NextResponse.json({ ok: true, updated, goals });
}
