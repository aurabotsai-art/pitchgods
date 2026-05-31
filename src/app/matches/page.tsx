import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FixtureCard, type Fixture } from "@/components/FixtureCard";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const supabase = await createClient();

  const [{ data: fixtures }, { data: teams }] = await Promise.all([
    supabase
      .from("fixtures")
      .select(
        "id, group_name, kickoff_at, home_code, away_code, home_name, away_name, status",
      )
      .order("kickoff_at", { ascending: true }),
    supabase.from("teams").select("code, flag"),
  ]);

  const flagOf = new Map((teams ?? []).map((t) => [t.code, t.flag as string]));

  const cards: Fixture[] = (fixtures ?? []).map((f) => ({
    id: f.id,
    group_name: f.group_name,
    kickoff_at: f.kickoff_at,
    home_name: f.home_name,
    away_name: f.away_name,
    home_flag: flagOf.get(f.home_code ?? "") ?? null,
    away_flag: flagOf.get(f.away_code ?? "") ?? null,
    status: f.status,
  }));

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500">
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
