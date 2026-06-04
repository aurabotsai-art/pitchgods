"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createParty, type PartyKind } from "@/app/parties/actions";

const KINDS: { id: PartyKind; label: string; icon: string; hint: string }[] = [
  { id: "watch_party", label: "Watch party", icon: "🍿", hint: "Watch a match together" },
  { id: "parade", label: "Parade", icon: "🎉", hint: "Celebrate a win / title" },
  { id: "raid", label: "Raid", icon: "⚔️", hint: "Roll up somewhere as a crew" },
];

export function PartyHost({
  fixtures,
}: {
  fixtures: { id: number; label: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<PartyKind>("watch_party");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [fixtureId, setFixtureId] = useState<string>("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function submit() {
    setMsg(null);
    if (!title.trim()) return setMsg("Give your party a title.");
    if (!location.trim()) return setMsg("Where's it happening?");
    if (!startsAt) return setMsg("Pick a start time.");
    let iso: string;
    try {
      iso = new Date(startsAt).toISOString();
    } catch {
      return setMsg("That start time looks off.");
    }
    start(async () => {
      const res = await createParty({
        kind,
        title,
        details,
        location,
        startsAt: iso,
        fixtureId: fixtureId ? Number(fixtureId) : null,
      });
      if (res.ok && res.id) router.push(`/parties/${res.id}`);
      else setMsg(res.error ?? "Failed.");
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-glory text-base font-bold text-black transition active:scale-[0.98]"
      >
        🎉 Host a party
      </button>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-glory/30 bg-glory/5 p-4">
      <p className="text-sm font-bold">Host a party</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            onClick={() => setKind(k.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition ${
              kind === k.id
                ? "border-glory bg-glory/20"
                : "border-white/10 bg-white/5"
            }`}
          >
            <span className="text-xl">{k.icon}</span>
            <span className="text-[11px] font-semibold">{k.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-zinc-400">
        {KINDS.find((k) => k.id === kind)?.hint}
      </p>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={60}
        placeholder="Title — e.g. Argentina vs Brazil at mine 🍿"
        className="mt-3 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-glory"
      />
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        maxLength={280}
        rows={2}
        placeholder="The plan (optional) — bring snacks, kickoff sharp, etc."
        className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-glory"
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        maxLength={80}
        placeholder="Location — venue / area / 'DM for address'"
        className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-glory"
      />
      <label className="mt-2 block text-[11px] uppercase tracking-wide text-zinc-500">
        Starts
      </label>
      <input
        type="datetime-local"
        value={startsAt}
        onChange={(e) => setStartsAt(e.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-glory"
      />
      {fixtures.length > 0 && (
        <select
          value={fixtureId}
          onChange={(e) => setFixtureId(e.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-glory"
        >
          <option value="">Tie to a match (optional)</option>
          {fixtures.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="h-11 flex-1 rounded-xl border border-white/15 text-sm font-semibold text-zinc-300"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={pending}
          className="h-11 flex-[2] rounded-xl bg-glory text-sm font-bold text-black disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create party"}
        </button>
      </div>

      <p className="mt-3 text-[11px] leading-snug text-zinc-500">
        Stay safe: meet in public, never share your home address publicly, and
        don&apos;t go alone to meet strangers.
      </p>
      {msg && <p className="mt-2 text-center text-sm text-red-400">{msg}</p>}
    </div>
  );
}
