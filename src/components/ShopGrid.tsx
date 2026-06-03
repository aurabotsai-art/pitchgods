"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { redeem } from "@/app/shop/actions";

export type ShopItem = {
  id: number;
  title: string;
  description: string | null;
  kind: string;
  cost_coins: number;
  sponsor_name: string | null;
  stock: number | null;
};

export function ShopGrid({
  items,
  balance,
  signedIn,
}: {
  items: ShopItem[];
  balance: number;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [coins, setCoins] = useState(balance);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<number | null>(null);
  const [result, setResult] = useState<{
    title: string;
    code?: string | null;
    kind?: string;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function buy(item: ShopItem) {
    if (!signedIn || coins < item.cost_coins) return;
    setBusy(item.id);
    setErr(null);
    startTransition(async () => {
      const res = await redeem(item.id);
      setBusy(null);
      if (res.ok) {
        if (typeof res.balance === "number") setCoins(res.balance);
        setResult({ title: res.title!, code: res.code, kind: res.kind });
        router.refresh();
      } else {
        setErr(res.error ?? "Could not redeem.");
      }
    });
  }

  return (
    <div>
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-glory/30 bg-glory/5 px-4 py-3">
        <span className="text-sm font-semibold text-zinc-300">Your Coins</span>
        <span className="text-2xl font-black text-glory">🪙 {coins}</span>
      </div>

      {err && <p className="mt-3 text-center text-sm text-red-400">{err}</p>}

      <div className="mt-4 flex flex-col gap-3">
        {items.map((it) => {
          const afford = coins >= it.cost_coins;
          const sold = it.stock != null && it.stock <= 0;
          return (
            <div
              key={it.id}
              className={`rounded-2xl border p-4 ${
                it.kind === "sponsor"
                  ? "border-pitch/40 bg-pitch/5"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{it.title}</span>
                    {it.kind === "sponsor" && (
                      <span className="rounded-full border border-pitch/40 px-2 py-0.5 text-[10px] font-semibold uppercase text-pitch">
                        Sponsor
                      </span>
                    )}
                  </div>
                  {it.description && (
                    <p className="mt-1 text-xs text-zinc-500">{it.description}</p>
                  )}
                </div>
                <button
                  onClick={() => buy(it)}
                  disabled={!signedIn || !afford || sold || (pending && busy === it.id)}
                  className="shrink-0 rounded-xl bg-glory px-3 py-2 text-sm font-black text-black disabled:opacity-40"
                >
                  {sold ? "Sold out" : busy === it.id ? "…" : `🪙 ${it.cost_coins}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!signedIn && (
        <p className="mt-5 text-center text-sm text-zinc-500">
          Play to earn Coins, then redeem here.
        </p>
      )}

      {result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setResult(null)}
        >
          <div
            className="w-full max-w-xs rounded-3xl border border-glory/40 bg-zinc-950 p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl">🎁</div>
            <p className="mt-3 text-lg font-black">{result.title}</p>
            {result.kind === "sponsor" && result.code ? (
              <>
                <p className="mt-2 text-xs text-zinc-400">Your code</p>
                <p className="mt-1 select-all rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-lg font-bold text-glory">
                  {result.code}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-pitch">Unlocked. Enjoy the flex.</p>
            )}
            <button
              onClick={() => setResult(null)}
              className="mt-5 h-11 w-full rounded-xl bg-pitch font-bold text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
