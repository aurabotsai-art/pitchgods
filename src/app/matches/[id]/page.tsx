import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KickoffTime } from "@/components/KickoffTime";

export const dynamic = "force-dynamic";

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

  const { data: teams } = await supabase
    .from("teams")
    .select("code, flag")
    .in("code", [f.home_code, f.away_code].filter(Boolean) as string[]);
  const flagOf = new Map((teams ?? []).map((t) => [t.code, t.flag as string]));

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <Link href="/matches" className="text-sm text-zinc-500">
        ← Matches
      </Link>

      <div className="mt-6 text-center text-[11px] uppercase tracking-widest text-zinc-500">
        Group {f.group_name} · <KickoffTime iso={f.kickoff_at} />
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

      <div className="mt-10 rounded-2xl border border-dashed border-white/15 p-6 text-center">
        <p className="text-sm font-semibold text-zinc-300">Predictions open soon</p>
        <p className="mt-1 text-xs text-zinc-500">
          Result, exact score, and bold calls land in the next update.
        </p>
      </div>
    </main>
  );
}
