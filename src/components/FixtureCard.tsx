import Link from "next/link";
import { KickoffTime } from "./KickoffTime";
import { Flag } from "./Flag";

export type Fixture = {
  id: number;
  group_name: string | null;
  kickoff_at: string;
  home_name: string;
  away_name: string;
  home_flag: string | null;
  away_flag: string | null;
  home_slug: string | null;
  away_slug: string | null;
  status: string;
  score_home: number | null;
  score_away: number | null;
};

export function FixtureCard({ f }: { f: Fixture }) {
  const live = f.status === "live";
  const finished = f.status === "finished";
  const showScore = (live || finished) && f.score_home != null;

  return (
    <Link
      href={`/matches/${f.id}`}
      prefetch
      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition active:scale-[0.99] hover:border-pitch/40"
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-zinc-500">
        <span>Group {f.group_name}</span>
        {live ? (
          <span className="flex items-center gap-1 font-bold text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            LIVE
          </span>
        ) : finished ? (
          <span className="text-zinc-500">Full time</span>
        ) : (
          <KickoffTime iso={f.kickoff_at} />
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Team flag={f.home_flag} slug={f.home_slug} name={f.home_name} />
        {showScore ? (
          <span className="px-2 text-base font-black tabular-nums">
            {f.score_home}–{f.score_away}
          </span>
        ) : (
          <span className="px-2 text-xs font-bold text-zinc-600">vs</span>
        )}
        <Team flag={f.away_flag} slug={f.away_slug} name={f.away_name} align="right" />
      </div>
    </Link>
  );
}

function Team({
  flag,
  slug,
  name,
  align = "left",
}: {
  flag: string | null;
  slug: string | null;
  name: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-1 items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <Flag slug={slug} emoji={flag} size={26} />
      <span className="truncate text-sm font-semibold">{name}</span>
    </div>
  );
}
