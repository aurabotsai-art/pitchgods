"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function becomeAgent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("become_agent");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/agent");
  return data as { ok: boolean; code?: string; error?: string };
}

export async function logDeal(input: {
  sponsor: string;
  slot: string;
  amount: number;
  currency: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("log_deal", {
    p_sponsor: input.sponsor,
    p_slot: input.slot,
    p_amount: input.amount,
    p_currency: input.currency,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/agent");
  return data as { ok: boolean; rate?: number; commission?: number; error?: string };
}
