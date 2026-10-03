"use client";

import Link from "next/link";
import { useState } from "react";

import { MASCOT_NAME } from "@/components/brand/brand";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useDocuments } from "@/hooks/useDocuments";
import { errorMessage } from "@/lib/api/errors";
import type { DocumentResponse } from "@/lib/api/types";
import { MAX_UPLOAD_MB } from "@/lib/config";

import { BookShelf, bookTitle } from "./BookShelf";
import { UploadDropzone } from "./UploadDropzone";

type Notice = { tone: "success" | "error"; text: string; askLink?: boolean } | null;

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
        text: `🎉 Τέλεια! Το «${bookTitle(result.filename)}» προστέθηκε: ${result.pages} σελίδες, ${result.chunks} τμήματα.`,
        askLink: true,
      });
    } catch (err) {
      setNotice({ tone: "error", text: errorMessage(err) });
    }
  }

  async function handleDelete(document: DocumentResponse) {
    const title = bookTitle(document.filename);
    if (!window.confirm(`Να διαγραφεί το «${title}»;\nΗ ${MASCOT_NAME} δεν θα μπορεί πια να απαντά από αυτό.`)) {
      return;
    }
    setNotice(null);
    try {
      await remove(document.document_id);
      setNotice({ tone: "success", text: `Το «${title}» διαγράφηκε.` });
    } catch (err) {
      setNotice({ tone: "error", text: errorMessage(err) });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        emoji="📚"
        title="Τα βιβλία μου"
        subtitle={`Ανέβασε τα σχολικά σου βιβλία και τις σημειώσεις σου. Η ${MASCOT_NAME} θα τα διαβάσει για να απαντά στις ερωτήσεις σου.`}
      />

      <Card title="Πρόσθεσε ένα βιβλίο">
        <UploadDropzone onFile={handleUpload} uploading={uploading} maxMb={MAX_UPLOAD_MB} />
      </Card>

      {notice && (
        <Alert tone={notice.tone}>
          {notice.text}
          {notice.askLink && (
            <>
              {" "}
              <Link href="/chat" className="font-semibold underline">
                Κάνε μια ερώτηση →
              </Link>
            </>
          )}
        </Alert>
      )}

      <Card
        title={`Η βιβλιοθήκη μου${documents ? ` (${documents.length})` : ""}`}
        actions={
          <Button variant="secondary" onClick={() => void refresh()}>
            ↻ Ανανέωση
          </Button>
        }
      >
        {error && <Alert tone="error">{error}</Alert>}
        {loading && (
          <p className="flex items-center gap-2 py-6 text-sm text-stone-500">
            <Spinner /> Φόρτωση βιβλίων…
          </p>
        )}
        {documents && <BookShelf documents={documents} deletingId={deletingId} onDelete={handleDelete} />}
      </Card>
    </div>
  );
}
