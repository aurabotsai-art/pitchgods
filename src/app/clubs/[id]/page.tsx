import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatBox, type ChatMsg } from "@/components/ChatBox";
import { ClubControls } from "@/components/ClubControls";
import { joinClub } from "@/app/clubs/actions";
import { GuestButton } from "@/components/GuestButton";

export const dynamic = "force-dynamic";

export default async function ClubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clubId = Number(id);
  if (!Number.isFinite(clubId)) notFound();

  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const user = claimData?.claims?.sub
    ? { id: claimData.claims.sub as string }
    : null;

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, code, crest, motto, captain_id")
    .eq("id", clubId)
    .maybeSingle();
  if (!club) notFound();

  const { data: members } = await supabase
    .from("club_members")
    .select("user_id, role")
    .eq("club_id", clubId);
  const memberIds = (members ?? []).map((m) => m.user_id as string);
  const isMember = !!user && memberIds.includes(user.id);

  const { data: profs } = await supabase
    .from("profiles")
    .select("id, username, glory")
    .in("id", memberIds.length ? memberIds : ["00000000-0000-0000-0000-000000000000"]);
  const roster = (profs ?? [])
    .map((p) => ({
      id: p.id as string,
      username: (p.username as string) ?? "Guest",
      glory: (p.glory as number) ?? 0,
      role: members?.find((m) => m.user_id === p.id)?.role ?? "member",
    }))
    .sort((a, b) => b.glory - a.glory);
  const clubGlory = roster.reduce((s, r) => s + r.glory, 0);

  let initialChat: ChatMsg[] = [];
  if (isMember) {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, username, body, user_id, created_at")
      .eq("scope", "club")
      .eq("scope_id", clubId)
      .order("created_at", { ascending: false })
      .limit(50);
    initialChat = ((data ?? []) as ChatMsg[]).reverse();
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <Link href="/clubs" className="text-sm text-zinc-500" prefetch>
        ← Clubs
      </Link>

      <div className="mt-5 flex items-center gap-4">
        <span className="text-5xl">{club.crest ?? "🛡️"}</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black">{club.name}</h1>
          {club.motto && (
            <p className="truncate text-sm text-zinc-400">{club.motto}</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Stat label="Club Glory" value={clubGlory} accent="text-glory" />
        <Stat label="Members" value={roster.length} accent="text-pitch" />
        <div className="rounded-2xl surface p-3">
          <div className="text-lg font-black tracking-widest text-zinc-200">
            {club.code}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">
            Join code
          </div>
        </div>
      </div>

      {user ? (
        isMember ? (
          <ClubControls clubId={clubId} name={club.name} code={club.code} isMember />
        ) : (
          <JoinCta code={club.code} />
        )
      ) : (
        <div className="mt-4">
          <GuestButton label="Play / join as guest" />
        </div>
      )}

      <div className="mt-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Club table
        </p>
        <div className="flex flex-col gap-2">
          {roster.map((r, i) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-xl surface px-4 py-2.5"
            >
              <span className="w-5 text-center text-sm font-black text-zinc-500">
                {i + 1}
              </span>
              <span className="flex-1 truncate text-sm font-semibold">
                {r.username}
                {r.role === "captain" && (
                  <span className="ml-1 text-xs text-glory">©</span>
                )}
              </span>
              <span className="text-sm font-black text-glory">{r.glory}</span>
            </div>
          ))}
        </div>
      </div>

      {isMember && (
        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Club chat
          </p>
          <ChatBox
            scope="club"
            scopeId={clubId}
            initial={initialChat}
            signedIn={!!user}
            meId={user?.id ?? null}
          />
        </div>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl surface p-3">
      <div className={`text-lg font-black ${accent}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function JoinCta({ code }: { code: string }) {
  async function doJoin() {
    "use server";
    await joinClub(code);
  }
  return (
    <form action={doJoin} className="mt-4">
      <button className="h-12 w-full rounded-2xl bg-pitch text-sm font-bold text-black">
        Join this club
      </button>
    </form>
  );
}
