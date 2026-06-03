import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTeams } from "@/lib/data";
import { MetaForm } from "@/components/MetaForm";

export const dynamic = "force-dynamic";

export default async function PredictPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const teams = (await getTeams()).sort((a, b) => a.name.localeCompare(b.name));

  const initial: {
    champion?: string;
    dark_horse?: string;
    golden_boot?: string;
  } = {};
  if (user) {
    const { data } = await supabase
      .from("meta_predictions")
      .select("kind, payload")
      .eq("user_id", user.id);
    for (const r of data ?? []) {
      const p = r.payload as { code?: string; player?: string };
      if (r.kind === "champion") initial.champion = p.code;
      if (r.kind === "dark_horse") initial.dark_horse = p.code;
      if (r.kind === "golden_boot") initial.golden_boot = p.player;
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-pitch">
          Tournament calls
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-black tracking-tight">Your big calls</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Set them once. They ride the whole World Cup — and pay massive if you
        nailed it.
      </p>

      <MetaForm teams={teams} initial={initial} signedIn={!!user} />
    </main>
  );
}
