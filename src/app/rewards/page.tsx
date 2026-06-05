import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RewardsCatalog } from "@/components/RewardsCatalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Rewards — redeem your coins for iShopping.pk vouchers",
  description:
    "Spend the coins you earn playing Pitch Gods on real iShopping.pk shopping vouchers. Free to play, no betting.",
  alternates: { canonical: "/rewards" },
};

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending review", cls: "text-zinc-400" },
  approved: { label: "Approved", cls: "text-pitch-bright" },
  voucher_sent: { label: "Voucher sent", cls: "text-glory" },
  rejected: { label: "Rejected · coins refunded", cls: "text-red-400" },
  completed: { label: "Completed", cls: "text-pitch-bright" },
};

export default async function RewardsPage() {
  const sb = await createClient();
  const { data: claimData } = await sb.auth.getClaims();
  const uid = claimData?.claims?.sub as string | undefined;
  if (!uid) redirect("/");
  const email = (claimData?.claims?.email as string | undefined) ?? "";

  const [{ data: profile }, { data: tiers }, { data: history }] =
    await Promise.all([
      sb.from("profiles").select("username, coins, is_guest").eq("id", uid).single(),
      sb
        .from("reward_tiers")
        .select("id, label, points_cost, voucher_value_pkr")
        .eq("active", true)
        .order("sort", { ascending: true }),
      sb
        .from("voucher_redemptions")
        .select("id, status, points_spent, voucher_code, email, created_at, tier_id")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const coins = (profile?.coins as number) ?? 0;
  const tierLabel = new Map(
    (tiers ?? []).map((t) => [t.id as number, t.label as string]),
  );

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-glory">
          Rewards
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-bold">Rewards</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Turn the coins you earn into real iShopping.pk vouchers.
      </p>

      <div className="card card-glow-glory mt-6 flex items-center justify-between p-5">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Your balance
          </div>
          <div className="font-display text-3xl font-bold tabular-nums text-glory">
            {coins.toLocaleString()} <span className="text-base">coins</span>
          </div>
        </div>
        <span className="text-4xl">🪙</span>
      </div>

      {profile?.is_guest && (
        <div className="mt-4 rounded-2xl border border-glory/30 bg-glory/5 p-4 text-sm">
          <p className="font-semibold text-glory">Playing as a guest</p>
          <p className="mt-1 text-zinc-300">
            You can earn and see coins, but{" "}
            <strong>redeeming vouchers requires a full account</strong>. Sign in
            with Google (your coins carry over) to redeem.
          </p>
        </div>
      )}

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-zinc-300">
        Voucher catalog
      </h2>
      <RewardsCatalog
        tiers={(tiers ?? []) as never}
        coins={coins}
        defaultEmail={email}
      />

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-zinc-300">
        Redemption history
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        {(history ?? []).length === 0 ? (
          <p className="py-3 text-center text-xs text-zinc-500">
            No redemptions yet. Earn coins by playing, then cash them in.
          </p>
        ) : (
          (history ?? []).map((r) => {
            const s = STATUS[r.status as string] ?? STATUS.pending;
            return (
              <div key={r.id} className="surface rounded-xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">
                    {tierLabel.get(r.tier_id as number) ?? "Voucher"}
                  </span>
                  <span className={`text-xs font-semibold ${s.cls}`}>
                    {s.label}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {(r.points_spent as number).toLocaleString()} coins ·{" "}
                  {new Date(r.created_at as string).toLocaleDateString()}
                </div>
                {r.voucher_code && (
                  <div className="mt-2 rounded-lg border border-glory/30 bg-glory/5 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">
                      Your voucher code
                    </div>
                    <div className="font-mono text-base font-bold tracking-wide text-glory">
                      {r.voucher_code as string}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
