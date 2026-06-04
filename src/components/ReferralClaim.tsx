"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// On first load after signup, if a referral code was captured on the landing
// page, credit both the new player and the referrer (100 Coins each).
export function ReferralClaim() {
  const router = useRouter();
  useEffect(() => {
    let ref: string | null = null;
    try {
      ref = localStorage.getItem("pg_ref");
    } catch {}
    if (!ref) return;
    const supabase = createClient();
    supabase
      .rpc("apply_referral", { p_ref_username: ref })
      .then(({ data }) => {
        try {
          localStorage.removeItem("pg_ref");
        } catch {}
        if ((data as { ok?: boolean } | null)?.ok) router.refresh();
      });
  }, [router]);
  return null;
}
