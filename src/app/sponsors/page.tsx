import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsor Pitch Perfect — reach the World Cup craze",
  description:
    "Put your brand in front of thousands of young football fans during World Cup 2026. Sponsor slots + reward drops.",
};

const SLOTS = [
  ["Title sponsor", "“Powered by you” on home + share cards — max reach.", "Premium"],
  ["Match of the Day", "Your brand on the day's biggest match.", "★"],
  ["Chaos Hour", "Own the 2×/3× points frenzy window.", "★"],
  ["Live-room banner", "Front of the action during peak attention.", ""],
  ["Leaderboard", "On the board everyone screenshots.", ""],
  ["Share-card footer", "Your name on every win shared to WhatsApp/IG.", "Reach"],
  ["Shop reward partner", "Give vouchers, we send you customers. FREE.", "Easiest"],
];

export default function SponsorsPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <Link href="/home" className="text-sm text-zinc-500">
        ← Back
      </Link>

      <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight">
        Sponsor the <span className="text-pitch">World Cup</span> craze
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Pitch Perfect puts your brand in front of thousands of young, football-mad
        fans every match day — the exact audience you want this World Cup.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <Stat big="Free" small="to play = mass reach" />
        <Stat big="39" small="days of WC drama" />
        <Stat big="100%" small="halal · brand-safe" />
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-zinc-300">
        Sponsor slots
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        {SLOTS.map(([title, desc, tag]) => (
          <div
            key={title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{title}</span>
              {tag && (
                <span className="rounded-full border border-pitch/40 px-2 py-0.5 text-[10px] font-semibold uppercase text-pitch">
                  {tag}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-400">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-pitch/40 bg-pitch/10 p-5 text-center">
        <p className="text-base font-black">Want a slot?</p>
        <p className="mt-1 text-sm text-zinc-300">
          Easiest start: become a free reward partner — give vouchers, get
          customers.
        </p>
        <a
          href="mailto:dhedhimuhammed@gmail.com?subject=Pitch%20Perfect%20Sponsorship"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-pitch font-bold text-black"
        >
          Get in touch
        </a>
      </div>

      <p className="mt-6 text-center text-xs text-zinc-600">
        No betting. No odds. Skill + bragging rights only.
      </p>
    </main>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xl font-black text-glory">{big}</div>
      <div className="mt-1 text-[10px] leading-tight text-zinc-500">{small}</div>
    </div>
  );
}
