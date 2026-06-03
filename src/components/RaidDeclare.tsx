"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { declareRaid } from "@/app/clubs/actions";

export function RaidDeclare({
  fixtures,
}: {
  fixtures: { id: number; label: string }[];
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [fid, setFid] = useState(fixtures[0]?.id ?? 0);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function declare() {
    setMsg(null);
    if (!code.trim()) return setMsg({ ok: false, text: "Enter the rival's club code." });
    start(async () => {
      const res = await declareRaid(code, Number(fid));
      if (res.ok) {
        setMsg({ ok: true, text: "Raid declared! 🏴 They've been challenged." });
        setCode("");
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error ?? "Failed." });
      }
    });
  }

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
      <p className="text-sm font-bold">⚔️ Declare a raid</p>
      <p className="mt-1 text-xs text-zinc-400">
        Challenge a rival club on an upcoming match. Most member points wins
        territory.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={5}
        placeholder="Rival club code"
        className="mt-3 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm uppercase tracking-widest outline-none focus:border-pitch"
      />
      <select
        value={fid}
        onChange={(e) => setFid(Number(e.target.value))}
        className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-zinc-900 px-3 text-sm"
      >
        {fixtures.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <button
        onClick={declare}
        disabled={pending || fixtures.length === 0}
        className="mt-3 h-11 w-full rounded-xl bg-red-500 text-sm font-bold text-white disabled:opacity-50"
      >
        Declare raid
      </button>
      {msg && (
        <p className={`mt-2 text-sm ${msg.ok ? "text-pitch" : "text-red-400"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
