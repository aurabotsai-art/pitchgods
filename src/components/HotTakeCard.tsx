"use client";

import { useState, useTransition } from "react";
import { voteHotTake } from "@/app/home/actions";

export function HotTakeCard({
  id,
  question,
  yes,
  no,
  myVote,
  signedIn,
}: {
  id: number;
  question: string;
  yes: number;
  no: number;
  myVote: boolean | null;
  signedIn: boolean;
}) {
  const [counts, setCounts] = useState({ yes, no });
  const [mine, setMine] = useState<boolean | null>(myVote);
  const [pending, start] = useTransition();

  const total = counts.yes + counts.no;
  const yesPct = total ? Math.round((counts.yes / total) * 100) : 0;
  const noPct = total ? 100 - yesPct : 0;
  const voted = mine !== null;

  function vote(v: boolean) {
    if (voted || !signedIn) return;
    setMine(v);
    setCounts((c) => ({
      yes: c.yes + (v ? 1 : 0),
      no: c.no + (v ? 0 : 1),
    }));
    start(async () => {
      const res = await voteHotTake(id, v);
      if (res.ok && typeof res.yes === "number")
        setCounts({ yes: res.yes, no: res.no! });
    });
  }

  return (
    <div className="rounded-2xl border border-glory/30 bg-glory/5 p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-glory">
        🔥 Daily Hot Take
      </div>
      <p className="mt-1 text-base font-bold leading-snug">{question}</p>

      {!voted ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => vote(true)}
            disabled={pending || !signedIn}
            className="h-12 rounded-xl bg-pitch text-sm font-black text-black disabled:opacity-50"
          >
            YES
          </button>
          <button
            onClick={() => vote(false)}
            disabled={pending || !signedIn}
            className="h-12 rounded-xl bg-white/10 text-sm font-black disabled:opacity-50"
          >
            NO
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <Bar label="YES" pct={yesPct} on={mine === true} />
          <Bar label="NO" pct={noPct} on={mine === false} />
          <p className="pt-1 text-center text-xs text-zinc-400">
            {mine
              ? `${mine === true ? noPct : yesPct}% of the world disagrees with you 💀`
              : ""}
          </p>
        </div>
      )}
      {!signedIn && (
        <p className="mt-2 text-center text-xs text-zinc-500">Sign in to vote (+2 🪙)</p>
      )}
    </div>
  );
}

function Bar({ label, pct, on }: { label: string; pct: number; on: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-xs font-bold text-zinc-400">{label}</span>
      <div className="h-6 flex-1 overflow-hidden rounded-lg bg-white/5">
        <div
          className={`flex h-full items-center justify-end pr-2 text-xs font-black ${
            on ? "bg-pitch text-black" : "bg-white/20 text-white"
          }`}
          style={{ width: `${Math.max(pct, 8)}%` }}
        >
          {pct}%
        </div>
      </div>
    </div>
  );
}
