import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getGlobalLeaderboard, getCountryLeaderboard, type CountryRow } from "@/lib/data";
import { AddFriend } from "@/components/AddFriend";
import { SponsorSlot } from "@/components/SponsorSlot";
import { Flag } from "@/components/Flag";
import { tierForGlory } from "@/lib/tiers";
import { COUNTRY_NAME } from "@/lib/countries";

export const dynamic = "force-dynamic";

type Entry = {
  id: string;
  username: string | null;
  glory: number;
  level: number;
  flag_country: string | null;
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const sp = await searchParams;
  const scope =
    sp.scope === "global" ? "global" : sp.scope === "country" ? "country" : "friends";

  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const uid = (claimData?.claims?.sub as string | undefined) ?? null;

  let entries: Entry[] = [];
  let countries: CountryRow[] = [];
  if (scope === "country") {
    countries = await getCountryLeaderboard();
  } else if (scope === "global") {
    entries = (await getGlobalLeaderboard()) as Entry[];
  } else if (uid) {
    const { data: fr } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", uid);
    const ids = [uid, ...(fr ?? []).map((r) => r.friend_id as string)];
    const { data } = await supabase
      .from("profiles")
      .select("id, username, glory, level, flag_country")
      .in("id", ids)
      .order("glory", { ascending: false });
    entries = (data ?? []) as Entry[];
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500">
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-pitch">
          Leaderboard
        </span>
      </div>

      <div className="mt-5">
        <SponsorSlot slot="leaderboard" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Tab href="/leaderboard?scope=friends" active={scope === "friends"}>
          Friends
        </Tab>
        <Tab href="/leaderboard?scope=global" active={scope === "global"}>
          Global
        </Tab>
        <Tab href="/leaderboard?scope=country" active={scope === "country"}>
          Country
        </Tab>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {scope === "country" ? (
          countries.length === 0 ? (
            <Empty text="No countries ranked yet. Set yours on the home screen!" />
          ) : (
            countries.map((c, i) => <CountryRowView key={c.code} c={c} rank={i + 1} />)
          )
        ) : entries.length === 0 ? (
          <Empty
            text={
              scope === "friends"
                ? "No friends yet. Add one below to start the rivalry."
                : "No managers ranked yet."
            }
          />
        ) : (
          entries.map((e, i) => (
            <Row key={e.id} e={e} rank={i + 1} isMe={e.id === uid} />
          ))
        )}
      </div>

      {scope === "friends" && uid && <AddFriend />}
      {!uid && scope !== "country" && (
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="text-pitch underline">
            Play as guest
          </Link>{" "}
          to build your board.
        </p>
      )}
    </main>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-zinc-500">{text}</p>;
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition ${
        active ? "bg-pitch text-black" : "border border-white/15 bg-white/5 text-zinc-300"
      }`}
    >
      {children}
    </Link>
  );
}

function Row({ e, rank, isMe }: { e: Entry; rank: number; isMe: boolean }) {
  const name = e.username ?? "Guest manager";
  const tier = tierForGlory(e.glory);
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        isMe ? "border-pitch/50 bg-pitch/10" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <span className="w-6 text-center text-sm font-black text-zinc-500">{rank}</span>
      {e.flag_country && <Flag slug={e.flag_country} size={18} />}
      <span className="min-w-0 flex-1 truncate">
        <span className="text-sm font-semibold">
          {name} {isMe && <span className="text-xs text-pitch">(you)</span>}
        </span>
        <span className="block text-[10px] uppercase tracking-wide text-zinc-500">
          {tier.name}
        </span>
      </span>
      <span className="w-16 text-right text-sm font-black text-glory">{e.glory}</span>
    </div>
  );
}

function CountryRowView({ c, rank }: { c: CountryRow; rank: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="w-6 text-center text-sm font-black text-zinc-500">{rank}</span>
      <Flag slug={c.code} size={22} />
      <span className="flex-1 truncate text-sm font-semibold">
        {COUNTRY_NAME.get(c.code) ?? c.code.toUpperCase()}
        <span className="ml-1 text-xs text-zinc-500">· {c.players}</span>
      </span>
      <span className="w-16 text-right text-sm font-black text-glory">{c.glory}</span>
    </div>
  );
}
