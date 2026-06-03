"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setMeta(
  kind: "champion" | "golden_boot" | "dark_horse",
  payload: Record<string, string>,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("set_meta", {
    p_kind: kind,
    p_payload: payload,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/predict");
  return data as { ok: boolean; error?: string };
}
