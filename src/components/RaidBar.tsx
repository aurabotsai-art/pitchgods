export type RaidView = {
  id: number;
  status: string;
  score_a: number;
  score_b: number;
  winner_id: number | null;
  club_a_name: string;
  club_a_crest: string | null;
  club_a_id: number;
  club_b_name: string;
  club_b_crest: string | null;
  club_b_id: number;
  match: string;
  node: string | null;
};

export function RaidBar({ r }: { r: RaidView }) {
  const total = r.score_a + r.score_b;
  const aPct = total > 0 ? Math.round((r.score_a / total) * 100) : 50;
  const resolved = r.status === "resolved";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-zinc-500">
        <span>{r.match}</span>
        {resolved ? (
          <span className="text-zinc-400">Full time</span>
        ) : (
          <span className="text-red-400">⚔️ Raid pending</span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm font-bold">
        <span className={r.winner_id === r.club_a_id ? "text-pitch" : ""}>
          {r.club_a_crest ?? "🛡️"} {r.club_a_name}
        </span>
        <span className={r.winner_id === r.club_b_id ? "text-pitch" : ""}>
          {r.club_b_name} {r.club_b_crest ?? "🛡️"}
        </span>
      </div>

      <div className="mt-2 flex h-5 overflow-hidden rounded-full bg-white/5">
        <div
          className="flex items-center justify-start bg-pitch pl-2 text-[10px] font-black text-black"
          style={{ width: `${aPct}%` }}
        >
          {resolved ? r.score_a : ""}
        </div>
        <div
          className="flex flex-1 items-center justify-end bg-red-500/70 pr-2 text-[10px] font-black text-black"
        >
          {resolved ? r.score_b : ""}
        </div>
      </div>

      {resolved && (
        <p className="mt-2 text-center text-xs">
          {r.winner_id === r.club_a_id ? (
            <span className="font-bold text-pitch">{r.club_a_name} conquered {r.node}! 🏴</span>
          ) : r.winner_id === r.club_b_id ? (
            <span className="font-bold text-pitch">{r.club_b_name} conquered {r.node}! 🏴</span>
          ) : (
            <span className="text-zinc-400">Stalemate — no territory taken.</span>
          )}
        </p>
      )}
    </div>
  );
}
