"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ---- user ----
export async function createRedemption(tierId: number, email: string) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  const { data, error } = await sb.rpc("create_redemption", {
    p_tier_id: tierId,
    p_email: email,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/rewards");
  return data as { ok: boolean; id?: number; error?: string };
}

// ---- admin ----
export async function adminSetStatus(id: number, status: string) {
  const sb = await createClient();
  const { data, error } = await sb.rpc("admin_set_status", {
    p_redemption: id,
    p_status: status,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/rewards");
  return data as { ok: boolean; error?: string };
}

export async function adminAddCodes(tierId: number, codesText: string) {
  const codes = codesText
    .split(/[\n,]+/)
    .map((c) => c.trim())
    .filter(Boolean);
  if (!codes.length) return { ok: false, error: "No codes provided." };
  const sb = await createClient();
  const { data, error } = await sb.rpc("admin_add_voucher_codes", {
    p_tier_id: tierId,
    p_codes: codes,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/rewards");
  return data as { ok: boolean; added?: number; error?: string };
}

export async function adminAssignVoucher(id: number) {
  const sb = await createClient();
  const { data, error } = await sb.rpc("admin_assign_voucher", {
    p_redemption: id,
  });
  if (error) return { ok: false, error: error.message };
  const res = data as {
    ok: boolean;
    code?: string;
    email?: string;
    error?: string;
  };
  // best-effort: email the voucher code (only if Composio is configured in env)
  if (res.ok && res.code && res.email) {
    await sendVoucherEmail(res.email, res.code).catch(() => {});
  }
  revalidatePath("/admin/rewards");
  return res;
}

// Optional transactional email via the already-wired Composio Gmail.
// Set COMPOSIO_API_KEY + COMPOSIO_GMAIL_ACCOUNT + COMPOSIO_USER_ID in Vercel
// env to enable. Otherwise the code is shown to the admin + in the user's
// in-app history (status "Voucher sent").
async function sendVoucherEmail(email: string, code: string) {
  const key = process.env.COMPOSIO_API_KEY;
  const account = process.env.COMPOSIO_GMAIL_ACCOUNT;
  const userId = process.env.COMPOSIO_USER_ID;
  if (!key || !account || !userId) return;
  await fetch(
    "https://backend.composio.dev/api/v3/tools/execute/GMAIL_SEND_EMAIL",
    {
      method: "POST",
      headers: { "x-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        connected_account_id: account,
        user_id: userId,
        arguments: {
          recipient_email: email,
          subject: "Your Pitch Gods voucher code 🎉",
          body: `Salam! Your iShopping.pk voucher from Pitch Gods is ready.\n\nVoucher code: ${code}\n\nRedeem it at iShopping.pk. Thanks for playing — pure glory.\n\n— Pitch Gods · pitchgods.com`,
        },
      }),
    },
  );
}
