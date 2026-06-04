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

  async function continueWithGoogle() {
    setErr(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // already playing as a guest? link Google so all progress carries over
    if (session?.user?.is_anonymous) {
      const { error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: { redirectTo },
      });
      if (!error) return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setErr("Google sign-in isn't available yet.");
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
            onClick={continueWithGoogle}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 text-base font-semibold text-zinc-100 transition active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
            </svg>
            Continue with Google
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
