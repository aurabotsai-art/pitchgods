"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createLeague(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("create_league", { p_name: name });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/leagues");
  return data as { ok: boolean; id?: number; code?: string; error?: string };
}

export async function joinLeague(code: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("join_league", { p_code: code });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/leagues");
  return data as { ok: boolean; id?: number; name?: string; error?: string };
}

export async function leaveLeague(leagueId: number) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_league", { p_league: leagueId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/leagues");
  return { ok: true };
}
