import { MASCOT_NAME } from "@/components/brand/brand";
import { OwlLogo } from "@/components/brand/OwlLogo";

export const STARTER_QUESTIONS = [
  "Κάνε μου μια σύντομη περίληψη του πρώτου κεφαλαίου",
  "Ποιες είναι οι πιο σημαντικές έννοιες που πρέπει να ξέρω;",
  "Φτιάξε μου 5 ερωτήσεις για επανάληψη",
  "Εξήγησέ μου τους όρους-κλειδιά με απλά λόγια",
] as const;

export function ChatWelcome({
  onPick,
  disabled,
}: {
  onPick: (question: string) => void;
  disabled: boolean;
}) {
  // `m-auto` centers vertically but, unlike justify-center, never clips the top on short screens.
  return (
    <div className="flex min-h-full">
      <div className="m-auto flex flex-col items-center px-2 py-4 text-center sm:py-6">
        <OwlLogo size={112} title={MASCOT_NAME} className="h-20 w-20 animate-owl-bob sm:h-28 sm:w-28" />
        <h2 className="mt-3 font-display text-xl font-bold sm:text-2xl">
          Γεια σου! Είμαι η {MASCOT_NAME} 👋
        </h2>
        <p className="mt-2 max-w-md text-sm text-stone-600 sm:text-base dark:text-slate-400">
          Ρώτα με ό,τι θέλεις για τα βιβλία και τις σημειώσεις σου. Θα σου απαντήσω και θα σου δείξω
          σε ποια σελίδα το βρήκα!
        </p>
        <p className="mt-5 text-sm font-semibold text-stone-500 dark:text-slate-400">
          Δοκίμασε να ρωτήσεις:
        </p>
        <div className="mt-3 flex max-w-2xl flex-wrap justify-center gap-2">
          {STARTER_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              disabled={disabled}
              onClick={() => onPick(question)}
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
