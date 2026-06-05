"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { track } from "@vercel/analytics";
import { Turnstile, captchaEnabled } from "./Turnstile";

export function Landing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // already signed in? bounce to the app (local cookie check, no network)
  useEffect(() => {
    // capture referral code so we can reward both sides after signup
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) localStorage.setItem("pg_ref", ref.slice(0, 24));
    } catch {}
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/home");
    });
  }, [router]);

  async function playAsGuest() {
    // If captcha is wired but the visitor hasn't passed yet, ask them to.
    if (captchaEnabled && !captchaToken) {
      setErr("Tick the box below to prove you're human, then tap again.");
      return;
    }
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously(
      captchaToken ? { options: { captchaToken } } : undefined,
    );
    if (error) {
      setErr(error.message);
      setLoading(false);
      setCaptchaToken(null); // force a fresh token on retry
      return;
    }
    track("guest_signup");
    router.push("/home");
    router.refresh();
  }

  async function continueWithGoogle() {
    setErr(null);
    track("signin_google_click");
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
      {/* floating glow orbs */}
      <div className="pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pitch/25 blur-[90px] animate-float" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-56 w-56 rounded-full bg-glory/15 blur-[90px]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <span className="chip animate-rise mb-7 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-pitch-bright">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch-bright opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pitch-bright" />
          </span>
          World Cup 2026 · Live
        </span>

        <h1 className="animate-rise font-display text-[3.75rem] font-bold leading-[0.86] sm:text-7xl" style={{ animationDelay: "60ms" }}>
          <span className="text-gradient-light">PITCH</span>
          <br />
          <span className="text-gradient-pitch [text-shadow:0_0_40px_rgba(47,224,126,0.45)]">
            GODS
          </span>
        </h1>

        <p className="animate-rise mt-6 text-lg leading-7 text-zinc-300" style={{ animationDelay: "140ms" }}>
          Out-predict your friends. Climb from nobody to national legend.
          <span className="mt-2 block font-semibold text-gradient-glory">
            No money. Pure glory.
          </span>
        </p>

        <div className="animate-rise mt-10 flex w-full flex-col gap-3" style={{ animationDelay: "220ms" }}>
          <button
            onClick={playAsGuest}
            disabled={loading}
            className="btn-pitch h-14 w-full rounded-2xl text-base disabled:opacity-60"
          >
            {loading ? "Starting…" : "Play as guest →"}
          </button>
          <Turnstile
            onToken={setCaptchaToken}
            onExpire={() => setCaptchaToken(null)}
          />
          <button
            onClick={continueWithGoogle}
            className="btn-glass flex h-14 w-full items-center justify-center gap-3 rounded-2xl text-base"
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

        <p className="mt-8 text-xs text-zinc-500">
          Play instantly — no signup. Convert later to keep your legend.
        </p>
        <nav className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500">
          <a href="/matches" className="hover:text-zinc-300">Matches</a>
          <a href="/leagues" className="hover:text-zinc-300">Leagues</a>
          <a href="/leaderboard" className="hover:text-zinc-300">Leaderboard</a>
          <a href="/hall" className="hover:text-zinc-300">Hall of Fame</a>
          <a href="/rewards" className="hover:text-zinc-300">Rewards</a>
          <a href="/halal" className="hover:text-zinc-300">Halal game</a>
          <a href="/rules" className="hover:text-zinc-300">How to play</a>
          <a href="/faq" className="hover:text-zinc-300">FAQ</a>
        </nav>
        <p className="mt-4 text-[11px] text-zinc-600">
          <a href="/privacy" className="hover:text-zinc-400">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="/terms" className="hover:text-zinc-400">
            Terms
          </a>{" "}
          · No betting. No money. Pure glory.
        </p>
      </div>
    </main>
  );
}
