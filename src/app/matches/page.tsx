import Link from "next/link";
import { getFixtures, getTeamsMap } from "@/lib/data";
import { FixtureCard, type Fixture } from "@/components/FixtureCard";

export const revalidate = 30;

export default async function MatchesPage() {
  const [fixtures, teamsMap] = await Promise.all([getFixtures(), getTeamsMap()]);

  const cards: Fixture[] = fixtures.map((f) => ({
    id: f.id,
    group_name: f.group_name,
    kickoff_at: f.kickoff_at,
    home_name: f.home_name,
    away_name: f.away_name,
    home_flag: teamsMap.get(f.home_code ?? "")?.flag ?? null,
    away_flag: teamsMap.get(f.away_code ?? "")?.flag ?? null,
    home_slug: teamsMap.get(f.home_code ?? "")?.flag_slug ?? null,
    away_slug: teamsMap.get(f.away_code ?? "")?.flag_slug ?? null,
    status: f.status,
    score_home: f.score_home,
    score_away: f.score_away,
  }));

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

      <div className="mt-6 flex flex-col gap-3">
        {cards.length === 0 ? (
          <p className="text-sm text-zinc-500">No matches yet. Check back soon.</p>
        ) : (
          cards.map((f) => <FixtureCard key={f.id} f={f} />)
        )}
      </div>
    </main>
  );
}
