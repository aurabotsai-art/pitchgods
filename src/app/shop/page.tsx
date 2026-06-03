import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShopGrid, type ShopItem } from "@/components/ShopGrid";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from("shop_items")
    .select("id, title, description, kind, cost_coins, sponsor_name, stock")
    .eq("active", true)
    .order("sort", { ascending: true });

  let balance = 0;
  if (user) {
    const { data: p } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", user.id)
      .single();
    balance = p?.coins ?? 0;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-zinc-500" prefetch>
          ← Home
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-glory">
          Shop
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-black tracking-tight">Coin shop</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Earn Coins by playing. Spend them on flexes + sponsor drops. No cash, ever.
      </p>

      <ShopGrid
        items={(items ?? []) as ShopItem[]}
        balance={balance}
        signedIn={!!user}
      />
    </main>
  );
}
