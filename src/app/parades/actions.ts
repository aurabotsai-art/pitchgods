"use server";

import { createClient } from "@/lib/supabase/server";

export async function hypeParade(paradeId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to hype." };

  const { data, error } = await supabase.rpc("join_parade", {
    p_parade_id: paradeId,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; hype?: number; already?: boolean; error?: string };
}
