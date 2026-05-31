import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KickoffTime } from "@/components/KickoffTime";
import { PredictionForm, type ExistingPicks } from "@/components/PredictionForm";
import { GuestButton } from "@/components/GuestButton";

export const dynamic = "force-dynamic";

type PredRow = { type_key: string; payload: Record<string, unknown> };

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
  const { data: f } = await supabase
    .from("fixtures")
    .select(
      "id, stage, group_name, kickoff_at, home_code, away_code, home_name, away_name, status",
    )
    .eq("id", fixtureId)
    .single();
  if (!f) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: teams } = await supabase
    .from("teams")
    .select("code, flag")
    .in("code", [f.home_code, f.away_code].filter(Boolean) as string[]);
  const flagOf = new Map((teams ?? []).map((t) => [t.code, t.flag as string]));

  const locked = new Date(f.kickoff_at).getTime() <= Date.now();

  let existing: ExistingPicks = {};
  if (user) {
    const { data: rows } = await supabase
      .from("predictions")
      .select("type_key, payload")
      .eq("fixture_id", fixtureId)
      .eq("user_id", user.id);
    existing = toExisting((rows ?? []) as PredRow[]);
  }
  const hasPicks = Object.keys(existing).length > 0;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <Link href="/matches" className="text-sm text-zinc-500">
        ← Matches
      </Link>

      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500">
        <span>Group {f.group_name}</span>
        <span>·</span>
        <KickoffTime iso={f.kickoff_at} />
        {locked && (
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-zinc-400">
            Locked
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="text-5xl">{flagOf.get(f.home_code ?? "") ?? "⚽"}</span>
          <span className="text-center text-sm font-bold">{f.home_name}</span>
        </div>
        <span className="text-xl font-black text-zinc-600">vs</span>
        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="text-5xl">{flagOf.get(f.away_code ?? "") ?? "⚽"}</span>
          <span className="text-center text-sm font-bold">{f.away_name}</span>
        </div>
      </div>

      {locked ? (
        <LockedView existing={existing} hasPicks={hasPicks} />
      ) : !user ? (
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
  existing,
  hasPicks,
}: {
  existing: ExistingPicks;
  hasPicks: boolean;
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

  const items: [string, string][] = [];
  if (existing.result) items.push(["Result", existing.result]);
  if (existing.exact_home != null)
    items.push(["Exact", `${existing.exact_home}–${existing.exact_away}`]);
  if (existing.btts) items.push(["BTTS", existing.btts]);
  if (existing.total_goals) items.push(["Total goals", existing.total_goals]);
  if (existing.first_scorer) items.push(["First scorer", existing.first_scorer]);
  if (existing.bold_call) items.push(["Bold call", existing.bold_call]);

  return (
    <div className="mt-8">
      <p className="mb-3 text-center text-sm font-semibold text-zinc-300">
        Your locked picks
      </p>
      <div className="flex flex-col gap-2">
        {items.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              {k}
            </span>
            <span className="text-sm font-semibold capitalize">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
