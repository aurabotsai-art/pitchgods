"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCountry } from "@/app/home/actions";
import { COUNTRIES } from "@/lib/countries";
import { Flag } from "@/components/Flag";

export function CountryPicker({ current }: { current: string | null }) {
  const router = useRouter();
  const [code, setCode] = useState(current ?? "");
  const [, start] = useTransition();

  function change(c: string) {
    setCode(c);
    start(async () => {
      await setCountry(c);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl surface px-4 py-3">
      {code ? (
        <Flag slug={code} size={24} />
      ) : (
        <span className="text-lg">🌍</span>
      )}
      <span className="flex-1 text-sm text-zinc-300">Repping</span>
      <select
        value={code}
        onChange={(e) => change(e.target.value)}
        className="rounded-lg border border-white/15 bg-zinc-900 px-2 py-1.5 text-sm"
      >
        <option value="">Pick country</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
