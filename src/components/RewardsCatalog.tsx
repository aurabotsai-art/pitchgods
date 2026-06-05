"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { createRedemption } from "@/app/rewards/actions";

type Tier = {
  id: number;
  label: string;
  points_cost: number;
  voucher_value_pkr: number;
};

export function RewardsCatalog({
  tiers,
  coins,
  defaultEmail,
}: {
  tiers: Tier[];
  coins: number;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Tier | null>(null);
  const [email, setEmail] = useState(defaultEmail);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function confirm() {
    if (!selected) return;
    setMsg(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return setMsg({ ok: false, text: "Enter a valid email." });
    }
    start(async () => {
      const res = await createRedemption(selected.id, email);
      if (res.ok) {
        track("reward_redeemed", { pkr: selected.voucher_value_pkr });
        setMsg({
          ok: true,
          text: "Redemption requested! We'll review it and email your voucher code shortly.",
        });
        setSelected(null);
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error ?? "Failed." });
      }
    });
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {tiers.map((t) => {
          const afford = coins >= t.points_cost;
          return (
            <button
              key={t.id}
              onClick={() => {
                setMsg(null);
                setSelected(t);
              }}
              className={`card p-4 text-left transition active:scale-[0.98] ${
                afford ? "card-glow-glory" : "opacity-70"
              }`}
            >
              <div className="font-display text-2xl font-bold text-glory">
                PKR {t.voucher_value_pkr.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-zinc-400">iShopping.pk voucher</div>
              <div className="mt-3 text-sm font-bold tabular-nums">
                {t.points_cost.toLocaleString()}{" "}
                <span className="text-zinc-500">coins</span>
              </div>
              {!afford && (
                <div className="mt-1 text-[11px] text-zinc-500">
                  Need {(t.points_cost - coins).toLocaleString()} more
                </div>
              )}
            </button>
          );
        })}
      </div>

      {msg && (
        <p
          className={`mt-4 text-center text-sm ${
            msg.ok ? "text-pitch-bright" : "text-red-400"
          }`}
        >
          {msg.text}
        </p>
      )}

      {/* confirm modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !pending && setSelected(null)}
        >
          <div
            className="card w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl font-bold">
              Redeem {selected.label}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {selected.points_cost.toLocaleString()} coins → a PKR{" "}
              {selected.voucher_value_pkr.toLocaleString()} iShopping.pk voucher.
              Coins are deducted now; we review and email your code.
            </p>
            <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Email for your voucher
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="mt-1 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-base outline-none focus:border-glory"
            />
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setSelected(null)}
                disabled={pending}
                className="btn-glass h-12 flex-1 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={pending}
                className="btn-gold h-12 flex-[2] rounded-xl text-sm disabled:opacity-60"
              >
                {pending ? "Redeeming…" : "Confirm redemption"}
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-snug text-zinc-600">
              By redeeming you confirm the email is yours. Vouchers are
              reviewed before sending to prevent abuse. No refunds except on
              rejection (coins returned).
            </p>
          </div>
        </div>
      )}
    </>
  );
}
