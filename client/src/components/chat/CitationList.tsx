import type { CitationResponse } from "@/lib/api/types";

export function CitationList({ citations }: { citations: CitationResponse[] }) {
  if (citations.length === 0) return null;

  return (
    <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 text-sm dark:border-slate-700 dark:bg-slate-800/50">
      <summary className="cursor-pointer px-3 py-2 font-medium text-slate-600 dark:text-slate-300">
        Πηγές ({citations.length})
      </summary>
      <ol className="space-y-3 px-3 pb-3">
        {citations.map((citation, index) => (
          <li key={`${citation.document_id}-${citation.page}-${index}`}>
            <p className="font-medium">
              [{index + 1}] {citation.filename} · σελ. {citation.page}
              <span className="ml-2 text-xs font-normal text-slate-400">
                συνάφεια {Math.round(citation.score * 100)}%
              </span>
            </p>
            <blockquote className="mt-1 border-l-2 border-indigo-300 pl-3 text-slate-600 dark:border-indigo-700 dark:text-slate-400">
              {citation.snippet}
            </blockquote>
          </li>
        ))}
      </ol>
    </details>
  );
}
