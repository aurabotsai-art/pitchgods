import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuestButton } from "@/components/GuestButton";
import { ShareButton } from "@/components/ShareButton";
import { UserName } from "@/components/UserName";
import { LocalTime } from "@/components/LocalTime";
import { RsvpButton } from "@/components/RsvpButton";
import { cancelParty } from "@/app/parties/actions";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchgods.com";

const KIND_META: Record<string, { icon: string; label: string }> = {
  watch_party: { icon: "🍿", label: "Watch party" },
  parade: { icon: "🎉", label: "Parade" },
  raid: { icon: "⚔️", label: "Raid" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sb = await createClient();
  const { data: p } = await sb
    .from("parties")
    .select("title, kind, location")
    .eq("id", Number(id))
    .maybeSingle();
  if (!p) return { title: "Party · Pitch Gods" };
  const meta = KIND_META[p.kind as string] ?? KIND_META.watch_party;
  const title = `${p.title} — Pitch Gods ${meta.label}`;
  const description = `${meta.label} at ${p.location}. Join the World Cup 2026 watch party on Pitch Gods — whoever comes comes.`;
  const og = `/api/og?${new URLSearchParams({ name: String(p.title).slice(0, 24), tag: meta.label }).toString()}`;
  return {
    title,
    description,
    alternates: { canonical: `/parties/${id}` },
    openGraph: { title, description, images: [og] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function PartyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partyId = Number(id);
  if (!Number.isFinite(partyId)) notFound();

  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const user = claimData?.claims?.sub
    ? { id: claimData.claims.sub as string }
    : null;

  const { data: party } = await supabase
    .from("parties")
    .select("id, host_id, kind, title, details, location, starts_at, fixture_id")
    .eq("id", partyId)
    .maybeSingle();
  if (!party) notFound();

  const { data: rsvps } = await supabase
    .from("party_rsvps")
    .select("user_id")
    .eq("party_id", partyId);
  const attendeeIds = (rsvps ?? []).map((r) => r.user_id as string);
  const going = !!user && attendeeIds.includes(user.id);
  const isHost = !!user && user.id === (party.host_id as string);

  const { data: profs } = await supabase
    .from("profiles")
    .select("id, username, name_color, flair")
    .in(
      "id",
      attendeeIds.length
        ? attendeeIds
        : ["00000000-0000-0000-0000-000000000000"],
    );
  const attendees = (profs ?? []).map((p) => ({
    id: p.id as string,
    username: (p.username as string) ?? "Guest manager",
    name_color: p.name_color as string | null,
    flair: p.flair as string | null,
    isHost: p.id === party.host_id,
  }));
  attendees.sort((a, b) => Number(b.isHost) - Number(a.isHost));

  let matchLabel: string | null = null;
  if (party.fixture_id) {
    const { data: fx } = await supabase
      .from("fixtures")
      .select("home_name, away_name")
      .eq("id", party.fixture_id)
      .maybeSingle();
    if (fx) matchLabel = `${fx.home_name} v ${fx.away_name}`;
  }

  const meta = KIND_META[party.kind as string] ?? KIND_META.watch_party;
  const shareUrl = `${SITE_URL}/parties/${party.id}`;

  async function cancelHost() {
    "use server";
    await cancelParty(partyId);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <Link href="/parties" className="text-sm text-zinc-500" prefetch>
        ← Parties
      </Link>

      <div className="mt-5 flex items-start gap-3">
        <span className="text-4xl">{meta.icon}</span>
        <div className="min-w-0">
          <h1 className="text-2xl font-black leading-tight">{party.title}</h1>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-glory">
            {meta.label}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 rounded-2xl surface p-4 text-sm">
        <Row label="📍 Where" value={party.location as string} />
        <Row
          label="🕒 When"
          value={<LocalTime iso={party.starts_at as string} />}
        />
        {matchLabel && <Row label="⚽ Match" value={matchLabel} />}
      </div>

      {party.details && (
        <div className="mt-3 rounded-2xl surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            The plan
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
            {party.details}
          </p>
        </div>
      )}

      <div className="mt-4">
        {user ? (
          <RsvpButton
            partyId={party.id as number}
            initialGoing={going}
            initialCount={attendees.length}
          />
        ) : (
          <GuestButton label="Play / RSVP as guest" />
        )}
      </div>

      <div className="mt-3">
        <ShareButton
          url={shareUrl}
          text={`${meta.icon} ${party.title} — ${party.location}. Pull up 👀`}
          label="Spread the word on WhatsApp"
          variant="ghost"
        />
      </div>

      <div className="mt-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Coming ({attendees.length})
        </p>
        {attendees.length === 0 ? (
          <p className="py-3 text-center text-xs text-zinc-500">
            No one yet — be the first to commit.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {attendees.map((a) => (
              <span
                key={a.id}
                className="rounded-full surface px-3 py-1 text-xs font-semibold"
              >
                <UserName name={a.username} color={a.name_color} flair={a.flair} />
                {a.isHost && <span className="ml-1 text-glory">· host</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-[11px] leading-snug text-zinc-600">
        Stay safe: meet in public, don&apos;t share your home address publicly,
        and don&apos;t go alone to meet strangers.
      </p>

      {isHost && (
        <form action={cancelHost} className="mt-4">
          <button className="text-xs text-red-400/80 underline underline-offset-4">
            Cancel this party
          </button>
        </form>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-16 shrink-0 text-xs text-zinc-500">{label}</span>
      <span className="font-semibold text-zinc-100">{value}</span>
    </div>
  );
}
