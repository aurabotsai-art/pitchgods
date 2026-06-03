import Link from "next/link";
import { getFixtures, getTeamsMap } from "@/lib/data";
import { FixtureCard, type Fixture } from "@/components/FixtureCard";
import { SponsorSlot } from "@/components/SponsorSlot";

export const revalidate = 30;

export default async function MatchesPage() {
  const [fixtures, teamsMap] = await Promise.all([getFixtures(), getTeamsMap()]);

  const cards: Fixture[] = fixtures.map((f) => {
    const h = teamsMap.get(f.home_code ?? "");
    const a = teamsMap.get(f.away_code ?? "");
    return {
      id: f.id,
      group_name: f.group_name,
      stage: f.stage,
      kickoff_at: f.kickoff_at,
      home_name: f.home_name,
      away_name: f.away_name,
      home_flag: h?.flag ?? null,
      away_flag: a?.flag ?? null,
      home_slug: h?.flag_slug ?? null,
      away_slug: a?.flag_slug ?? null,
      home_logo: h?.logo ?? null,
      away_logo: a?.logo ?? null,
      status: f.status,
      score_home: f.score_home,
      score_away: f.score_away,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-pitch">
          Matches
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-black tracking-tight">Today&apos;s matches</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Tap a match to lock your call before kickoff.
      </p>

      <div className="mt-5">
        <SponsorSlot slot="motd" />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {cards.length === 0 ? (
          <p className="text-sm text-zinc-500">No matches yet. Check back soon.</p>
        ) : (
          cards.map((f) => <FixtureCard key={f.id} f={f} />)
        )}
      </div>
    </main>
  );
}
