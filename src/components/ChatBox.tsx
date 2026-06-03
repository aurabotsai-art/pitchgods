"use client";

import { useEffect, useRef, useState } from "react";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendChat } from "@/app/clubs/actions";

export type ChatMsg = {
  id: number;
  username: string | null;
  body: string;
  user_id: string;
  created_at: string;
};

export function ChatBox({
  scope,
  scopeId,
  initial,
  signedIn,
  meId,
}: {
  scope: "club" | "room";
  scopeId: number;
  initial: ChatMsg[];
  signedIn: boolean;
  meId: string | null;
}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(initial);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const seen = useRef(new Set(initial.map((m) => m.id)));
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel(`chat-${scope}-${scopeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `scope_id=eq.${scopeId}`,
        },
        (payload) => {
          const m = payload.new as ChatMsg & { scope: string };
          if (m.scope !== scope || seen.current.has(m.id)) return;
          seen.current.add(m.id);
          setMsgs((p) => [...p, m].slice(-100));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [scope, scopeId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function send() {
    const body = text.trim();
    if (!body) return;
    setErr(null);
    setText("");
    start(async () => {
      const res = await sendChat(scope, scopeId, body);
      if (!res.ok) {
        setErr(res.error ?? "Failed");
        setTimeout(() => setErr(null), 2500);
      }
    });
  }

  return (
    <div className="flex flex-col">
      <div className="flex h-64 flex-col gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-3">
        {msgs.length === 0 ? (
          <p className="m-auto text-sm text-zinc-600">Say something…</p>
        ) : (
          msgs.map((m) => (
            <div key={m.id} className="text-sm leading-snug">
              <span
                className={`font-bold ${
                  m.user_id === meId ? "text-pitch" : "text-glory"
                }`}
              >
                {m.username ?? "Guest"}
              </span>
              <span className="text-zinc-500"> · </span>
              <span className="text-zinc-200">{m.body}</span>
            </div>
          ))
        )}
        <div ref={bottom} />
      </div>

      {signedIn ? (
        <div className="mt-2 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            maxLength={300}
            placeholder="Message…"
            className="h-11 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-pitch"
          />
          <button
            onClick={send}
            disabled={pending}
            className="h-11 rounded-xl bg-pitch px-4 text-sm font-bold text-black disabled:opacity-60"
          >
            Send
          </button>
        </div>
      ) : (
        <p className="mt-2 text-center text-xs text-zinc-500">
          Sign in to chat.
        </p>
      )}
      {err && <p className="mt-1 text-xs text-red-400">{err}</p>}
    </div>
  );
}
