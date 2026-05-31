import { createClient } from "@supabase/supabase-js";

// Cookieless anon client for public, cacheable reads (fixtures, teams,
// global leaderboard). No session work => no per-request auth round-trip.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
