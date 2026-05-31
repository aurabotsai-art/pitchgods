import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddFriend } from "@/components/AddFriend";

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
  const scope = sp.scope === "global" ? "global" : "friends";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let entries: Entry[] = [];
  if (scope === "global") {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, glory, level, flag_country")
      .order("glory", { ascending: false })
      .limit(50);
    entries = (data ?? []) as Entry[];
  } else if (user) {
    const { data: fr } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", user.id);
    const ids = [user.id, ...(fr ?? []).map((r) => r.friend_id as string)];
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

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Tab href="/leaderboard?scope=friends" active={scope === "friends"}>
          Friends
        </Tab>
        <Tab href="/leaderboard?scope=global" active={scope === "global"}>
          Global
        </Tab>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            {scope === "friends"
              ? "No friends yet. Add one below to start the rivalry."
              : "No managers ranked yet."}
          </p>
        ) : (
          entries.map((e, i) => (
            <Row key={e.id} e={e} rank={i + 1} isMe={e.id === user?.id} />
          ))
        )}
      </div>

      {scope === "friends" && user && <AddFriend />}
      {!user && (
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
        active
          ? "bg-pitch text-black"
          : "border border-white/15 bg-white/5 text-zinc-300"
      }`}
    >
      {children}
    </Link>
  );
}

function Row({ e, rank, isMe }: { e: Entry; rank: number; isMe: boolean }) {
  const name = e.username ?? "Guest manager";
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        isMe ? "border-pitch/50 bg-pitch/10" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <span className="w-6 text-center text-sm font-black text-zinc-500">
        {rank}
      </span>
      <span className="flex-1 truncate text-sm font-semibold">
        {name} {isMe && <span className="text-xs text-pitch">(you)</span>}
      </span>
      <span className="text-xs text-zinc-500">Lv {e.level}</span>
      <span className="w-16 text-right text-sm font-black text-glory">
        {e.glory}
      </span>
    </div>
  );
}
