"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLeague, joinLeague } from "@/app/leagues/actions";

export function LeaguesManager() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function make() {
    setMsg(null);
    if (!name.trim()) return setMsg({ ok: false, text: "Name your league." });
    start(async () => {
      const res = await createLeague(name);
      if (res.ok && res.id) router.push(`/leagues/${res.id}`);
      else setMsg({ ok: false, text: res.error ?? "Failed." });
    });
  }

  function join() {
    setMsg(null);
    if (!code.trim()) return setMsg({ ok: false, text: "Enter a code." });
    start(async () => {
      const res = await joinLeague(code);
      if (res.ok && res.id) router.push(`/leagues/${res.id}`);
      else setMsg({ ok: false, text: res.error ?? "Failed." });
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="rounded-2xl border border-pitch/30 bg-pitch/5 p-4">
        <p className="text-sm font-bold">Start a private league</p>
        <p className="mt-1 text-xs text-zinc-400">
          For your uni, club, work crew or group chat. You get a code to share —
          everyone who joins competes on your own private table.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="e.g. Gulshan Lads, Class of '26, The Office"
          className="mt-3 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-pitch"
        />
        <button
          onClick={make}
          disabled={pending}
          className="mt-3 h-11 w-full rounded-xl bg-pitch text-sm font-bold text-black disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create league"}
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-bold">Join with a code</p>
        <div className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ABC123"
            className="h-11 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 text-sm uppercase tracking-widest outline-none focus:border-pitch"
          />
          <button
            onClick={join}
            disabled={pending}
            className="h-11 rounded-xl bg-white/10 px-5 text-sm font-bold disabled:opacity-60"
          >
            Join
          </button>
        </div>
      </div>

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
