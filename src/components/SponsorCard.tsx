"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Sponsor } from "@/lib/data";

export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const sb = createClient();
    sb.rpc("sponsor_event", { p_id: sponsor.id, p_kind: "impression" });
  }, [sponsor.id]);

  function onClick() {
    const sb = createClient();
    sb.rpc("sponsor_event", { p_id: sponsor.id, p_kind: "click" });
  }

  return (
    <a
      href={sponsor.link_url ?? "#"}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-pitch/30 bg-pitch/5 px-4 py-3 transition active:scale-[0.99]"
    >
      {sponsor.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          width={36}
          height={36}
          className="h-9 w-9 rounded-lg object-contain"
        />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pitch/20 text-sm font-black text-pitch">
          {sponsor.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-zinc-500">
          Sponsored
        </div>
        <div className="truncate text-sm font-bold">{sponsor.name}</div>
        {sponsor.blurb && (
          <div className="truncate text-xs text-zinc-400">{sponsor.blurb}</div>
        )}
      </div>
      <span className="text-xs font-semibold text-pitch">Open →</span>
    </a>
  );
}
