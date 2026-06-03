"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function setUsername(formData: FormData) {
  const raw = String(formData.get("username") ?? "").trim();
  const username = raw.slice(0, 20);
  if (!username) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("profiles").update({ username }).eq("id", user.id);
  revalidatePath("/home");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function buyStreakFreeze() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("buy_streak_freeze");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/home");
  return data as { ok: boolean; coins?: number; error?: string };
}

export async function voteHotTake(id: number, vote: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to vote." };
  const { data, error } = await supabase.rpc("vote_hot_take", {
    p_id: id,
    p_vote: vote,
  });
  if (error) return { ok: false, error: error.message };
  return data as {
    ok: boolean;
    yes?: number;
    no?: number;
    mine?: boolean;
    error?: string;
  };
}
