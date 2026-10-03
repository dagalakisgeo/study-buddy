"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useHealth, type ConnectionState } from "@/hooks/useHealth";
import { API_BASE_URL } from "@/lib/config";

const REFRESH_MS = 10_000;

const BADGES: Record<ConnectionState, { className: string; label: string }> = {
  checking: { className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", label: "Έλεγχος…" },
  ok: { className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300", label: "Λειτουργεί κανονικά" },
  degraded: { className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", label: "Περιορισμένη λειτουργία" },
  offline: { className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300", label: "Εκτός σύνδεσης" },
};

const CHECK_LABELS: Record<string, string> = {
  vector_store: "Βάση διανυσμάτων",
};

/** GET /health. */
export function HealthView() {
  const { health, error, lastChecked, state, refresh } = useHealth(REFRESH_MS);
  const badge = BADGES[state];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Κατάσταση</h1>
        <p className="text-slate-500">Η κατάσταση του διακομιστή ελέγχεται αυτόματα κάθε 10 δευτερόλεπτα.</p>
      </div>

      <Card
        title="Διακομιστής"
        actions={
          <Button variant="secondary" onClick={() => void refresh()}>
            Έλεγχος τώρα
          </Button>
        }
      >
        <div className="space-y-4">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${badge.className}`}>
            {state === "checking" && <Spinner className="h-3 w-3" />}
            {badge.label}
          </span>

          {health && (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.entries(health.checks).map(([name, healthy]) => (
                <li key={name} className="flex items-center justify-between py-2 text-sm">
                  <span>{CHECK_LABELS[name] ?? name}</span>
                  <span className={healthy ? "text-emerald-600" : "text-red-600"}>
                    {healthy ? "✓ Διαθέσιμη" : "✗ Μη διαθέσιμη"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <Alert tone="error">
              <p>{error}</p>
              <p className="mt-2">
                Ξεκινήστε τον διακομιστή από τον φάκελο <code>server</code> με:
              </p>
              <pre className="mt-1 overflow-x-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/40">
                poetry run uvicorn study_buddy.main:create_app --factory --reload
              </pre>
            </Alert>
          )}

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-slate-500">
            <dt>Διεύθυνση API</dt>
            <dd className="font-mono break-all">{API_BASE_URL}</dd>
            <dt>Τελευταίος έλεγχος</dt>
            <dd>{lastChecked ? lastChecked.toLocaleTimeString("el-GR") : "—"}</dd>
          </dl>
        </div>
      </Card>
    </div>
  );
}
