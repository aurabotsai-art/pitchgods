import Link from "next/link";
import { getSponsor } from "@/lib/data";
import { SponsorCard } from "./SponsorCard";

export async function SponsorSlot({ slot }: { slot: string }) {
  const sponsor = await getSponsor(slot);
  if (sponsor) return <SponsorCard sponsor={sponsor} />;

  // House ad: every empty slot sells itself.
  return (
    <Link
      href="/sponsors"
      className="flex items-center justify-between rounded-2xl border border-dashed border-white/15 px-4 py-3 text-zinc-400 transition active:scale-[0.99]"
    >
      <span className="text-sm font-semibold">📣 Your brand here</span>
      <span className="text-xs text-pitch">Sponsor the World Cup craze →</span>
    </Link>
  );
}
