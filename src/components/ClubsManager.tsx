"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClub, joinClub } from "@/app/clubs/actions";

export function ClubsManager() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [crest, setCrest] = useState("🛡️");
  const [motto, setMotto] = useState("");
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const crests = ["🛡️", "🦁", "🔥", "⚡", "👑", "🐉", "🦅", "💀", "🌟", "🐺"];

  function make() {
    setMsg(null);
    if (!name.trim()) return setMsg({ ok: false, text: "Name your club." });
    start(async () => {
      const res = await createClub({ name, crest, motto });
      if (res.ok && res.id) router.push(`/clubs/${res.id}`);
      else setMsg({ ok: false, text: res.error ?? "Failed." });
    });
  }

  function join() {
    setMsg(null);
    if (!code.trim()) return setMsg({ ok: false, text: "Enter a code." });
    start(async () => {
      const res = await joinClub(code);
      if (res.ok && res.id) router.push(`/clubs/${res.id}`);
      else setMsg({ ok: false, text: res.error ?? "Failed." });
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="rounded-2xl border border-pitch/30 bg-pitch/5 p-4">
        <p className="text-sm font-bold">Start a club</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {crests.map((c) => (
            <button
              key={c}
              onClick={() => setCrest(c)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${
                crest === c ? "bg-pitch/30 ring-2 ring-pitch" : "bg-white/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          placeholder="Club name"
          className="mt-3 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-pitch"
        />
        <input
          value={motto}
          onChange={(e) => setMotto(e.target.value)}
          maxLength={60}
          placeholder="Motto (optional)"
          className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-pitch"
        />
        <button
          onClick={make}
          disabled={pending}
          className="mt-3 h-11 w-full rounded-xl bg-pitch text-sm font-bold text-black disabled:opacity-60"
        >
          Create club
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-bold">Join with a code</p>
        <div className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={5}
            placeholder="ABCDE"
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
        <p className={`text-center text-sm ${msg.ok ? "text-pitch" : "text-red-400"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
