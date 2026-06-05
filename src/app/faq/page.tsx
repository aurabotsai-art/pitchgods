import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Pitch Gods World Cup Prediction Game",
  description:
    "Frequently asked questions about Pitch Gods: is it free, is it halal, how to earn coins, how to redeem vouchers, and how private leagues work.",
  alternates: { canonical: "/faq" },
};

const QA: { q: string; a: string }[] = [
  { q: "Is Pitch Gods free?", a: "Yes. Pitch Gods is 100% free to play for the entire World Cup 2026. There is nothing to buy to compete." },
  { q: "Is Pitch Gods halal?", a: "Yes. There is no betting, no staking money, no cash-out and no random-value loot boxes. You play with skill and earn glory — no gambling mechanics of any kind." },
  { q: "Do I bet real money?", a: "Never. You don't wager anything. You predict match outcomes and earn in-game Glory and Coins, which have no monetary value." },
  { q: "How do I earn coins?", a: "You earn Coins by playing — making correct predictions, building daily streaks, joining raids and winning in leagues. Coins are earned only, never bought." },
  { q: "Can I redeem my coins?", a: "Yes. In the Rewards section you can redeem earned Coins for real iShopping.pk shopping vouchers (e.g. 1,000 coins for a PKR 100 voucher). Redemptions are reviewed before the code is sent." },
  { q: "How do private leagues work?", a: "Create a league, get a 6-character join code, and share it with your friends or group. Everyone who joins competes on a private leaderboard that's just for your crew." },
  { q: "What is Glory vs Coins?", a: "Glory is your permanent rank/XP that decides your tier (Park Player up to GOAT). Coins are a spendable currency you earn and can redeem for cosmetics or vouchers." },
  { q: "When does it start?", a: "The World Cup 2026 runs June 11 to July 19. You can sign up now, set up your league and lock pre-tournament predictions like the champion and golden boot." },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QA.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/" className="text-sm text-zinc-500">← Pitch Gods</Link>
      <h1 className="mt-4 font-display text-4xl font-bold">FAQ</h1>
      <p className="mt-2 text-zinc-400">
        Everything about the free, halal World Cup 2026 prediction game.
      </p>
      <div className="mt-8 space-y-6">
        {QA.map((x) => (
          <div key={x.q}>
            <h2 className="text-lg font-bold text-white">{x.q}</h2>
            <p className="mt-1 text-zinc-300">{x.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link
          href="/"
          className="btn-pitch inline-flex h-12 items-center justify-center rounded-2xl px-8 text-base"
        >
          Play free →
        </Link>
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        More: <Link href="/halal" className="text-pitch underline">why it&apos;s halal</Link> ·{" "}
        <Link href="/rules" className="text-pitch underline">rules</Link>
      </p>
    </main>
  );
}
