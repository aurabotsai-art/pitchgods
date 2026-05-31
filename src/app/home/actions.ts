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
