"use client";

import { useEffect, useRef, useState } from "react";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { hypeParade } from "@/app/parades/actions";
import { ShareButton } from "@/components/ShareButton";

export type Parade = {
  id: number;
  type: string;
  headline: string;
  username: string | null;
  hype_count: number;
  created_at: string;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchgods.com";

export function ParadeFeed({
  initial,
  hypedIds,
  signedIn,
}: {
  initial: Parade[];
  hypedIds: number[];
  signedIn: boolean;
}) {
  const [parades, setParades] = useState<Parade[]>(initial);
  const [hyped, setHyped] = useState<Set<number>>(new Set(hypedIds));
  const seen = useRef(new Set(initial.map((p) => p.id)));

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel("parades-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "parades" },
        (payload) => {
          const p = payload.new as Parade;
          if (seen.current.has(p.id)) return;
          seen.current.add(p.id);
          setParades((prev) => [p, ...prev].slice(0, 50));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "parades" },
        (payload) => {
          const p = payload.new as Parade;
          setParades((prev) =>
            prev.map((x) => (x.id === p.id ? { ...x, hype_count: p.hype_count } : x)),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return (
    <div className="mt-5 flex flex-col gap-3">
      {parades.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          No parades yet. Nail an exact scoreline to start one.
        </p>
      ) : (
        parades.map((p) => (
          <Card
            key={p.id}
            p={p}
            hyped={hyped.has(p.id)}
            signedIn={signedIn}
            onHyped={() => setHyped((s) => new Set(s).add(p.id))}
          />
        ))
      )}
    </div>
  );
}

function Card({
  p,
  hyped,
  signedIn,
  onHyped,
}: {
  p: Parade;
  hyped: boolean;
  signedIn: boolean;
  onHyped: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [count, setCount] = useState(p.hype_count);
  const [done, setDone] = useState(hyped);

  function hype() {
    if (done || !signedIn) return;
    setDone(true);
    setCount((c) => c + 1);
    onHyped();
    startTransition(async () => {
      const res = await hypeParade(p.id);
      if (res.ok && typeof res.hype === "number") setCount(res.hype);
    });
  }

  return (
    <div className="rounded-2xl border border-glory/30 bg-glory/5 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-glory">
        🎉 {p.username ?? "A manager"}
      </div>
      <p className="mt-1 text-base font-bold leading-snug">{p.headline}</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={hype}
          disabled={pending || done || !signedIn}
          className={`flex h-9 items-center gap-1 rounded-full px-3 text-sm font-bold transition active:scale-95 ${
            done
              ? "bg-pitch/20 text-pitch"
              : "bg-pitch text-black disabled:opacity-60"
          }`}
        >
          🔥 {count}
        </button>
        <ShareButton
          url={SITE_URL}
          text={`${p.headline} — Pitch Gods 🔥`}
          label="Share"
          variant="ghost"
        />
      </div>
    </div>
  );
}
