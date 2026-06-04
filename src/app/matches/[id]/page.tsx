import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFixture, getTeamsMap } from "@/lib/data";
import { KickoffTime } from "@/components/KickoffTime";
import { Flag } from "@/components/Flag";
import { stageOrGroup } from "@/components/FixtureCard";
import { PredictionForm, type ExistingPicks } from "@/components/PredictionForm";
import { GuestButton } from "@/components/GuestButton";
import { LiveRoom } from "@/components/LiveRoom";

export const dynamic = "force-dynamic";

type PredRow = {
  type_key: string;
  payload: Record<string, unknown>;
  was_correct: boolean | null;
  points_awarded: number;
};

const LABELS: Record<string, string> = {
  result: "Result",
  exact_score: "Exact",
  btts: "BTTS",
  total_goals: "Total goals",
  first_scorer: "First scorer",
  bold_call: "Bold call",
};

function payloadLabel(type: string, p: Record<string, unknown>): string {
  if (type === "result") return String(p.pick ?? "");
  if (type === "exact_score") return `${p.home}–${p.away}`;
  if (type === "btts") return String(p.pick ?? "");
  if (type === "total_goals") return String(p.bucket ?? "");
  if (type === "first_scorer") return String(p.player ?? "");
  if (type === "bold_call") return String(p.text ?? "");
  return "";
}

function toExisting(rows: PredRow[]): ExistingPicks {
  const e: ExistingPicks = {};
  for (const r of rows) {
    const p = r.payload ?? {};
    if (r.type_key === "result") e.result = p.pick as ExistingPicks["result"];
    if (r.type_key === "exact_score") {
      e.exact_home = p.home as number;
      e.exact_away = p.away as number;
    }
    if (r.type_key === "btts") e.btts = p.pick as ExistingPicks["btts"];
    if (r.type_key === "total_goals")
      e.total_goals = p.bucket as ExistingPicks["total_goals"];
    if (r.type_key === "first_scorer") e.first_scorer = p.player as string;
    if (r.type_key === "bold_call") e.bold_call = p.text as string;
  }
  return e;
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fixtureId = Number(id);
  if (!Number.isFinite(fixtureId)) notFound();

  const supabase = await createClient();

  // Public, cached match + flags run in parallel with the per-user auth check.
  const [f, teamsMap, claimRes] = await Promise.all([
    getFixture(fixtureId),
    getTeamsMap(),
    supabase.auth.getClaims(),
  ]);
  if (!f) notFound();

  const uid = (claimRes.data?.claims?.sub as string | undefined) ?? null;
  const home = teamsMap.get(f.home_code ?? "");
  const away = teamsMap.get(f.away_code ?? "");

  const locked = new Date(f.kickoff_at).getTime() <= Date.now();
  const finished = f.status === "finished";

  let rows: PredRow[] = [];
  if (uid) {
    const { data } = await supabase
      .from("predictions")
      .select("type_key, payload, was_correct, points_awarded")
      .eq("fixture_id", fixtureId)
      .eq("user_id", uid);
    rows = (data ?? []) as PredRow[];
  }
  const existing = toExisting(rows);
  const hasPicks = rows.length > 0;
  const earned = rows.reduce((s, r) => s + (r.points_awarded ?? 0), 0);

  const isLive = f.status === "live";
  let liveEvents: {
    id: number;
    minute: number | null;
    type: string;
    text: string;
    created_at: string;
  }[] = [];
  let openPick: "home" | "away" | "none" | null = null;
  let initialChat: {
    id: number;
    username: string | null;
    body: string;
    user_id: string;
    created_at: string;
  }[] = [];
  if (isLive) {
    const [{ data: evs }, { data: chat }] = await Promise.all([
      supabase
        .from("match_events")
        .select("id, minute, type, text, created_at")
        .eq("fixture_id", fixtureId)
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("chat_messages")
        .select("id, username, body, user_id, created_at")
        .eq("scope", "room")
        .eq("scope_id", fixtureId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    liveEvents = evs ?? [];
    initialChat = ((chat ?? []) as typeof initialChat).reverse();
    if (uid) {
      const { data: op } = await supabase
        .from("live_predictions")
        .select("payload")
        .eq("user_id", uid)
        .eq("fixture_id", fixtureId)
        .eq("kind", "next_goal")
        .eq("resolved", false)
        .maybeSingle();
      openPick =
        (op?.payload as { pick?: "home" | "away" | "none" } | null)?.pick ?? null;
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <Link href="/matches" className="text-sm text-zinc-500" prefetch>
        ← Matches
      </Link>

      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500">
        <span>{stageOrGroup(f)}</span>
        <span>·</span>
        <KickoffTime iso={f.kickoff_at} />
        {locked && !finished && (
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-zinc-400">
            Locked
          </span>
        )}
        {finished && (
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-zinc-400">
            Full time
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex flex-1 flex-col items-center gap-2">
          <Flag slug={home?.flag_slug} logo={home?.logo} emoji={home?.flag} size={56} />
          <span className="text-center text-sm font-bold">{f.home_name}</span>
        </div>
        {finished ? (
          <span className="text-3xl font-black tabular-nums">
            {f.score_home}–{f.score_away}
          </span>
        ) : (
          <span className="text-xl font-black text-zinc-600">vs</span>
        )}
        <div className="flex flex-1 flex-col items-center gap-2">
          <Flag slug={away?.flag_slug} logo={away?.logo} emoji={away?.flag} size={56} />
          <span className="text-center text-sm font-bold">{f.away_name}</span>
        </div>
      </div>

      {isLive ? (
        <LiveRoom
          fixtureId={fixtureId}
          homeName={f.home_name}
          awayName={f.away_name}
          initialScore={[f.score_home ?? 0, f.score_away ?? 0]}
          initialMinute={f.minute ?? null}
          initialEvents={liveEvents}
          initialOpenPick={openPick}
          signedIn={!!uid}
          initialChat={initialChat}
          meId={uid}
        />
      ) : locked ? (
        <LockedView rows={rows} hasPicks={hasPicks} finished={finished} earned={earned} />
      ) : !uid ? (
        <div className="mt-10 flex flex-col gap-3">
          <p className="text-center text-sm text-zinc-400">
            Make your call before kickoff.
          </p>
          <GuestButton />
        </div>
      ) : (
        <PredictionForm
          fixtureId={fixtureId}
          homeName={f.home_name}
          awayName={f.away_name}
          existing={existing}
        />
      )}
    </main>
  );
}

function LockedView({
  rows,
  hasPicks,
  finished,
  earned,
}: {
  rows: PredRow[];
  hasPicks: boolean;
  finished: boolean;
  earned: number;
}) {
  if (!hasPicks)
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-white/15 p-6 text-center">
        <p className="text-sm font-semibold text-zinc-300">
          You didn&apos;t predict this one.
        </p>
        <p className="mt-1 text-xs text-zinc-500">Catch the next match.</p>
      </div>
    );

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-300">Your picks</p>
        {finished && (
          <span className="text-sm font-black text-glory">+{earned} Glory</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div
            key={r.type_key}
            className="flex items-center justify-between rounded-xl surface px-4 py-3"
          >
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              {LABELS[r.type_key] ?? r.type_key}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold capitalize">
                {payloadLabel(r.type_key, r.payload)}
              </span>
              {finished && r.was_correct === true && (
                <span className="text-sm font-bold text-pitch">
                  ✓ +{r.points_awarded}
                </span>
              )}
              {finished && r.was_correct === false && (
                <span className="text-sm font-bold text-red-400">✗</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
