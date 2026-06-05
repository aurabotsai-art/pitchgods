import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halal World Cup 2026 Prediction Game — No Betting, No Money",
  description:
    "Pitch Gods is a 100% halal World Cup 2026 prediction game. No betting, no staking money, no cash-out, no loot boxes — just football skill, leaderboards and pure glory. Free to play.",
  alternates: { canonical: "/halal" },
  openGraph: { title: "The Halal World Cup Prediction Game", url: "/halal" },
};

export default function HalalPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500">← Pitch Gods</Link>
      <h1 className="mt-4 font-display text-4xl font-bold leading-tight">
        The <span className="text-gradient-pitch">halal</span> World Cup
        prediction game
      </h1>
      <p className="mt-4 text-lg leading-7 text-zinc-300">
        Pitch Gods lets you predict every World Cup 2026 match, climb a global
        leaderboard and out-predict your friends — with{" "}
        <strong>zero betting and zero money involved</strong>. It is built to be
        permissible: pure skill, pure glory.
      </p>

      <h2 className="mt-10 text-xl font-bold text-white">Why Pitch Gods is halal</h2>
      <ul className="mt-3 space-y-2 text-zinc-300">
        <li>✅ <strong>No betting or wagering</strong> — you never stake money on an outcome.</li>
        <li>✅ <strong>No cash prizes / no cash-out</strong> — coins are earned by playing and have no monetary value.</li>
        <li>✅ <strong>No buying power</strong> — you can&apos;t pay to win; everything is earned through skill.</li>
        <li>✅ <strong>No random-value loot boxes</strong> — no gambling mechanics of any kind.</li>
        <li>✅ <strong>Free forever</strong> — play the whole World Cup at no cost.</li>
      </ul>

      <h2 className="mt-10 text-xl font-bold text-white">How it works</h2>
      <p className="mt-3 text-zinc-300">
        Predict scorelines before kickoff, earn <strong>Glory</strong> (your
        permanent rank) and <strong>Coins</strong> when you call it right, build
        daily streaks, and create a{" "}
        <Link href="/leagues" className="text-pitch underline">private league</Link>{" "}
        so your whole group can compete on one table. Climb the{" "}
        <Link href="/leaderboard" className="text-pitch underline">leaderboard</Link>{" "}
        and represent your country on the world board.
      </p>

      <div className="mt-10 rounded-2xl border border-pitch/30 bg-pitch/5 p-6 text-center">
        <p className="text-lg font-bold">No money. No betting. Pure glory.</p>
        <Link
          href="/"
          className="btn-pitch mt-4 inline-flex h-12 items-center justify-center rounded-2xl px-8 text-base"
        >
          Play free →
        </Link>
      </div>

      <p className="mt-8 text-sm text-zinc-500">
        See the <Link href="/rules" className="text-pitch underline">rules</Link> or{" "}
        <Link href="/faq" className="text-pitch underline">FAQ</Link>.
      </p>
    </main>
  );
}
