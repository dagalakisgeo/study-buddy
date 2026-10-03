import type { ReactNode } from "react";

type Tone = "error" | "success" | "info";

const TONES: Record<Tone, string> = {
  error: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  success:
    "border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-200",
  info: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
};

export function Alert({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-sm ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}
