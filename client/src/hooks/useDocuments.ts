"use client";

import { useCallback, useEffect, useState } from "react";

import { api, type StudyBuddyApi } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { DocumentResponse, IngestResponse } from "@/lib/api/types";

export function useDocuments(client: StudyBuddyApi = api) {
  const [documents, setDocuments] = useState<DocumentResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setDocuments(await client.listDocuments());
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [client]);

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  /** Uploads a file; resolves with the server's result or rejects with an ApiError. */
  const upload = useCallback(
    async (file: File): Promise<IngestResponse> => {
      setUploading(true);
      try {
        const result = await client.uploadDocument(file);
        await refresh();
        return result;
      } finally {
        setUploading(false);
      }
    },
    [client, refresh],
  );

  const remove = useCallback(
    async (documentId: string): Promise<void> => {
      setDeletingId(documentId);
      try {
        await client.deleteDocument(documentId);
        await refresh();
      } finally {
        setDeletingId(null);
      }
    },
    [client, refresh],
  );

  return {
    documents,
    loading: documents === null && error === null,
    error,
    uploading,
    deletingId,
    refresh,
    upload,
    remove,
  };
}
