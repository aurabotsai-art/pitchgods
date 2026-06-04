"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PartyKind = "watch_party" | "parade" | "raid";

export async function createParty(input: {
  kind: PartyKind;
  title: string;
  details: string;
  location: string;
  startsAt: string; // ISO string from <input type="datetime-local"> converted to UTC
  fixtureId: number | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("create_party", {
    p_kind: input.kind,
    p_title: input.title,
    p_details: input.details,
    p_location: input.location,
    p_starts_at: input.startsAt,
    p_fixture_id: input.fixtureId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/parties");
  return data as { ok: boolean; id?: number; error?: string };
}

export async function toggleRsvp(partyId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await supabase.rpc("toggle_party_rsvp", {
    p_party: partyId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/parties/${partyId}`);
  revalidatePath("/parties");
  return data as { ok: boolean; going?: boolean; error?: string };
}

export async function cancelParty(partyId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cancel_party", {
    p_party: partyId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/parties");
  return data as { ok: boolean; error?: string };
}
