import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminRewards } from "@/components/AdminRewards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Rewards", robots: { index: false } };

export default async function AdminRewardsPage() {
  const sb = await createClient();
  const { data: claimData } = await sb.auth.getClaims();
  if (!claimData?.claims?.sub) redirect("/");

  // admin_list_redemptions enforces is_admin server-side; non-admins get ok:false
  const [{ data: listRes }, { data: stockRes }, { data: tiers }] =
    await Promise.all([
      sb.rpc("admin_list_redemptions", { p_status: null }),
      sb.rpc("admin_voucher_stock"),
      sb.from("reward_tiers").select("id, label").order("sort"),
    ]);

  const list = listRes as { ok: boolean; rows?: unknown[] } | null;
  if (!list?.ok) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
        <Link href="/home" className="text-sm text-zinc-500">
          ← Home
        </Link>
        <h1 className="mt-6 text-2xl font-bold">Admin · Rewards</h1>
        <p className="mt-3 text-sm text-zinc-400">
          You don&apos;t have admin access. Ask an owner to set{" "}
          <code className="text-glory">profiles.is_admin = true</code> for your
          account.
        </p>
      </main>
    );
  }

  const stock = stockRes as { ok: boolean; rows?: unknown[] } | null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-glory">
          Admin · Rewards
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-bold">Redemptions</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Review requests, upload codes, send vouchers.
      </p>

      <AdminRewards
        rows={(list.rows ?? []) as never}
        stock={(stock?.rows ?? []) as never}
        tiers={(tiers ?? []) as never}
      />
    </main>
  );
}
