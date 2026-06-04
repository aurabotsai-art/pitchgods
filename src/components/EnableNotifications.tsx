"use client";

import { useEffect, useState } from "react";

function urlB64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function EnableNotifications() {
  const [state, setState] = useState<
    "idle" | "on" | "denied" | "unsupported" | "working"
  >("idle");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "granted") setState("on");
    else if (Notification.permission === "denied") setState("denied");
  }, []);

  async function enable() {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState("denied");
        return;
      }
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(key!),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setState("on");
    } catch {
      setState("idle");
    }
  }

  if (state === "unsupported") return null;
  if (state === "on")
    return (
      <div className="mt-3 rounded-2xl surface px-4 py-3 text-center text-xs text-zinc-500">
        🔔 Notifications on — we&apos;ll nudge you before kickoff &amp; if your streak&apos;s at risk.
      </div>
    );

  return (
    <button
      onClick={enable}
      disabled={state === "working"}
      className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl border border-white/15 text-sm font-semibold text-zinc-200 transition active:scale-[0.98] disabled:opacity-60"
    >
      {state === "working"
        ? "…"
        : state === "denied"
          ? "🔔 Notifications blocked — enable in browser settings"
          : "🔔 Turn on match + streak alerts"}
    </button>
  );
}
