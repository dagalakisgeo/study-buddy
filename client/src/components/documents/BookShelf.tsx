"use client";

import { OwlLogo } from "@/components/brand/OwlLogo";
import { Spinner } from "@/components/ui/Spinner";
import type { DocumentResponse } from "@/lib/api/types";

const COVERS = [
  "from-brand-400 to-brand-600",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-lime-400 to-emerald-500",
] as const;

/** "Mesaioniki-kai-Neoteri_Istoria.pdf" → "Mesaioniki kai Neoteri Istoria" */
export function bookTitle(filename: string): string {
  return filename.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").trim() || filename;
}

function coverFor(documentId: string): string {
  const hash = [...documentId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COVERS[hash % COVERS.length];
}

export function BookShelf({
  documents,
  deletingId,
  onDelete,
}: {
  documents: DocumentResponse[];
  deletingId: string | null;
  onDelete: (document: DocumentResponse) => void;
}) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <OwlLogo size={80} mood="sleepy" />
        <p className="mt-3 font-display font-bold">Η βιβλιοθήκη σου είναι άδεια</p>
        <p className="text-sm text-stone-500 dark:text-slate-400">
          Ανέβασε το πρώτο σου βιβλίο για να ξυπνήσει η κουκουβάγια! 🦉
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => {
        const deleting = deletingId === document.document_id;
        return (
          <li
            key={document.document_id}
            className="flex overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <div
              aria-hidden="true"
              className={`flex w-14 shrink-0 items-center justify-center bg-linear-to-b text-2xl ${coverFor(document.document_id)}`}
            >
              📘
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
              <p className="line-clamp-2 font-semibold break-words" title={document.filename}>
                {bookTitle(document.filename)}
              </p>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                {document.chunks} τμήματα γνώσης
              </p>
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => onDelete(document)}
                aria-label={`Διαγραφή ${document.filename}`}
                className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                {deleting ? <Spinner className="h-3 w-3" /> : <span aria-hidden="true">🗑️</span>}
                {deleting ? "Διαγραφή…" : "Διαγραφή"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
