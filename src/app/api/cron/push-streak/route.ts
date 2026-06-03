import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv)
    return NextResponse.json({ error: "VAPID not configured" }, { status: 500 });
  webpush.setVapidDetails("mailto:dhedhimuhammed@gmail.com", pub, priv);

  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: atRisk } = await admin
    .from("profiles")
    .select("id")
    .gt("streak_count", 0)
    .lt("last_streak_date", today);
  const ids = (atRisk ?? []).map((p) => p.id as string);
  if (ids.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", ids);

  const payload = JSON.stringify({
    title: "🔥 Your streak is at risk!",
    body: "One pick keeps it alive. Lock a call before midnight.",
    url: "/matches",
  });

  let sent = 0;
  let removed = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint as string, keys: { p256dh: s.p256dh as string, auth: s.auth as string } },
        payload,
      );
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint as string);
        removed++;
      }
    }
  }
  return NextResponse.json({ ok: true, sent, removed });
}
