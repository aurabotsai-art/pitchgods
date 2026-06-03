import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GuestButton } from "@/components/GuestButton";
import { AgentJoin, AgentPanel, type Deal } from "@/components/AgentDashboard";

export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let agent: { code: string; total_earned: number } | null = null;
  let deals: Deal[] = [];
  if (user) {
    const { data: a } = await supabase
      .from("agents")
      .select("code, total_earned")
      .eq("user_id", user.id)
      .maybeSingle();
    agent = a;
    if (a) {
      const { data: d } = await supabase
        .from("sponsor_deals")
        .select(
          "id, sponsor_name, slot, amount, currency, commission_rate, commission_amount, status",
        )
        .order("created_at", { ascending: false });
      deals = (d ?? []) as Deal[];
    }
  }

  const paidCount = deals.filter((d) => d.status === "paid").length;
  const rate = paidCount >= 10 ? 0.4 : paidCount >= 3 ? 0.3 : 0.25;
  const pendingEarned = deals
    .filter((d) => d.status === "pending" || d.status === "confirmed")
    .reduce((s, d) => s + Number(d.commission_amount), 0);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-pitch">
          Agents
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-black tracking-tight">Agent Army</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Close sponsors. Earn a cut. No cap.
      </p>

      {!user ? (
        <div className="mt-8 flex flex-col gap-3">
          <p className="text-center text-sm text-zinc-400">
            Sign in to start earning.
          </p>
          <GuestButton label="Play / join as guest" />
        </div>
      ) : agent ? (
        <AgentPanel
          code={agent.code}
          rate={rate}
          paidEarned={Number(agent.total_earned)}
          pendingEarned={pendingEarned}
          deals={deals}
        />
      ) : (
        <AgentJoin />
      )}
    </main>
  );
}
