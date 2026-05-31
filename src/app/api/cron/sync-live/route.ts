import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getLiveWcFixtures,
  getFixtureEvents,
  getFixtureById,
  mapStatus,
  eventText,
  type AFFixture,
  type AFEvent,
} from "@/lib/apifootball";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

type DbFix = { id: number; ext_id: number; status: string };

function eventKey(ev: AFEvent) {
  return [
    ev.type,
    ev.detail,
    ev.time.elapsed ?? 0,
    ev.time.extra ?? 0,
    ev.player?.name ?? "",
    ev.team?.id ?? "",
  ].join("|");
}

async function applyFixture(
  admin: ReturnType<typeof createAdminClient>,
  af: AFFixture,
  dbFix: DbFix,
) {
  const status = mapStatus(af.fixture.status.short);
  await admin
    .from("fixtures")
    .update({
      status,
      score_home: af.goals.home,
      score_away: af.goals.away,
      ht_home: af.score.halftime.home,
      ht_away: af.score.halftime.away,
      minute: af.fixture.status.elapsed,
    })
    .eq("id", dbFix.id);

  // ingest events as commentary (skip if pre-match)
  if (status !== "scheduled") {
    let events: AFEvent[] = [];
    try {
      events = await getFixtureEvents(af.fixture.id);
    } catch {
      events = [];
    }
    if (events.length > 0) {
      const rows = events.map((ev) => {
        const { type, text } = eventText(ev);
        return {
          fixture_id: dbFix.id,
          minute: ev.time.elapsed,
          type,
          team_code: ev.team?.id ? `AF${ev.team.id}` : null,
          player: ev.player?.name ?? null,
          detail: ev.detail,
          text,
          ext_key: eventKey(ev),
        };
      });
      await admin
        .from("match_events")
        .upsert(rows, { onConflict: "fixture_id,ext_key", ignoreDuplicates: true });
    }
  }
  return status;
}

export async function GET(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  let live: AFFixture[] = [];
  try {
    live = await getLiveWcFixtures();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
  const liveExtIds = new Set(live.map((f) => f.fixture.id));

  // our fixtures that are live OR that the API now reports live
  const { data: dbFixtures } = await admin
    .from("fixtures")
    .select("id, ext_id, status")
    .or(
      `status.eq.live,ext_id.in.(${[...liveExtIds].join(",") || "0"})`,
    );
  const byExt = new Map<number, DbFix>(
    (dbFixtures ?? []).map((d) => [d.ext_id as number, d as DbFix]),
  );

  let updated = 0;
  let finished = 0;

  // 1) update everything the API says is live
  for (const af of live) {
    const dbFix = byExt.get(af.fixture.id);
    if (!dbFix) continue; // fixture not in our DB yet (run sync-fixtures first)
    await applyFixture(admin, af, dbFix);
    updated++;
  }

  // 2) catch matches we think are live but API no longer lists (likely finished)
  const stuck = (dbFixtures ?? []).filter(
    (d) => d.status === "live" && !liveExtIds.has(d.ext_id as number),
  ) as DbFix[];
  for (const d of stuck) {
    try {
      const [af] = await getFixtureById(d.ext_id);
      if (af) {
        const st = await applyFixture(admin, af, d);
        if (st === "finished") finished++;
      }
    } catch {
      // ignore; retry next tick
    }
  }

  return NextResponse.json({ ok: true, updated, finished });
}
