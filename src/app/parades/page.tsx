import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ParadeFeed, type Parade } from "@/components/ParadeFeed";

export const dynamic = "force-dynamic";

export default async function ParadesPage() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const user = claimData?.claims?.sub
    ? { id: claimData.claims.sub as string }
    : null;

  const { data: parades } = await supabase
    .from("parades")
    .select("id, type, headline, username, hype_count, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  let hypedIds: number[] = [];
  if (user) {
    const { data } = await supabase
      .from("parade_hypes")
      .select("parade_id")
      .eq("user_id", user.id);
    hypedIds = (data ?? []).map((r) => r.parade_id as number);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-glory">
          Parades
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-black tracking-tight">The parade</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Big calls get celebrated. Tap 🔥 to hype your friends.
      </p>

      <ParadeFeed
        initial={(parades ?? []) as Parade[]}
        hypedIds={hypedIds}
        signedIn={!!user}
      />
    </main>
  );
}
