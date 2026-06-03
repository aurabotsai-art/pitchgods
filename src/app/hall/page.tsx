import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { tierForGlory } from "@/lib/tiers";

export const revalidate = 60;

export default async function HallPage() {
  const sb = createPublicClient();

  const [{ data: legends }, { data: parades }, { data: clubs }] = await Promise.all([
    sb
      .from("profiles")
      .select("username, glory")
      .order("glory", { ascending: false })
      .limit(10),
    sb
      .from("parades")
      .select("headline, username, hype_count")
      .order("hype_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
    sb
      .from("clubs")
      .select("name, crest, club_glory, territories")
      .order("club_glory", { ascending: false })
      .limit(3),
  ]);

  const top = (legends ?? []).filter((l) => (l.glory as number) > 0);
  const bigCalls = (parades ?? []).filter((p) => (p.hype_count as number) >= 0);
  const topClubs = (clubs ?? []).filter((c) => (c.club_glory as number) > 0);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-glory">
          Hall of Fame
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-black tracking-tight">🏛️ Hall of Fame</h1>
      <p className="mt-1 text-sm text-zinc-500">
        The legends, the biggest calls, the empires of this World Cup.
      </p>

      <Section title="🐐 The Legends">
        {top.length === 0 ? (
          <Empty text="No legends yet — be the first." />
        ) : (
          top.map((l, i) => {
            const tier = tierForGlory(l.glory as number);
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
                  i === 0
                    ? "border-glory/50 bg-glory/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span className="w-6 text-center text-sm font-black text-zinc-500">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="text-sm font-bold">
                    {l.username ?? "Guest manager"}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wide text-zinc-500">
                    {i === 0 ? "GOAT · " : ""}
                    {tier.name}
                  </span>
                </span>
                <span className="text-sm font-black text-glory">{l.glory}</span>
              </div>
            );
          })
        )}
      </Section>

      <Section title="💥 Biggest calls">
        {bigCalls.length === 0 ? (
          <Empty text="No big calls yet. Nail an exact scoreline!" />
        ) : (
          bigCalls.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-glory/30 bg-glory/5 px-4 py-3"
            >
              <p className="text-sm font-bold leading-snug">{p.headline}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {p.username ?? "A manager"} · 🔥 {p.hype_count}
              </p>
            </div>
          ))
        )}
      </Section>

      <Section title="🏰 Top clubs">
        {topClubs.length === 0 ? (
          <Empty text="No clubs have conquered yet." />
        ) : (
          topClubs.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5"
            >
              <span className="text-2xl">{c.crest ?? "🛡️"}</span>
              <span className="flex-1 truncate text-sm font-bold">{c.name}</span>
              <span className="text-xs text-zinc-500">🏴 {c.territories}</span>
              <span className="text-sm font-black text-glory">{c.club_glory}</span>
            </div>
          ))
        )}
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-7">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-300">
        {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-3 text-center text-xs text-zinc-500">{text}</p>;
}
