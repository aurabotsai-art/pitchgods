"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminSetStatus,
  adminAssignVoucher,
  adminAddCodes,
} from "@/app/rewards/actions";

type Row = {
  id: number;
  username: string | null;
  email: string;
  status: string;
  points_spent: number;
  voucher_code: string | null;
  tier_label: string;
  voucher_value_pkr: number;
  created_at: string;
};
type Stock = { tier_id: number; label: string; available: number; total: number };
type Tier = { id: number; label: string };

const STATUSES = ["all", "pending", "approved", "voucher_sent", "rejected", "completed"];

export function AdminRewards({
  rows,
  stock,
  tiers,
}: {
  rows: Row[];
  stock: Stock[];
  tiers: Tier[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("pending");
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const [codeTier, setCodeTier] = useState<number>(tiers[0]?.id ?? 0);
  const [codeText, setCodeText] = useState("");

  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter === "all" || r.status === filter) &&
          (q === "" ||
            r.email.toLowerCase().includes(q.toLowerCase()) ||
            (r.username ?? "").toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, filter, q],
  );

  function act(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    setNote(null);
    start(async () => {
      const res = await fn();
      setNote(res.ok ? ok : res.error ?? "Failed");
      if (res.ok) router.refresh();
    });
  }

  function exportCsv() {
    const head = "id,username,email,tier,pkr,points,status,code,created\n";
    const body = shown
      .map((r) =>
        [r.id, r.username ?? "", r.email, r.tier_label, r.voucher_value_pkr, r.points_spent, r.status, r.voucher_code ?? "", r.created_at]
          .map((x) => `"${String(x).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([head + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "redemptions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-6">
      {/* stock */}
      <div className="card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Voucher code stock
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {stock.map((s) => (
            <div key={s.tier_id} className="flex justify-between">
              <span className="text-zinc-400">{s.label}</span>
              <span className={s.available === 0 ? "text-red-400" : "text-pitch-bright"}>
                {s.available} left
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* upload codes */}
      <div className="card mt-4 p-4">
        <p className="text-sm font-bold">Upload voucher codes</p>
        <select
          value={codeTier}
          onChange={(e) => setCodeTier(Number(e.target.value))}
          className="mt-2 h-10 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm"
        >
          {tiers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <textarea
          value={codeText}
          onChange={(e) => setCodeText(e.target.value)}
          rows={3}
          placeholder="Paste codes — one per line or comma-separated"
          className="mt-2 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm"
        />
        <button
          onClick={() => {
            act(() => adminAddCodes(codeTier, codeText), "Codes uploaded");
            setCodeText("");
          }}
          disabled={pending}
          className="btn-glass mt-2 h-10 w-full rounded-lg text-sm"
        >
          Add codes to pool
        </button>
      </div>

      {/* filters + search + export */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === s ? "bg-glory text-black" : "surface text-zinc-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email / username"
          className="h-10 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 text-sm"
        />
        <button onClick={exportCsv} className="btn-glass h-10 rounded-lg px-3 text-xs">
          Export CSV
        </button>
      </div>

      {note && <p className="mt-3 text-center text-sm text-glory">{note}</p>}

      {/* rows */}
      <div className="mt-4 flex flex-col gap-2">
        {shown.length === 0 ? (
          <p className="py-4 text-center text-xs text-zinc-500">No requests.</p>
        ) : (
          shown.map((r) => (
            <div key={r.id} className="surface rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">
                  {r.username ?? "Guest"}{" "}
                  <span className="font-normal text-zinc-500">#{r.id}</span>
                </span>
                <span className="text-xs font-semibold text-glory">
                  PKR {r.voucher_value_pkr} · {r.status}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-zinc-500">
                {r.email} · {r.points_spent} coins
              </div>
              {r.voucher_code && (
                <div className="mt-1 font-mono text-xs text-glory">
                  code: {r.voucher_code}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.status === "pending" && (
                  <>
                    <Btn onClick={() => act(() => adminSetStatus(r.id, "approved"), "Approved")} disabled={pending}>
                      Approve
                    </Btn>
                    <Btn onClick={() => act(() => adminSetStatus(r.id, "rejected"), "Rejected + refunded")} disabled={pending} danger>
                      Reject
                    </Btn>
                  </>
                )}
                {(r.status === "approved" || (r.status === "pending" && false)) && (
                  <Btn onClick={() => act(() => adminAssignVoucher(r.id), "Voucher assigned + emailed")} disabled={pending} gold>
                    Assign + send voucher
                  </Btn>
                )}
                {r.status === "voucher_sent" && (
                  <Btn onClick={() => act(() => adminSetStatus(r.id, "completed"), "Marked completed")} disabled={pending}>
                    Mark completed
                  </Btn>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  danger,
  gold,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  gold?: boolean;
}) {
  const cls = gold
    ? "btn-gold"
    : danger
      ? "bg-red-500/15 text-red-300 border border-red-500/30"
      : "btn-glass";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${cls} rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60`}
    >
      {children}
    </button>
  );
}
