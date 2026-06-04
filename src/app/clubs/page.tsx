import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GuestButton } from "@/components/GuestButton";
import { ClubsManager } from "@/components/ClubsManager";

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const user = claimData?.claims?.sub
    ? { id: claimData.claims.sub as string }
    : null;

  let myClubs: { id: number; name: string; crest: string | null }[] = [];
  if (user) {
    const { data } = await supabase
      .from("club_members")
      .select("clubs(id, name, crest)")
      .eq("user_id", user.id);
    myClubs = (data ?? [])
      .map((r) => r.clubs as unknown as { id: number; name: string; crest: string | null })
      .filter(Boolean);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-pitch">
          Clubs
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-black tracking-tight">Clubs</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Squad up, climb together, talk trash.
      </p>

      {!user ? (
        <div className="mt-8 flex flex-col gap-3">
          <GuestButton label="Play / join as guest" />
        </div>
      ) : (
        <>
          {myClubs.length > 0 && (
            <div className="mt-6 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Your clubs
              </p>
              {myClubs.map((c) => (
                <Link
                  key={c.id}
                  href={`/clubs/${c.id}`}
                  className="flex items-center gap-3 rounded-2xl surface px-4 py-3 transition active:scale-[0.99]"
                >
                  <span className="text-2xl">{c.crest ?? "🛡️"}</span>
                  <span className="flex-1 text-sm font-bold">{c.name}</span>
                  <span className="text-xs text-zinc-500">Open →</span>
                </Link>
              ))}
            </div>
          )}
          <ClubsManager />
        </>
      )}
    </main>
  );
}
