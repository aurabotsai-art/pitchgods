"use client";

import { useEffect, useState } from "react";

export function ChaosCountdown({
  multiplier,
  endsAt,
  title,
  sponsor,
}: {
  multiplier: number;
  endsAt: string;
  title: string | null;
  sponsor: string | null;
}) {
  const [left, setLeft] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const end = new Date(endsAt).getTime();
    const tick = () => {
      const ms = end - Date.now();
      if (ms <= 0) {
        setDone(true);
        return;
      }
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setLeft(`${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [endsAt]);

  if (done) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-glory/50 bg-gradient-to-r from-glory/20 to-pitch/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-glory">
            <span className="animate-pulse">⚡ CHAOS HOUR</span>
            <span className="rounded-full bg-glory px-2 py-0.5 text-xs font-black text-black">
              {multiplier}×
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-300">
            {title ?? `All points are ${multiplier}× — predict now!`}
            {sponsor && (
              <span className="text-zinc-500"> · by {sponsor}</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-xl font-black tabular-nums text-glory">
            {left}
          </div>
          <div className="text-[10px] uppercase text-zinc-500">left</div>
        </div>
      </div>
    </div>
  );
}
