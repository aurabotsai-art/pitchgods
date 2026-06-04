import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuestButton } from "@/components/GuestButton";
import { ShareButton } from "@/components/ShareButton";
import { UserName } from "@/components/UserName";
import { tierForGlory } from "@/lib/tiers";
import { joinLeague, leaveLeague } from "@/app/leagues/actions";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchperfect-sooty.vercel.app";

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const leagueId = Number(id);
  if (!Number.isFinite(leagueId)) notFound();

  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const user = claimData?.claims?.sub
    ? { id: claimData.claims.sub as string }
    : null;

  const { data: league } = await supabase
    .from("leagues")
    .select("id, name, code, owner_id")
    .eq("id", leagueId)
    .maybeSingle();
  if (!league) notFound();

  const { data: members } = await supabase
    .from("league_members")
    .select("user_id")
    .eq("league_id", leagueId);
  const memberIds = (members ?? []).map((m) => m.user_id as string);
  const isMember = !!user && memberIds.includes(user.id);

  const { data: profs } = await supabase
    .from("profiles")
    .select("id, username, glory, name_color, flair")
    .in(
      "id",
      memberIds.length ? memberIds : ["00000000-0000-0000-0000-000000000000"],
    );
  const roster = (profs ?? [])
    .map((p) => ({
      id: p.id as string,
      username: (p.username as string) ?? "Guest manager",
      glory: (p.glory as number) ?? 0,
      name_color: p.name_color as string | null,
      flair: p.flair as string | null,
    }))
    .sort((a, b) => b.glory - a.glory);

  const shareUrl = `${SITE_URL}/leagues/${league.id}`;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <Link href="/leagues" className="text-sm text-zinc-500" prefetch>
        ← Leagues
      </Link>

      <div className="mt-5 flex items-center gap-4">
        <span className="text-5xl">🏆</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black">{league.name}</h1>
          <p className="text-sm text-zinc-400">
            {roster.length} {roster.length === 1 ? "manager" : "managers"}
          </p>
        </div>
      </div>

      {/* The join code is the growth engine — make it big and shareable */}
      <div className="mt-5 rounded-2xl border border-pitch/30 bg-pitch/5 p-4 text-center">
        <div className="text-[10px] uppercase tracking-widest text-zinc-400">
          Invite code
        </div>
        <div className="mt-1 text-3xl font-black tracking-[0.3em] text-pitch">
          {league.code}
        </div>
        <div className="mt-3">
          <ShareButton
            url={shareUrl}
            text={`Join my Pitch Gods league "${league.name}" — code ${league.code}. Out-predict me this World Cup 👀`}
            label="Invite your crew on WhatsApp"
            variant="ghost"
          />
        </div>
      </div>

      {user ? (
        isMember ? (
          <LeaveCta leagueId={league.id} />
        ) : (
          <JoinCta code={league.code} />
        )
      ) : (
        <div className="mt-4">
          <GuestButton label="Play / join as guest" />
        </div>
      )}

      <div className="mt-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          League table
        </p>
        <div className="flex flex-col gap-2">
          {roster.length === 0 ? (
            <p className="py-3 text-center text-xs text-zinc-500">
              No managers yet — share the code to fill it up.
            </p>
          ) : (
            roster.map((r, i) => {
              const tier = tierForGlory(r.glory);
              return (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
                    i === 0
                      ? "border-glory/50 bg-glory/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <span className="w-5 text-center text-sm font-black text-zinc-500">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="text-sm font-bold">
                      <UserName
                        name={r.username}
                        color={r.name_color}
                        flair={r.flair}
                      />
                    </span>
                    <span className="block text-[10px] uppercase tracking-wide text-zinc-500">
                      {tier.name}
                    </span>
                  </span>
                  <span className="text-sm font-black text-glory">
                    {r.glory}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

function JoinCta({ code }: { code: string }) {
  async function doJoin() {
    "use server";
    await joinLeague(code);
  }
  return (
    <form action={doJoin} className="mt-4">
      <button className="h-12 w-full rounded-2xl bg-pitch text-sm font-bold text-black">
        Join this league
      </button>
    </form>
  );
}

function LeaveCta({ leagueId }: { leagueId: number }) {
  async function doLeave() {
    "use server";
    await leaveLeague(leagueId);
  }
  return (
    <form action={doLeave} className="mt-4">
      <button className="text-xs text-zinc-500 underline underline-offset-4">
        Leave league
      </button>
    </form>
  );
}
