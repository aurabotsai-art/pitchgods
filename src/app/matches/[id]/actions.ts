"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PickInput = {
  result?: "home" | "draw" | "away";
  exact_home?: number | null;
  exact_away?: number | null;
  btts?: "yes" | "no";
  total_goals?: "0-1" | "2-3" | "4+";
  first_scorer?: string;
  bold_call?: string;
};

type Row = { user_id: string; fixture_id: number; type_key: string; payload: unknown };

export async function savePredictions(fixtureId: number, picks: PickInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: fixture } = await supabase
    .from("fixtures")
    .select("kickoff_at")
    .eq("id", fixtureId)
    .single();
  if (!fixture) return { ok: false, error: "Match not found." };
  if (new Date(fixture.kickoff_at).getTime() <= Date.now())
    return { ok: false, error: "Locked — this match has kicked off." };

  const rows: Row[] = [];
  const base = { user_id: user.id, fixture_id: fixtureId };

  if (picks.result && ["home", "draw", "away"].includes(picks.result))
    rows.push({ ...base, type_key: "result", payload: { pick: picks.result } });

  if (
    picks.exact_home != null &&
    picks.exact_away != null &&
    Number.isInteger(picks.exact_home) &&
    Number.isInteger(picks.exact_away) &&
    picks.exact_home >= 0 &&
    picks.exact_away >= 0 &&
    picks.exact_home <= 20 &&
    picks.exact_away <= 20
  )
    rows.push({
      ...base,
      type_key: "exact_score",
      payload: { home: picks.exact_home, away: picks.exact_away },
    });

  if (picks.btts && ["yes", "no"].includes(picks.btts))
    rows.push({ ...base, type_key: "btts", payload: { pick: picks.btts } });

  if (picks.total_goals && ["0-1", "2-3", "4+"].includes(picks.total_goals))
    rows.push({
      ...base,
      type_key: "total_goals",
      payload: { bucket: picks.total_goals },
    });

  const scorer = picks.first_scorer?.trim().slice(0, 40);
  if (scorer)
    rows.push({ ...base, type_key: "first_scorer", payload: { player: scorer } });

  const bold = picks.bold_call?.trim().slice(0, 120);
  if (bold)
    rows.push({ ...base, type_key: "bold_call", payload: { text: bold } });

  if (rows.length === 0) return { ok: false, error: "Make at least one pick." };

  // Split into inserts (new pick types) and payload-only updates (existing ones).
  // We intentionally avoid upsert: it requires table-wide UPDATE, but clients are
  // only granted UPDATE on `payload` so they can't tamper with points/resolution.
  const { data: existingRows } = await supabase
    .from("predictions")
    .select("type_key")
    .eq("user_id", user.id)
    .eq("fixture_id", fixtureId);
  const existingKeys = new Set((existingRows ?? []).map((r) => r.type_key));

  const toInsert = rows.filter((r) => !existingKeys.has(r.type_key));
  const toUpdate = rows.filter((r) => existingKeys.has(r.type_key));

  if (toInsert.length > 0) {
    const { error } = await supabase.from("predictions").insert(toInsert);
    if (error) return { ok: false, error: error.message };
  }
  for (const r of toUpdate) {
    const { error } = await supabase
      .from("predictions")
      .update({ payload: r.payload })
      .eq("user_id", user.id)
      .eq("fixture_id", fixtureId)
      .eq("type_key", r.type_key);
    if (error) return { ok: false, error: error.message };
  }

  // Keep the daily play streak alive (server-side; clients can't write it).
  await supabase.rpc("touch_streak");

  revalidatePath(`/matches/${fixtureId}`);
  revalidatePath("/home");
  return { ok: true };
}
