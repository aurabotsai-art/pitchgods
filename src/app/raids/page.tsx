import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFixtures } from "@/lib/data";
import { GuestButton } from "@/components/GuestButton";
import { RaidDeclare } from "@/components/RaidDeclare";
import { RaidBar, type RaidView } from "@/components/RaidBar";

export const dynamic = "force-dynamic";

export default async function RaidsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <div className="mt-8">
          <GuestButton label="Play / join as guest" />
        </div>
      </Shell>
    );
  }

  const { data: memberships } = await supabase
    .from("club_members")
    .select("club_id, role")
    .eq("user_id", user.id);
  const myClubIds = (memberships ?? []).map((m) => m.club_id as number);
  const isCaptain = (memberships ?? []).some((m) => m.role === "captain");

  if (myClubIds.length === 0) {
    return (
      <Shell>
        <p className="mt-8 text-center text-sm text-zinc-400">
          Join or create a club first to start raiding.
        </p>
        <Link
          href="/clubs"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-pitch font-bold text-black"
        >
          Go to Clubs
        </Link>
      </Shell>
    );
  }

  const idList = myClubIds.join(",");
  const { data: raidRows } = await supabase
    .from("raids")
    .select("id, club_a, club_b, fixture_id, status, score_a, score_b, winner_id, node, created_at")
    .or(`club_a.in.(${idList}),club_b.in.(${idList})`)
    .order("created_at", { ascending: false })
    .limit(20);

  const clubIds = new Set<number>();
  const fixtureIds = new Set<number>();
  for (const r of raidRows ?? []) {
    clubIds.add(r.club_a as number);
    clubIds.add(r.club_b as number);
    fixtureIds.add(r.fixture_id as number);
  }
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, name, crest")
    .in("id", clubIds.size ? [...clubIds] : [0]);
  const clubMap = new Map(
    (clubs ?? []).map((c) => [c.id as number, c as { id: number; name: string; crest: string | null }]),
  );
  const { data: fxs } = await supabase
    .from("fixtures")
    .select("id, home_name, away_name")
    .in("id", fixtureIds.size ? [...fixtureIds] : [0]);
  const fxMap = new Map((fxs ?? []).map((f) => [f.id as number, `${f.home_name} v ${f.away_name}`]));

  const raids: RaidView[] = (raidRows ?? []).map((r) => {
    const a = clubMap.get(r.club_a as number);
    const b = clubMap.get(r.club_b as number);
    return {
      id: r.id as number,
      status: r.status as string,
      score_a: r.score_a as number,
      score_b: r.score_b as number,
      winner_id: r.winner_id as number | null,
      club_a_id: r.club_a as number,
      club_a_name: a?.name ?? "Club",
      club_a_crest: a?.crest ?? null,
      club_b_id: r.club_b as number,
      club_b_name: b?.name ?? "Club",
      club_b_crest: b?.crest ?? null,
      match: fxMap.get(r.fixture_id as number) ?? "Match",
      node: r.node as string | null,
    };
  });

  const fixtures = (await getFixtures())
    .filter((f) => f.status === "scheduled" && new Date(f.kickoff_at).getTime() > Date.now())
    .slice(0, 15)
    .map((f) => ({ id: f.id, label: `${f.home_name} v ${f.away_name}` }));

  return (
    <Shell>
      {isCaptain && (
        <div className="mt-6">
          <RaidDeclare fixtures={fixtures} />
        </div>
      )}
      <div className="mt-6 flex flex-col gap-3">
        {raids.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">
            No raids yet. {isCaptain ? "Declare one above." : "Your captain can start one."}
          </p>
        ) : (
          raids.map((r) => <RaidBar key={r.id} r={r} />)
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-red-400">
          Raids
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-black tracking-tight">⚔️ Raids</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Club vs club. Most member points wins territory.
      </p>
      {children}
    </main>
  );
}
