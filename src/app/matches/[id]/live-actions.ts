"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveLivePrediction(
  fixtureId: number,
  pick: "home" | "away" | "none",
) {
  if (!["home", "away", "none"].includes(pick))
    return { ok: false, error: "Invalid pick." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to play live." };

  const { error } = await supabase.from("live_predictions").insert({
    user_id: user.id,
    fixture_id: fixtureId,
    kind: "next_goal",
    payload: { pick },
  });

  if (error) {
    // unique partial index => one open pick at a time
    if (error.code === "23505")
      return { ok: false, error: "You've already called the next goal." };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
