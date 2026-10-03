"use client";

import { MASCOT_NAME } from "@/components/brand/brand";
import { OwlLogo, type OwlMood } from "@/components/brand/OwlLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useHealth, type ConnectionState } from "@/hooks/useHealth";
import { API_BASE_URL } from "@/lib/config";

const REFRESH_MS = 10_000;

const STATES: Record<ConnectionState, { mood: OwlMood; label: string; title: string; text: string; badge: string }> = {
  checking: {
    label: "Έλεγχος",
    mood: "thinking",
    title: "Έλεγχος…",
    text: "Κοιτάμε αν όλα λειτουργούν.",
    badge: "bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-300",
  },
  ok: {
    label: "Συνδεδεμένο",
    mood: "happy",
    title: `Η ${MASCOT_NAME} είναι ξύπνια και έτοιμη! ✨`,
    text: "Όλα λειτουργούν κανονικά. Μπορείς να ανεβάσεις βιβλία και να κάνεις ερωτήσεις.",
    badge: "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300",
  },
  degraded: {
    label: "Περιορισμένη λειτουργία",
    mood: "thinking",
    title: "Κάτι δεν πάει καλά… 🤔",
    text: "Ο διακομιστής απαντά, αλλά κάποια υπηρεσία δεν είναι διαθέσιμη.",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  offline: {
    label: "Εκτός σύνδεσης",
    mood: "sleepy",
    title: `Η ${MASCOT_NAME} κοιμάται… 💤`,
    text: "Δεν μπορώ να συνδεθώ με τον διακομιστή.",
    badge: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
};

const CHECK_LABELS: Record<string, string> = {
  vector_store: "Βάση γνώσεων (vector store)",
};

/** GET /health. */
export function HealthView() {
  const { health, error, lastChecked, state, refresh } = useHealth(REFRESH_MS);
  const view = STATES[state];

  return (
    <div className="space-y-6">
      <PageHeader
        emoji="⚡"
        title="Κατάσταση"
        subtitle={`Δες αν η ${MASCOT_NAME} είναι έτοιμη να βοηθήσει. Ελέγχεται αυτόματα κάθε 10 δευτερόλεπτα.`}
        actions={
          <Button variant="secondary" onClick={() => void refresh()}>
            ↻ Έλεγχος τώρα
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <OwlLogo
            size={120}
            mood={view.mood}
            className={state === "checking" ? "animate-owl-bob" : ""}
          />
          <div className="w-full flex-1 space-y-4">
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${view.badge}`}>
                {view.label}
              </span>
              <h2 className="mt-2 font-display text-xl font-bold">{view.title}</h2>
              <p className="text-stone-600 dark:text-slate-400">{view.text}</p>
            </div>

            {health && (
              <ul className="divide-y divide-amber-100 rounded-2xl border border-amber-100 dark:divide-slate-800 dark:border-slate-800">
                {Object.entries(health.checks).map(([name, healthy]) => (
                  <li key={name} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span>{CHECK_LABELS[name] ?? name}</span>
                    <span className={`font-semibold ${healthy ? "text-brand-600" : "text-red-600"}`}>
                      {healthy ? "✓ Διαθέσιμη" : "✗ Μη διαθέσιμη"}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                <p>{error}</p>
                <p className="mt-2 font-semibold">Για να την ξυπνήσεις, ξεκίνα τον διακομιστή από τον φάκελο server:</p>
                <pre className="mt-1 overflow-x-auto rounded-xl bg-red-100 p-2 text-xs dark:bg-red-900/40">
                  poetry run uvicorn study_buddy.main:create_app --factory --reload
                </pre>
              </div>
            )}

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-slate-400">
              <dt>Διεύθυνση API</dt>
              <dd className="font-mono break-all">{API_BASE_URL}</dd>
              <dt>Τελευταίος έλεγχος</dt>
              <dd>{lastChecked ? lastChecked.toLocaleTimeString("el-GR") : "—"}</dd>
            </dl>
          </div>
        </div>
      </Card>
    </div>
  );
}
