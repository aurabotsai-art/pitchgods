"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function GuestButton({
  label = "Play as guest to predict",
  redirectTo,
}: {
  label?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={go}
        disabled={loading}
        className="h-14 w-full rounded-2xl bg-pitch text-base font-bold text-black transition active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Starting…" : label}
      </button>
      {err && <p className="text-sm text-red-400">{err}</p>}
    </div>
  );
}
