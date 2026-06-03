"use client";

import { useState, useTransition } from "react";
import { Flag } from "@/components/Flag";
import { setMeta } from "@/app/predict/actions";

type Team = { code: string; name: string; flag_slug: string | null; flag: string | null };

export function MetaForm({
  teams,
  initial,
  signedIn,
}: {
  teams: Team[];
  initial: { champion?: string; dark_horse?: string; golden_boot?: string };
  signedIn: boolean;
}) {
  const [champion, setChampion] = useState(initial.champion ?? "");
  const [darkHorse, setDarkHorse] = useState(initial.dark_horse ?? "");
  const [boot, setBoot] = useState(initial.golden_boot ?? "");
  const [, start] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);

  function flash(t: string) {
    setSaved(t);
    setTimeout(() => setSaved(null), 1500);
  }

  function pickTeam(kind: "champion" | "dark_horse", code: string) {
    if (!signedIn) return;
    if (kind === "champion") setChampion(code);
    else setDarkHorse(code);
    start(async () => {
      const r = await setMeta(kind, { code });
      if (r.ok) flash("Saved");
    });
  }

  function saveBoot() {
    if (!signedIn || !boot.trim()) return;
    start(async () => {
      const r = await setMeta("golden_boot", { player: boot.trim() });
      if (r.ok) flash("Saved");
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-7">
      <TeamPick
        title="🏆 Champion"
        sub="Who lifts the trophy? (huge points if right)"
        teams={teams}
        selected={champion}
        onPick={(c) => pickTeam("champion", c)}
        disabled={!signedIn}
      />
      <TeamPick
        title="🐎 Dark Horse"
        sub="A long shot to over-perform — bonus glory."
        teams={teams}
        selected={darkHorse}
        onPick={(c) => pickTeam("dark_horse", c)}
        disabled={!signedIn}
      />
      <div>
        <h2 className="text-sm font-bold">👟 Golden Boot</h2>
        <p className="text-xs text-zinc-500">Top scorer of the tournament.</p>
        <div className="mt-2 flex gap-2">
          <input
            value={boot}
            onChange={(e) => setBoot(e.target.value)}
            placeholder="Player name"
            maxLength={40}
            disabled={!signedIn}
            className="h-11 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-pitch"
          />
          <button
            onClick={saveBoot}
            disabled={!signedIn}
            className="h-11 rounded-xl bg-pitch px-4 text-sm font-bold text-black disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      {saved && (
        <p className="text-center text-sm font-semibold text-pitch">{saved} ✓</p>
      )}
      {!signedIn && (
        <p className="text-center text-sm text-zinc-500">Sign in to lock your calls.</p>
      )}
    </div>
  );
}

function TeamPick({
  title,
  sub,
  teams,
  selected,
  onPick,
  disabled,
}: {
  title: string;
  sub: string;
  teams: Team[];
  selected: string;
  onPick: (code: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <h2 className="text-sm font-bold">{title}</h2>
      <p className="text-xs text-zinc-500">{sub}</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {teams.map((t) => (
          <button
            key={t.code}
            onClick={() => onPick(t.code)}
            disabled={disabled}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition ${
              selected === t.code
                ? "border-pitch bg-pitch/15"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <Flag slug={t.flag_slug} emoji={t.flag} size={24} />
            <span className="text-[10px] font-bold">{t.code}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
