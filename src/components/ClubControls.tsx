"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { leaveClub } from "@/app/clubs/actions";
import { ShareButton } from "@/components/ShareButton";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchperfect-sooty.vercel.app";

export function ClubControls({
  clubId,
  name,
  code,
  isMember,
}: {
  clubId: number;
  name: string;
  code: string;
  isMember: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function leave() {
    start(async () => {
      await leaveClub(clubId);
      router.push("/clubs");
      router.refresh();
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <ShareButton
        url={`${SITE_URL}/clubs`}
        text={`Join my The Gaffer club "${name}" — code ${code} 🛡️`}
        label="Invite to club (WhatsApp)"
      />
      {isMember && (
        <button
          onClick={leave}
          disabled={pending}
          className="h-10 text-sm text-zinc-500 underline underline-offset-4"
        >
          Leave club
        </button>
      )}
    </div>
  );
}
