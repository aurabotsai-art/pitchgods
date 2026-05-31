"use client";

import { useEffect, useState } from "react";

export function KickoffTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const d = new Date(iso);
    const now = Date.now();
    const diffMs = d.getTime() - now;
    const diffMin = Math.round(diffMs / 60000);

    let rel = "";
    if (diffMin <= 0) rel = "live / done";
    else if (diffMin < 60) rel = `in ${diffMin}m`;
    else if (diffMin < 1440) rel = `in ${Math.round(diffMin / 60)}h`;
    else rel = `in ${Math.round(diffMin / 1440)}d`;

    const time = d.toLocaleString(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    setLabel(`${time} · ${rel}`);
  }, [iso]);

  return <span suppressHydrationWarning>{label || " "}</span>;
}
