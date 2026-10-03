"use client";

import Link from "next/link";

import { useHealth, type ConnectionState } from "@/hooks/useHealth";

const STATES: Record<ConnectionState, { dot: string; label: string }> = {
  checking: { dot: "bg-stone-400", label: "Έλεγχος…" },
  ok: { dot: "bg-brand-500", label: "Έτοιμη να βοηθήσει" },
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
      className="flex items-center gap-2 rounded-full border border-amber-100 bg-white px-3 py-1 text-xs font-medium text-stone-600 hover:bg-amber-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <span className="relative flex h-2.5 w-2.5">
        {state === "ok" && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dot}`} />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`} />
      </span>
      {/* Phones show just the dot; the label stays available to screen readers. */}
      <span className="sr-only sm:not-sr-only">{label}</span>
    </Link>
  );
}
