import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GuestButton } from "@/components/GuestButton";
import { LeaguesManager } from "@/components/LeaguesManager";

export const dynamic = "force-dynamic";

export default async function LeaguesPage() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const user = claimData?.claims?.sub
    ? { id: claimData.claims.sub as string }
    : null;

  let myLeagues: { id: number; name: string }[] = [];
  if (user) {
    const { data } = await supabase
      .from("league_members")
      .select("leagues(id, name)")
      .eq("user_id", user.id);
    myLeagues = (data ?? [])
      .map((r) => r.leagues as unknown as { id: number; name: string })
      .filter(Boolean);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-pitch">
          Private Leagues
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-black tracking-tight">
        Private Leagues
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Run your own World Cup with your crew. Share a code, climb your own
        table, settle it for good.
      </p>

      {!user ? (
        <div className="mt-8 flex flex-col gap-3">
          <GuestButton label="Play / join as guest" />
        </div>
      ) : (
        <>
          {myLeagues.length > 0 && (
            <div className="mt-6 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Your leagues
              </p>
              {myLeagues.map((l) => (
                <Link
                  key={l.id}
                  href={`/leagues/${l.id}`}
                  className="flex items-center gap-3 rounded-2xl surface px-4 py-3 transition active:scale-[0.99]"
                >
                  <span className="text-2xl">🏆</span>
                  <span className="flex-1 truncate text-sm font-bold">
                    {l.name}
                  </span>
                  <span className="text-xs text-zinc-500">Open →</span>
                </Link>
              ))}
            </div>
          )}
          <LeaguesManager />
        </>
      )}
    </main>
  );
}
