"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buyStreakFreeze } from "@/app/home/actions";

export function StreakControls({
  hotStreak,
  freezes,
}: {
  hotStreak: number;
  freezes: number;
}) {
  const router = useRouter();
  const [count, setCount] = useState(freezes);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function buy() {
    setErr(null);
    start(async () => {
      const res = await buyStreakFreeze();
      if (res.ok) {
        setCount((c) => c + 1);
        router.refresh();
      } else {
        setErr(res.error ?? "Failed");
        setTimeout(() => setErr(null), 2500);
      }
    });
  }

  const fire =
    hotStreak >= 7 ? "ON FIRE" : hotStreak >= 5 ? "🔥×3" : hotStreak >= 3 ? "🔥×2" : null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      {hotStreak >= 3 && (
        <div className="flex items-center justify-between rounded-2xl border border-glory/50 bg-glory/10 px-4 py-3">
          <span className="text-sm font-bold text-glory">
            🔥 {hotStreak} correct in a row — {fire}!
          </span>
        </div>
      )}
      <div className="flex items-center justify-between rounded-2xl surface px-4 py-3">
        <span className="text-sm text-zinc-300">
          ❄️ Streak freezes: <span className="font-bold">{count}</span>
        </span>
        <button
          onClick={buy}
          disabled={pending}
          className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold disabled:opacity-50"
        >
          Buy · 100 🪙
        </button>
      </div>
      {err && <p className="text-xs text-red-400">{err}</p>}
    </div>
  );
}
