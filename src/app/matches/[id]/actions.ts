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

  const { error } = await supabase
    .from("predictions")
    .upsert(rows, { onConflict: "user_id,fixture_id,type_key" });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/matches/${fixtureId}`);
  return { ok: true };
}
