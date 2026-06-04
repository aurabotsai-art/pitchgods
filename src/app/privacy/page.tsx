import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Pitch Gods",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 text-sm leading-7 text-zinc-300">
      <Link href="/" className="text-zinc-500">
        ← Back
      </Link>
      <h1 className="mt-4 text-3xl font-black text-white">Privacy Policy</h1>
      <p className="mt-1 text-xs text-zinc-500">Last updated: June 2026</p>

      <p className="mt-6">
        Pitch Gods (&quot;we&quot;, &quot;us&quot;) is a free football-prediction
        game. We keep data collection to the minimum needed to run the game. This
        policy explains what we collect and why.
      </p>

      <H>1. What we collect</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <b>Account:</b> a guest ID is created when you play. If you sign in with
          Google, we receive your name, email, and profile picture from Google.
        </li>
        <li>
          <b>Gameplay:</b> your predictions, Glory, coins, streaks, clubs,
          chosen username, country flag (if you set one), and chat messages.
        </li>
        <li>
          <b>Notifications:</b> if you enable them, a device push token.
        </li>
        <li>
          <b>Technical:</b> standard logs (IP, device/browser) used for security
          and rate-limiting by our infrastructure providers.
        </li>
      </ul>

      <H>2. How we use it</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>Run the game: scoring, leaderboards, clubs, chat, notifications.</li>
        <li>Keep it fair and secure (anti-cheat, anti-abuse, rate-limiting).</li>
        <li>
          Show aggregate, anonymous stats to sponsors (e.g. total impressions).
          We do <b>not</b> sell your personal data.
        </li>
      </ul>

      <H>3. Sharing</H>
      <p>
        We use Supabase (database/auth), Vercel (hosting), Google (optional
        sign-in), and football-data.org (match data). They process data only to
        provide these services. We never sell personal data.
      </p>

      <H>4. Cookies</H>
      <p>
        We use cookies only to keep you signed in. No advertising trackers.
      </p>

      <H>5. Your choices</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>Turn notifications on/off any time.</li>
        <li>
          Request access to or deletion of your data by emailing us (below).
        </li>
      </ul>

      <H>6. Children</H>
      <p>
        Pitch Gods is not directed at children under 13. If you are under the
        age of digital consent in your country, please use it only with a
        parent or guardian&apos;s permission.
      </p>

      <H>7. No money</H>
      <p>
        Pitch Gods involves <b>no real-money betting and no cash prizes</b>.
        Coins are virtual, have no monetary value, and cannot be cashed out.
      </p>

      <H>8. Contact</H>
      <p>
        Questions or data requests:{" "}
        <a href="mailto:dhedhimuhammed@gmail.com" className="text-pitch underline">
          dhedhimuhammed@gmail.com
        </a>
        .
      </p>

      <p className="mt-8 text-xs text-zinc-600">
        See also our{" "}
        <Link href="/terms" className="text-pitch underline">
          Terms of Service
        </Link>
        .
      </p>
    </main>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-6 text-lg font-bold text-white">{children}</h2>;
}
