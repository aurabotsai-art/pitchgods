import Link from "next/link";
import { KickoffTime } from "./KickoffTime";

export type Fixture = {
  id: number;
  group_name: string | null;
  kickoff_at: string;
  home_name: string;
  away_name: string;
  home_flag: string | null;
  away_flag: string | null;
  status: string;
};

export function FixtureCard({ f }: { f: Fixture }) {
  return (
    <Link
      href={`/matches/${f.id}`}
      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition active:scale-[0.99] hover:border-pitch/40"
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-zinc-500">
        <span>Group {f.group_name}</span>
        <KickoffTime iso={f.kickoff_at} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Team flag={f.home_flag} name={f.home_name} />
        <span className="px-3 text-xs font-bold text-zinc-600">vs</span>
        <Team flag={f.away_flag} name={f.away_name} align="right" />
      </div>
    </Link>
  );
}

function Team({
  flag,
  name,
  align = "left",
}: {
  flag: string | null;
  name: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-1 items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="text-2xl leading-none">{flag ?? "⚽"}</span>
      <span className="text-sm font-semibold">{name}</span>
    </div>
  );
}
