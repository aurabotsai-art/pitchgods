"use client";

import { useEffect, useState } from "react";

// Renders a UTC ISO timestamp in the visitor's local timezone. Falls back to a
// stable server-rendered string to avoid hydration mismatch.
export function LocalTime({ iso, mode = "full" }: { iso: string; mode?: "full" | "short" }) {
  const [text, setText] = useState<string>(() =>
    new Date(iso).toUTCString().replace(" GMT", " UTC"),
  );
  useEffect(() => {
    const d = new Date(iso);
    setText(
      d.toLocaleString(undefined, {
        weekday: mode === "full" ? "short" : undefined,
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [iso, mode]);
  return <span suppressHydrationWarning>{text}</span>;
}
