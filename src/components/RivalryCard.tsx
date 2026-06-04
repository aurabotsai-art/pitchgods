import { ShareButton } from "@/components/ShareButton";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchgods.com";

export type Rivalry = {
  rival: { name: string; glory: number } | null;
  me_glory?: number;
  my_wins?: number;
  their_wins?: number;
  draws?: number;
};

export function RivalryCard({
  data,
  myName,
}: {
  data: Rivalry;
  myName: string;
}) {
  if (!data?.rival) return null;
  const { rival } = data;
  const mw = data.my_wins ?? 0;
  const tw = data.their_wins ?? 0;
  const ahead = (data.me_glory ?? 0) >= rival.glory;
  const h2hLead = mw > tw ? "you" : tw > mw ? "them" : "level";

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
          ⚔️ Your rival
        </span>
        <span className="text-[10px] uppercase tracking-wide text-zinc-500">
          {h2hLead === "you"
            ? "You lead"
            : h2hLead === "them"
              ? "Revenge time"
              : "Dead level"}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{myName}</div>
          <div className="text-xs text-glory">{data.me_glory ?? 0} Glory</div>
        </div>
        <div className="px-2 text-center">
          <div className="text-lg font-black tabular-nums">
            {mw}–{tw}
          </div>
          <div className="text-[10px] text-zinc-500">H2H</div>
        </div>
        <div className="min-w-0 text-right">
          <div className="truncate text-sm font-bold">{rival.name}</div>
          <div className="text-xs text-glory">{rival.glory} Glory</div>
        </div>
      </div>

      <div className="mt-3">
        <ShareButton
          url={SITE_URL}
          text={
            ahead
              ? `I'm beating ${rival.name} ${mw}–${tw} in Pitch Gods ⚔️ catch me if you can`
              : `${rival.name} is ahead of me in Pitch Gods... not for long 😤 come watch the revenge`
          }
          label="Talk trash (WhatsApp)"
          variant="ghost"
        />
      </div>
    </div>
  );
}
