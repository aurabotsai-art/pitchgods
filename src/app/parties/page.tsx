import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GuestButton } from "@/components/GuestButton";
import { PartyHost } from "@/components/PartyHost";
import { LocalTime } from "@/components/LocalTime";

export const dynamic = "force-dynamic";

const KIND_META: Record<string, { icon: string; label: string }> = {
  watch_party: { icon: "🍿", label: "Watch party" },
  parade: { icon: "🎉", label: "Parade" },
  raid: { icon: "⚔️", label: "Raid" },
};

export default async function PartiesPage() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const user = claimData?.claims?.sub
    ? { id: claimData.claims.sub as string }
    : null;

  // upcoming parties (and ones that started within the last 3h still show)
  const { data: parties } = await supabase
    .from("parties")
    .select("id, host_id, kind, title, location, starts_at")
    .gte("starts_at", new Date(Date.now() - 3 * 3600_000).toISOString())
    .order("starts_at", { ascending: true })
    .limit(50);

  const list = parties ?? [];
  const ids = list.map((p) => p.id as number);
  const hostIds = [...new Set(list.map((p) => p.host_id as string))];

  // attendee counts + host names in two small queries
  const [{ data: rsvps }, { data: hosts }] = await Promise.all([
    ids.length
      ? supabase.from("party_rsvps").select("party_id").in("party_id", ids)
      : Promise.resolve({ data: [] as { party_id: number }[] }),
    hostIds.length
      ? supabase.from("profiles").select("id, username").in("id", hostIds)
      : Promise.resolve({ data: [] as { id: string; username: string }[] }),
  ]);

  const countByParty = new Map<number, number>();
  for (const r of rsvps ?? [])
    countByParty.set(
      r.party_id as number,
      (countByParty.get(r.party_id as number) ?? 0) + 1,
    );
  const nameByHost = new Map<string, string>();
  for (const h of hosts ?? [])
    nameByHost.set(h.id as string, (h.username as string) ?? "A manager");

  // upcoming fixtures for the host form's optional match tie-in
  const { data: fx } = await supabase
    .from("fixtures")
    .select("id, home_name, away_name, kickoff_at")
    .gte("kickoff_at", new Date().toISOString())
    .order("kickoff_at", { ascending: true })
    .limit(30);
  const fixtures = (fx ?? []).map((f) => ({
    id: f.id as number,
    label: `${f.home_name} v ${f.away_name}`,
  }));

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-glory">
          Parties
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-black tracking-tight">Parties</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Arranged chaos. Host a watch party, a parade or a raid — drop the plan,
        whoever comes comes.
      </p>

      {user ? (
        <PartyHost fixtures={fixtures} />
      ) : (
        <div className="mt-6">
          <GuestButton label="Play / host as guest" />
        </div>
      )}

      <div className="mt-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          What&apos;s happening
        </p>
        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">
            Nothing planned yet. Be the first to throw one. 🎉
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((p) => {
              const meta = KIND_META[p.kind as string] ?? KIND_META.watch_party;
              return (
                <Link
                  key={p.id}
                  href={`/parties/${p.id}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meta.icon}</span>
                    <span className="flex-1 truncate text-sm font-bold">
                      {p.title}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-glory">
                      {countByParty.get(p.id as number) ?? 0} going
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span className="truncate">📍 {p.location}</span>
                    <span>·</span>
                    <span className="shrink-0">
                      <LocalTime iso={p.starts_at as string} mode="short" />
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-zinc-600">
                    {meta.label} · by {nameByHost.get(p.host_id as string) ?? "A manager"}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
