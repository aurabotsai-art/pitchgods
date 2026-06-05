import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/ShareButton";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pitchgods.com";

async function getProfile(username: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("username, glory, level, flag_country")
    .ilike("username", username)
    .limit(1)
    .maybeSingle();
  return data;
}

function ogUrl(name: string, glory: number, level: number) {
  const q = new URLSearchParams({
    name,
    glory: String(glory),
    level: String(level),
    tag: "Out-predict me.",
  });
  return `/api/og?${q.toString()}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const p = await getProfile(decodeURIComponent(username));
  if (!p?.username) {
    return { title: "Manager not found · Pitch Gods", robots: { index: false } };
  }
  const title = `${p.username} · ${p.glory} Glory — Pitch Gods`;
  const description = `${p.username} is on ${p.glory} Glory (Lv ${p.level}). Think you can out-predict them? Play free.`;
  const image = ogUrl(p.username, p.glory, p.level);
  return {
    title,
    description,
    alternates: { canonical: `/u/${encodeURIComponent(p.username)}` },
    openGraph: { title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const p = await getProfile(decodeURIComponent(username));

  if (!p?.username) notFound(); // real 404 instead of soft-200

  const profileUrl = `${SITE_URL}/u/${encodeURIComponent(p.username)}`;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-12">
      <span className="text-center text-xs font-medium uppercase tracking-widest text-pitch">
        Pitch Gods
      </span>

      <div className="mt-8 rounded-3xl surface p-8 text-center">
        <div className="text-sm text-zinc-400">Out-predict me.</div>
        <div className="mt-2 text-4xl font-black tracking-tight">
          {p.flag_country ? `${p.flag_country} ` : ""}
          {p.username}
        </div>
        <div className="mt-6 text-6xl font-black text-glory">{p.glory}</div>
        <div className="mt-1 text-sm uppercase tracking-wide text-zinc-500">
          Glory · Level {p.level}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/"
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-pitch text-base font-bold text-black transition active:scale-[0.98]"
        >
          Beat {p.username} — play free
        </Link>
        <ShareButton
          url={profileUrl}
          text={`I'm on ${p.glory} Glory in Pitch Gods. Out-predict me 👀`}
          variant="ghost"
          label="Share my card"
        />
      </div>
    </main>
  );
}
