"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useDocuments } from "@/hooks/useDocuments";
import { errorMessage } from "@/lib/api/errors";
import type { DocumentResponse } from "@/lib/api/types";
import { MAX_UPLOAD_MB } from "@/lib/config";

import { DocumentsTable } from "./DocumentsTable";
import { UploadDropzone } from "./UploadDropzone";

type Notice = { tone: "success" | "error"; text: string } | null;

/** POST /documents (upload), GET /documents (list) and DELETE /documents/{id}. */
export function DocumentsView() {
  const { documents, loading, error, uploading, deletingId, refresh, upload, remove } =
    useDocuments();
  const [notice, setNotice] = useState<Notice>(null);

  async function handleUpload(file: File) {
    setNotice(null);
    try {
      const result = await upload(file);
      setNotice({
        tone: "success",
        text: `Το «${result.filename}» ανέβηκε: ${result.pages} σελίδες, ${result.chunks} τμήματα.`,
      });
    } catch (err) {
      setNotice({ tone: "error", text: errorMessage(err) });
    }
  }

  async function handleDelete(document: DocumentResponse) {
    if (!window.confirm(`Να διαγραφεί το «${document.filename}»;`)) return;
    setNotice(null);
    try {
      await remove(document.document_id);
      setNotice({ tone: "success", text: `Το «${document.filename}» διαγράφηκε.` });
    } catch (err) {
      setNotice({ tone: "error", text: errorMessage(err) });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Έγγραφα</h1>
        <p className="text-slate-500">
          Ανεβάστε τα βιβλία και τις σημειώσεις σας για να κάνετε ερωτήσεις πάνω σε αυτά.
        </p>
      </div>

      <Card title="Ανέβασμα εγγράφου">
        <UploadDropzone onFile={handleUpload} uploading={uploading} maxMb={MAX_UPLOAD_MB} />
      </Card>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      <Card
        title="Τα έγγραφά μου"
        actions={
          <Button variant="secondary" onClick={() => void refresh()}>
            Ανανέωση
          </Button>
        }
      >
        {error && <Alert tone="error">{error}</Alert>}
        {loading && (
          <p className="flex items-center gap-2 py-6 text-sm text-slate-500">
            <Spinner /> Φόρτωση εγγράφων…
          </p>
        )}
        {documents && (
          <DocumentsTable documents={documents} deletingId={deletingId} onDelete={handleDelete} />
        )}
      </Card>
    </div>
  );
}
