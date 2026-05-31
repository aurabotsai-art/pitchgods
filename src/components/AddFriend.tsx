"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addFriend } from "@/app/leaderboard/actions";

export function AddFriend() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function submit() {
    setMsg(null);
    startTransition(async () => {
      const res = await addFriend(name);
      if (res.ok) {
        setMsg({ ok: true, text: `Added ${res.friend}. Game on.` });
        setName("");
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error ?? "Could not add." });
      }
    });
  }

  return (
    <div className="mt-6">
      <label className="text-sm font-medium text-zinc-300">Add a friend</label>
      <div className="mt-2 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="their manager name"
          maxLength={20}
          className="h-12 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-base outline-none focus:border-pitch"
        />
        <button
          onClick={submit}
          disabled={pending}
          className="h-12 rounded-xl bg-pitch px-5 text-sm font-bold text-black disabled:opacity-60"
        >
          {pending ? "…" : "Add"}
        </button>
      </div>
      {msg && (
        <p className={`mt-2 text-sm ${msg.ok ? "text-pitch" : "text-red-400"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
