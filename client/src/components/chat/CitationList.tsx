import type { CitationResponse } from "@/lib/api/types";

export function CitationList({ citations }: { citations: CitationResponse[] }) {
  if (citations.length === 0) return null;

  return (
    <details className="group mt-3 rounded-2xl border border-amber-100 bg-amber-50/60 text-sm dark:border-slate-700 dark:bg-slate-800/50">
      <summary className="cursor-pointer px-3 py-2 font-semibold text-amber-800 dark:text-amber-300">
        <span aria-hidden="true">📖 </span>Πηγές ({citations.length})
      </summary>
      <ol className="space-y-3 px-3 pb-3">
        {citations.map((citation, index) => (
          <li key={`${citation.document_id}-${citation.page}-${index}`}>
            <p className="font-semibold">
              [{index + 1}] {citation.filename} · σελ. {citation.page}
              <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                συνάφεια {Math.round(citation.score * 100)}%
              </span>
            </p>
            <blockquote className="mt-1 border-l-4 border-amber-300 pl-3 text-stone-600 italic dark:border-amber-700 dark:text-slate-400">
              {citation.snippet}
            </blockquote>
          </li>
        ))}
      </ol>
    </details>
  );
}
