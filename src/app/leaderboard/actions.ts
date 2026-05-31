"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addFriend(username: string) {
  const clean = username.trim().slice(0, 20);
  if (!clean) return { ok: false, error: "Enter a manager name." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("add_friend_by_username", {
    p_username: clean,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/leaderboard");
  return data as { ok: boolean; error?: string; friend?: string };
}
