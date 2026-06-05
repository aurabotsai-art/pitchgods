import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/ShareButton";
import { SponsorSlot } from "@/components/SponsorSlot";
import { ChaosBanner } from "@/components/ChaosBanner";
import { HotTakeCard } from "@/components/HotTakeCard";
import { getActiveHotTake } from "@/lib/data";
import { StreakControls } from "@/components/StreakControls";
import { CountryPicker } from "@/components/CountryPicker";
import { RivalryCard, type Rivalry } from "@/components/RivalryCard";
import { EnableNotifications } from "@/components/EnableNotifications";
import { UserName } from "@/components/UserName";
import { ReferralClaim } from "@/components/ReferralClaim";
import { tierForGlory } from "@/lib/tiers";
import { setUsername, signOut } from "./actions";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchgods.com";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const uid = (claimData?.claims?.sub as string | undefined) ?? null;
  if (!uid) redirect("/");

  // independent reads in one parallel wave
  const [{ data: profile }, hotTake, { data: rivalry }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "username, glory, coins, level, streak_count, hot_streak, streak_freezes, flag_country, name_color, flair, is_guest",
      )
      .eq("id", uid)
      .single(),
    getActiveHotTake(),
    supabase.rpc("get_rivalry"),
  ]);

  const name = profile?.username ?? "Manager";

  let myVote: boolean | null = null;
  if (hotTake) {
    const { data: hv } = await supabase
      .from("hot_take_votes")
      .select("vote")
      .eq("hot_take_id", hotTake.id)
      .eq("user_id", uid)
      .maybeSingle();
    myVote = hv?.vote ?? null;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
      <ReferralClaim />
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gradient-pitch">
          Pitch Gods
        </span>
        {profile?.is_guest && (
          <span className="chip px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-glory">
            Guest
          </span>
        )}
      </div>

      <h1 className="mt-6 text-3xl font-bold">
        Welcome,{" "}
        <UserName name={name} color={profile?.name_color} flair={profile?.flair} />.
      </h1>
      <div className="chip mt-3 w-fit px-3 py-1 text-xs font-bold uppercase tracking-wide text-glory">
        {tierForGlory(profile?.glory ?? 0).name}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        <Stat label="Glory" value={profile?.glory ?? 0} accent="text-glory" />
        <Stat
          label="Day streak"
          value={profile?.streak_count ?? 0}
          accent="text-pitch"
          flame={(profile?.streak_count ?? 0) > 0}
        />
        <Stat label="Level" value={profile?.level ?? 1} accent="text-zinc-200" />
      </div>

      <StreakControls
        hotStreak={profile?.hot_streak ?? 0}
        freezes={profile?.streak_freezes ?? 0}
      />

      <CountryPicker current={profile?.flag_country ?? null} />

      <EnableNotifications />

      <div className="mt-6 flex flex-col gap-3">
        <ChaosBanner />
        {rivalry?.rival && (
          <RivalryCard data={rivalry as Rivalry} myName={name} />
        )}
        {hotTake && (
          <HotTakeCard
            id={hotTake.id}
            question={hotTake.question}
            yes={hotTake.yes}
            no={hotTake.no}
            myVote={myVote}
            signedIn
          />
        )}
      </div>

      <div className="mt-3">
        <SponsorSlot slot="banner" />
      </div>

      <Link
        href="/matches"
        className="btn-pitch mt-6 flex h-14 w-full items-center justify-center rounded-2xl text-base"
      >
        Today&apos;s matches →
      </Link>
      <Link
        href="/leagues"
        className="card card-glow-pitch mt-3 flex h-14 w-full items-center justify-between px-5 text-base font-bold text-pitch-bright transition active:scale-[0.98]"
      >
        <span>🏆 Private leagues</span>
        <span className="text-xs font-medium text-zinc-400">
          start one for your crew →
        </span>
      </Link>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          href="/leaderboard"
          className="card flex h-14 items-center justify-center text-base font-semibold text-zinc-100 transition active:scale-[0.98]"
        >
          Leaderboard
        </Link>
        <Link
          href="/parades"
          className="flex h-14 items-center justify-center rounded-2xl border border-glory/30 bg-glory/5 text-base font-semibold text-glory transition active:scale-[0.98]"
        >
          🎉 Parades
        </Link>
        <Link
          href="/parties"
          className="flex h-14 items-center justify-center rounded-2xl border border-glory/30 bg-glory/5 text-base font-semibold text-glory transition active:scale-[0.98]"
        >
          🎊 Parties
        </Link>
        <Link
          href="/clubs"
          className="card flex h-14 items-center justify-center text-base font-semibold text-zinc-100 transition active:scale-[0.98]"
        >
          🛡️ Clubs
        </Link>
        <Link
          href="/predict"
          className="card flex h-14 items-center justify-center text-base font-semibold text-zinc-100 transition active:scale-[0.98]"
        >
          🏆 Big calls
        </Link>
        <Link
          href="/raids"
          className="flex h-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 text-base font-semibold text-red-300 transition active:scale-[0.98]"
        >
          ⚔️ Raids
        </Link>
        <Link
          href="/hall"
          className="flex h-14 items-center justify-center rounded-2xl border border-glory/30 bg-glory/5 text-base font-semibold text-glory transition active:scale-[0.98]"
        >
          🏛️ Hall
        </Link>
      </div>
      <Link
        href="/shop"
        className="card mt-3 flex h-14 w-full items-center justify-between px-5 text-base font-semibold text-zinc-100 transition active:scale-[0.98]"
      >
        <span>🪙 Coin shop</span>
        <span className="font-display font-bold tabular-nums text-glory">{profile?.coins ?? 0} coins →</span>
      </Link>
      <Link
        href="/rewards"
        className="card card-glow-glory mt-3 flex h-14 w-full items-center justify-between px-5 text-base font-semibold text-glory transition active:scale-[0.98]"
      >
        <span>🎁 Rewards — redeem for vouchers</span>
        <span className="text-xs text-zinc-400">iShopping.pk →</span>
      </Link>
      <Link
        href="/agent"
        className="card card-glow-glory mt-3 flex h-14 w-full items-center justify-between px-5 text-base font-semibold text-pitch-bright transition active:scale-[0.98]"
      >
        <span>💸 Become an Agent</span>
        <span className="text-xs text-zinc-400">earn 25–40% →</span>
      </Link>

      {profile?.username && (
        <div className="mt-3">
          <ShareButton
            url={`${SITE_URL}/?ref=${encodeURIComponent(profile.username)}`}
            text={`I'm on ${profile.glory ?? 0} Glory in Pitch Gods. Beat me this World Cup — we BOTH get 100 coins when you join 👀`}
            label="Invite a friend (you both get 100 coins)"
            variant="ghost"
          />
        </div>
      )}

      <form action={setUsername} className="mt-8">
        <label className="text-sm font-medium text-zinc-300">
          Pick your manager name
        </label>
        <div className="mt-2 flex gap-2">
          <input
            name="username"
            defaultValue={profile?.username ?? ""}
            placeholder="e.g. KarachiKid"
            maxLength={20}
            className="h-12 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-base outline-none focus:border-pitch"
          />
          <button
            type="submit"
            className="h-12 rounded-xl bg-pitch px-5 text-sm font-bold text-black"
          >
            Save
          </button>
        </div>
      </form>

      <div className="mt-auto pt-10">
        <p className="mb-3 text-xs text-zinc-600">
          Phase 0.1 · auth live · matches + predictions land next
        </p>
        <form action={signOut}>
          <button className="text-sm text-zinc-500 underline underline-offset-4">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
  flame = false,
}: {
  label: string;
  value: number;
  accent: string;
  flame?: boolean;
}) {
  return (
    <div className="card p-4 text-center">
      <div className={`font-display text-3xl font-bold tabular-nums ${accent}`}>
        {flame ? `🔥${value}` : value}
      </div>
      <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}
