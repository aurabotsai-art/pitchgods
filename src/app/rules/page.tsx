import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Play — Rules of Pitch Gods",
  description:
    "How to play Pitch Gods: predict World Cup 2026 matches, earn Glory and Coins, build streaks, climb tiers and win private leagues. Free, halal, no betting.",
  alternates: { canonical: "/rules" },
};

export default function RulesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500">← Pitch Gods</Link>
      <h1 className="mt-4 font-display text-4xl font-bold">How to play</h1>
      <p className="mt-3 text-lg text-zinc-300">
        Pitch Gods is a free, halal World Cup 2026 prediction game. Here&apos;s
        how it works.
      </p>

      <h2 className="mt-9 text-xl font-bold text-white">1. Predict matches</h2>
      <p className="mt-2 text-zinc-300">
        Before each match kicks off, predict the scoreline. Predictions lock at
        kickoff — no edits after the whistle. You can also make tournament-long
        meta picks: champion, golden boot, dark horse.
      </p>

      <h2 className="mt-7 text-xl font-bold text-white">2. Earn Glory &amp; Coins</h2>
      <p className="mt-2 text-zinc-300">
        Correct result earns Glory; an exact scoreline earns more. Glory is your
        permanent rank and decides your tier — from <strong>Park Player</strong>{" "}
        all the way to <strong>GOAT</strong>. You also earn <strong>Coins</strong>,
        a spendable currency.
      </p>

      <h2 className="mt-7 text-xl font-bold text-white">3. Build streaks</h2>
      <p className="mt-2 text-zinc-300">
        Predict daily to build a streak. Hot streaks multiply your Glory; streak
        freezes protect you on a missed day; comeback bonuses reward returning.
      </p>

      <h2 className="mt-7 text-xl font-bold text-white">4. Make a league</h2>
      <p className="mt-2 text-zinc-300">
        Create a{" "}
        <Link href="/leagues" className="text-pitch underline">private league</Link>,
        share the join code with your crew, and compete on your own private
        table. Winner takes eternal bragging rights.
      </p>

      <h2 className="mt-7 text-xl font-bold text-white">5. Redeem rewards</h2>
      <p className="mt-2 text-zinc-300">
        Spend earned Coins in the Rewards section on real iShopping.pk vouchers,
        or on cosmetics in the shop. Coins are earned-only and have no monetary
        value — it stays halal.
      </p>

      <div className="mt-10">
        <Link
          href="/"
          className="btn-pitch inline-flex h-12 items-center justify-center rounded-2xl px-8 text-base"
        >
          Start playing →
        </Link>
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        <Link href="/halal" className="text-pitch underline">Why it&apos;s halal</Link> ·{" "}
        <Link href="/faq" className="text-pitch underline">FAQ</Link>
      </p>
    </main>
  );
}
