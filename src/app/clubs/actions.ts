"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createClub(input: {
  name: string;
  crest: string;
  motto: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("create_club", {
    p_name: input.name,
    p_crest: input.crest,
    p_motto: input.motto,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clubs");
  return data as { ok: boolean; id?: number; code?: string; error?: string };
}

export async function joinClub(code: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("join_club", { p_code: code });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clubs");
  return data as { ok: boolean; id?: number; name?: string; error?: string };
}

export async function leaveClub(clubId: number) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_club", { p_club: clubId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clubs");
  return { ok: true };
}

export async function declareRaid(targetCode: string, fixtureId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("declare_raid", {
    p_target_code: targetCode,
    p_fixture_id: fixtureId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/raids");
  return data as { ok: boolean; raid_id?: number; error?: string };
}

export async function sendChat(
  scope: "club" | "room",
  scopeId: number,
  body: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("send_chat", {
    p_scope: scope,
    p_scope_id: scopeId,
    p_body: body,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; error?: string };
}
