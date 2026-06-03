"use client";

import { useEffect, useRef, useState } from "react";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveLivePrediction } from "@/app/matches/[id]/live-actions";
import { GuestButton } from "@/components/GuestButton";
import { ChatBox, type ChatMsg } from "@/components/ChatBox";

type Ev = {
  id: number;
  minute: number | null;
  type: string;
  text: string;
  created_at: string;
};

export function LiveRoom({
  fixtureId,
  homeName,
  awayName,
  initialScore,
  initialMinute,
  initialEvents,
  initialOpenPick,
  signedIn,
  initialChat,
  meId,
}: {
  fixtureId: number;
  homeName: string;
  awayName: string;
  initialScore: [number, number];
  initialMinute: number | null;
  initialEvents: Ev[];
  initialOpenPick: "home" | "away" | "none" | null;
  signedIn: boolean;
  initialChat: ChatMsg[];
  meId: string | null;
}) {
  const [score, setScore] = useState(initialScore);
  const [minute, setMinute] = useState(initialMinute);
  const [status, setStatus] = useState<string>("live");
  const [events, setEvents] = useState<Ev[]>(initialEvents);
  const [watching, setWatching] = useState(1);
  const [openPick, setOpenPick] = useState(initialOpenPick);
  const [flash, setFlash] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const seen = useRef(new Set(initialEvents.map((e) => e.id)));

  useEffect(() => {
    const supabase = createClient();

    const ch = supabase
      .channel(`room-${fixtureId}`, {
        config: { presence: { key: Math.random().toString(36).slice(2) } },
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fixtures",
          filter: `id=eq.${fixtureId}`,
        },
        (payload) => {
          const f = payload.new as {
            score_home: number | null;
            score_away: number | null;
            minute: number | null;
            status: string;
          };
          setScore([f.score_home ?? 0, f.score_away ?? 0]);
          setMinute(f.minute);
          setStatus(f.status);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_events",
          filter: `fixture_id=eq.${fixtureId}`,
        },
        (payload) => {
          const ev = payload.new as Ev;
          if (seen.current.has(ev.id)) return;
          seen.current.add(ev.id);
          setEvents((prev) => [ev, ...prev].slice(0, 60));
          if (ev.type === "goal") {
            // next goal resolved -> let them call the next one
            setOpenPick(null);
            setFlash("Goal! Next-goal call resolved — pick again.");
            setTimeout(() => setFlash(null), 4000);
          }
        },
      )
      .on("presence", { event: "sync" }, () => {
        setWatching(Object.keys(ch.presenceState()).length || 1);
      })
      .subscribe(async (s) => {
        if (s === "SUBSCRIBED") await ch.track({ at: Date.now() });
      });

    return () => {
      supabase.removeChannel(ch);
    };
  }, [fixtureId]);

  function call(pick: "home" | "away" | "none") {
    if (openPick) return;
    setOpenPick(pick);
    startTransition(async () => {
      const res = await saveLivePrediction(fixtureId, pick);
      if (!res.ok) {
        setOpenPick(null);
        setFlash(res.error ?? "Could not lock.");
        setTimeout(() => setFlash(null), 3000);
      }
    });
  }

  const live = status === "live";

  return (
    <div className="mt-6">
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-1 text-xs font-bold text-red-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          {live ? `LIVE ${minute ? minute + "'" : ""}` : "FULL TIME"}
        </div>
        <span className="text-xs text-zinc-500">· {watching} watching</span>
      </div>

      <div className="mt-3 text-center text-5xl font-black tabular-nums">
        {score[0]}<span className="px-2 text-zinc-600">–</span>{score[1]}
      </div>

      {flash && (
        <p className="mt-3 text-center text-sm font-semibold text-glory">
          {flash}
        </p>
      )}

      {live && (
        <div className="mt-6">
          <p className="mb-2 text-center text-sm font-semibold text-zinc-300">
            Who scores next? <span className="text-zinc-500">+5</span>
          </p>
          {!signedIn ? (
            <GuestButton label="Play live as guest" />
          ) : openPick ? (
            <div className="rounded-2xl border border-pitch/40 bg-pitch/10 p-4 text-center text-sm font-semibold text-pitch">
              Locked: {openPick === "none" ? "No more goals" : openPick === "home" ? homeName : awayName}
              <div className="mt-1 text-xs font-normal text-zinc-400">
                Resolves on the next goal.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <CallBtn onClick={() => call("home")} disabled={pending}>
                {homeName}
              </CallBtn>
              <CallBtn onClick={() => call("none")} disabled={pending}>
                No more
              </CallBtn>
              <CallBtn onClick={() => call("away")} disabled={pending}>
                {awayName}
              </CallBtn>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Commentary
        </p>
        <div className="flex flex-col gap-2">
          {events.length === 0 ? (
            <p className="text-sm text-zinc-600">Waiting for the action…</p>
          ) : (
            events.map((e) => (
              <div
                key={e.id}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  e.type === "goal"
                    ? "border-glory/40 bg-glory/10 font-semibold"
                    : "border-white/10 bg-white/[0.03] text-zinc-300"
                }`}
              >
                {e.text}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Room chat
        </p>
        <ChatBox
          scope="room"
          scopeId={fixtureId}
          initial={initialChat}
          signedIn={signedIn}
          meId={meId}
        />
      </div>
    </div>
  );
}

function CallBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-14 rounded-xl border border-white/15 bg-white/5 px-2 text-sm font-semibold text-zinc-100 transition active:scale-[0.97] disabled:opacity-50"
    >
      {children}
    </button>
  );
}
