"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Landing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // already signed in? bounce to the app (local cookie check, no network)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/home");
    });
  }, [router]);

  async function playAsGuest() {
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, #052e16 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-pitch/40 bg-pitch/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-pitch">
          World Cup 2026
        </span>

        <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
          PITCH
          <br />
          <span className="text-pitch">GODS</span>
        </h1>

        <p className="mt-6 text-lg leading-7 text-zinc-400">
          Out-predict your friends. Climb from nobody to national legend.
          <span className="mt-2 block font-medium text-glory">
            No money. Pure glory.
          </span>
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <button
            onClick={playAsGuest}
            disabled={loading}
            className="h-14 w-full rounded-2xl bg-pitch text-base font-bold text-black transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Starting…" : "Play as guest"}
          </button>
          <button
            disabled
            className="h-14 w-full rounded-2xl border border-white/15 text-base font-semibold text-zinc-500"
          >
            Sign in (soon)
          </button>
        </div>

        {err && <p className="mt-4 text-sm text-red-400">{err}</p>}

        <p className="mt-8 text-xs text-zinc-600">
          Play instantly — no signup. Convert later to keep your legend.
        </p>
      </div>
    </main>
  );
}
