"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePredictions, type PickInput } from "@/app/matches/[id]/actions";

export type ExistingPicks = PickInput;

export function PredictionForm({
  fixtureId,
  homeName,
  awayName,
  existing,
}: {
  fixtureId: number;
  homeName: string;
  awayName: string;
  existing: ExistingPicks;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [result, setResult] = useState(existing.result);
  const [eh, setEh] = useState<number>(existing.exact_home ?? 0);
  const [ea, setEa] = useState<number>(existing.exact_away ?? 0);
  const [exactOn, setExactOn] = useState(
    existing.exact_home != null && existing.exact_away != null,
  );
  const [btts, setBtts] = useState(existing.btts);
  const [totals, setTotals] = useState(existing.total_goals);
  const [scorer, setScorer] = useState(existing.first_scorer ?? "");
  const [bold, setBold] = useState(existing.bold_call ?? "");

  function save() {
    setMsg(null);
    const picks: PickInput = {
      result,
      exact_home: exactOn ? eh : null,
      exact_away: exactOn ? ea : null,
      btts,
      total_goals: totals,
      first_scorer: scorer,
      bold_call: bold,
    };
    startTransition(async () => {
      const res = await savePredictions(fixtureId, picks);
      if (res.ok) {
        setMsg({ ok: true, text: "Locked in. Glory awaits." });
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error ?? "Something went wrong." });
      }
    });
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Section title="Match result" points="10">
        <Seg
          options={[
            { v: "home", label: homeName },
            { v: "draw", label: "Draw" },
            { v: "away", label: awayName },
          ]}
          value={result}
          onChange={(v) => setResult(v as PickInput["result"])}
        />
      </Section>

      <Section title="Exact scoreline" points="40">
        <div className="flex items-center justify-center gap-4">
          <Stepper value={eh} onChange={(n) => { setEh(n); setExactOn(true); }} />
          <span className="text-xl font-black text-zinc-600">–</span>
          <Stepper value={ea} onChange={(n) => { setEa(n); setExactOn(true); }} />
        </div>
        {exactOn && (
          <button
            onClick={() => setExactOn(false)}
            className="mt-2 w-full text-center text-xs text-zinc-500 underline"
          >
            clear exact score
          </button>
        )}
      </Section>

      <Section title="Both teams to score?" points="8">
        <Seg
          options={[
            { v: "yes", label: "Yes" },
            { v: "no", label: "No" },
          ]}
          value={btts}
          onChange={(v) => setBtts(v as PickInput["btts"])}
        />
      </Section>

      <Section title="Total goals" points="10">
        <Seg
          options={[
            { v: "0-1", label: "0–1" },
            { v: "2-3", label: "2–3" },
            { v: "4+", label: "4+" },
          ]}
          value={totals}
          onChange={(v) => setTotals(v as PickInput["total_goals"])}
        />
      </Section>

      <Section title="First goalscorer" points="25">
        <input
          value={scorer}
          onChange={(e) => setScorer(e.target.value)}
          placeholder="Player name"
          maxLength={40}
          className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-base outline-none focus:border-pitch"
        />
      </Section>

      <Section title="Bold call" points="50">
        <input
          value={bold}
          onChange={(e) => setBold(e.target.value)}
          placeholder='e.g. "hat-trick scored" or "0–0 bore draw"'
          maxLength={120}
          className="h-12 w-full rounded-xl border border-glory/30 bg-glory/5 px-4 text-base outline-none focus:border-glory"
        />
      </Section>

      <button
        onClick={save}
        disabled={pending}
        className="h-14 w-full rounded-2xl bg-pitch text-base font-bold text-black transition active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Locking…" : "Lock my picks"}
      </button>

      {msg && (
        <p
          className={`text-center text-sm ${
            msg.ok ? "text-pitch" : "text-red-400"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  points,
  children,
}: {
  title: string;
  points: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-200">{title}</span>
        <span className="text-[11px] font-medium text-zinc-500">+{points}</span>
      </div>
      {children}
    </div>
  );
}

function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { v: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-2">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`h-12 rounded-xl border px-2 text-sm font-semibold transition ${
            value === o.v
              ? "border-pitch bg-pitch text-black"
              : "border-white/15 bg-white/5 text-zinc-200"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Stepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-10 w-10 rounded-full border border-white/15 text-xl font-bold"
      >
        −
      </button>
      <span className="w-8 text-center text-2xl font-black">{value}</span>
      <button
        onClick={() => onChange(Math.min(20, value + 1))}
        className="h-10 w-10 rounded-full border border-white/15 text-xl font-bold"
      >
        +
      </button>
    </div>
  );
}
