"use client";

import { useState, useTransition } from "react";
import { toggleRsvp } from "@/app/parties/actions";

export function RsvpButton({
  partyId,
  initialGoing,
  initialCount,
}: {
  partyId: number;
  initialGoing: boolean;
  initialCount: number;
}) {
  const [going, setGoing] = useState(initialGoing);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  function toggle() {
    start(async () => {
      const res = await toggleRsvp(partyId);
      if (res.ok && typeof res.going === "boolean") {
        setGoing(res.going);
        setCount((c) => c + (res.going ? 1 : -1));
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`h-12 w-full rounded-2xl text-sm font-bold transition active:scale-[0.98] disabled:opacity-60 ${
        going
          ? "border border-glory/40 bg-glory/10 text-glory"
          : "bg-glory text-black"
      }`}
    >
      {going ? `✓ You're going · ${count} coming` : `I'm coming (${count})`}
    </button>
  );
}
