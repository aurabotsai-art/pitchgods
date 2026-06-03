"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function redeem(itemId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to redeem." };

  const { data, error } = await supabase.rpc("redeem_item", {
    p_item_id: itemId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/shop");
  return data as {
    ok: boolean;
    error?: string;
    kind?: string;
    title?: string;
    code?: string | null;
    balance?: number;
  };
}
