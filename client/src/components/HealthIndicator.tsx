"use client";

import Link from "next/link";

import { useHealth, type ConnectionState } from "@/hooks/useHealth";

const STATES: Record<ConnectionState, { dot: string; label: string }> = {
  checking: { dot: "bg-slate-400", label: "Έλεγχος…" },
  ok: { dot: "bg-emerald-500", label: "Συνδεδεμένο" },
  degraded: { dot: "bg-amber-500", label: "Περιορισμένη λειτουργία" },
  offline: { dot: "bg-red-500", label: "Εκτός σύνδεσης" },
};

export function HealthIndicator() {
  const { state } = useHealth(30_000);
  const { dot, label } = STATES[state];

  return (
    <Link
      href="/health"
      title="Κατάσταση διακομιστή"
      className="flex items-center gap-2 rounded-full px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      {label}
    </Link>
  );
}
