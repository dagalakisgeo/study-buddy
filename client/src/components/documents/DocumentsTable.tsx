"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { DocumentResponse } from "@/lib/api/types";

export function DocumentsTable({
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
      <p className="py-6 text-center text-sm text-slate-500">
        Δεν υπάρχουν έγγραφα ακόμη. Ανεβάστε ένα PDF για να ξεκινήσετε.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700">
          <tr>
            <th className="py-2 pr-4 font-medium">Όνομα αρχείου</th>
            <th className="py-2 pr-4 font-medium">Τμήματα</th>
            <th className="py-2 text-right font-medium">Ενέργειες</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {documents.map((document) => {
            const deleting = deletingId === document.document_id;
            return (
              <tr key={document.document_id}>
                <td className="py-3 pr-4">
                  <span className="font-medium break-all">{document.filename}</span>
                  <span className="block text-xs text-slate-400">{document.document_id}</span>
                </td>
                <td className="py-3 pr-4 tabular-nums">{document.chunks}</td>
                <td className="py-3 text-right">
                  <Button
                    variant="danger"
                    disabled={deletingId !== null}
                    onClick={() => onDelete(document)}
                    aria-label={`Διαγραφή ${document.filename}`}
                  >
                    {deleting && <Spinner />}
                    {deleting ? "Διαγραφή…" : "Διαγραφή"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
