"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { becomeAgent, logDeal } from "@/app/agent/actions";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchperfect-sooty.vercel.app";

export type Deal = {
  id: number;
  sponsor_name: string;
  slot: string | null;
  amount: number;
  currency: string;
  commission_rate: number;
  commission_amount: number;
  status: string;
};

export function AgentJoin() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function join() {
    setErr(null);
    start(async () => {
      const res = await becomeAgent();
      if (res.ok) router.refresh();
      else setErr(res.error ?? "Failed.");
    });
  }

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-pitch/30 bg-pitch/5 p-5">
        <h2 className="text-lg font-black">Earn cash closing sponsors 💸</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Pitch local brands a slot, close the deal, keep a fat cut. You do the
          selling, we handle everything else.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm">
          <Tier label="Rookie (deals 1–2)" rate="25%" />
          <Tier label="Pro (3–9 deals)" rate="30%" />
          <Tier label="Elite (10+ deals)" rate="40%" />
          <Tier label="Renewals" rate="20% residual" />
        </ul>
        <p className="mt-3 text-xs text-zinc-500">
          Paid after the sponsor pays. Founder confirms each deal. No cap on
          earnings.
        </p>
      </div>
      <button
        onClick={join}
        disabled={pending}
        className="mt-4 h-14 w-full rounded-2xl bg-pitch text-base font-bold text-black disabled:opacity-60"
      >
        {pending ? "…" : "Become an Agent"}
      </button>
      {err && <p className="mt-2 text-center text-sm text-red-400">{err}</p>}
    </div>
  );
}

function Tier({ label, rate }: { label: string; rate: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-zinc-400">{label}</span>
      <span className="font-black text-pitch">{rate}</span>
    </li>
  );
}

export function AgentPanel({
  code,
  rate,
  paidEarned,
  pendingEarned,
  deals,
}: {
  code: string;
  rate: number;
  paidEarned: number;
  pendingEarned: number;
  deals: Deal[];
}) {
  const router = useRouter();
  const link = `${SITE_URL}/sponsors?ref=${code}`;
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <Money label="Earned (paid)" value={paidEarned} accent="text-glory" />
        <Money label="Pending" value={pendingEarned} accent="text-zinc-200" />
      </div>

      <div className="rounded-2xl surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            Your agent code
          </span>
          <span className="rounded-full border border-pitch/40 px-2 py-0.5 text-[10px] font-bold text-pitch">
            {Math.round(rate * 100)}% rate
          </span>
        </div>
        <div className="mt-1 text-2xl font-black tracking-widest text-pitch">
          {code}
        </div>
        <button
          onClick={copy}
          className="mt-3 h-11 w-full rounded-xl border border-white/15 text-sm font-semibold"
        >
          {copied ? "Copied!" : "Copy your pitch link"}
        </button>
        <a
          href="/sponsors"
          className="mt-2 block text-center text-xs text-pitch underline"
        >
          Open the pitch kit →
        </a>
      </div>

      <LogDeal onLogged={() => router.refresh()} />

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Your deals
        </p>
        {deals.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No deals yet. Close one and log it here.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {deals.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-xl surface px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {d.sponsor_name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {d.currency} {d.amount} · {d.slot ?? "slot"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-glory">
                    +{d.currency} {d.commission_amount}
                  </div>
                  <div
                    className={`text-[10px] uppercase ${
                      d.status === "paid"
                        ? "text-pitch"
                        : d.status === "rejected"
                          ? "text-red-400"
                          : "text-zinc-500"
                    }`}
                  >
                    {d.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Money({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl surface p-4 text-center">
      <div className={`text-2xl font-black ${accent}`}>{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function LogDeal({ onLogged }: { onLogged: () => void }) {
  const [sponsor, setSponsor] = useState("");
  const [slot, setSlot] = useState("banner");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function submit() {
    setMsg(null);
    const amt = Number(amount);
    if (!sponsor.trim() || !(amt > 0)) {
      setMsg({ ok: false, text: "Sponsor + amount needed." });
      return;
    }
    start(async () => {
      const res = await logDeal({ sponsor, slot, amount: amt, currency });
      if (res.ok) {
        setMsg({
          ok: true,
          text: `Logged! Your cut: ${currency} ${res.commission} (${Math.round((res.rate ?? 0) * 100)}%)`,
        });
        setSponsor("");
        setAmount("");
        onLogged();
      } else {
        setMsg({ ok: false, text: res.error ?? "Failed." });
      }
    });
  }

  return (
    <div className="rounded-2xl border border-glory/30 bg-glory/5 p-4">
      <p className="text-sm font-bold">Log a closed deal</p>
      <input
        value={sponsor}
        onChange={(e) => setSponsor(e.target.value)}
        placeholder="Sponsor name"
        className="mt-3 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-pitch"
      />
      <div className="mt-2 flex gap-2">
        <select
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className="h-11 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 text-sm"
        >
          <option value="title">Title</option>
          <option value="motd">Match of the Day</option>
          <option value="banner">Banner</option>
          <option value="leaderboard">Leaderboard</option>
          <option value="liveroom">Live room</option>
          <option value="share">Share card</option>
        </select>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="h-11 w-24 rounded-xl border border-white/15 bg-white/5 px-3 text-sm"
        >
          <option value="PKR">PKR</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Deal amount"
        inputMode="numeric"
        className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-pitch"
      />
      <button
        onClick={submit}
        disabled={pending}
        className="mt-3 h-11 w-full rounded-xl bg-pitch text-sm font-bold text-black disabled:opacity-60"
      >
        {pending ? "…" : "Log deal"}
      </button>
      {msg && (
        <p className={`mt-2 text-sm ${msg.ok ? "text-pitch" : "text-red-400"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
