import { API_BASE_URL } from "@/lib/config";

import { ApiError } from "./errors";
import type {
  DocumentResponse,
  HealthResponse,
  IngestResponse,
  QueryRequest,
  QueryResponse,
} from "./types";

/** Every server endpoint the UI uses. Components and hooks depend on this interface, not on fetch. */
export interface StudyBuddyApi {
  readonly baseUrl: string;
  getHealth(): Promise<HealthResponse>;
  listDocuments(): Promise<DocumentResponse[]>;
  uploadDocument(file: File): Promise<IngestResponse>;
  deleteDocument(documentId: string): Promise<void>;
  askQuestion(request: QueryRequest): Promise<QueryResponse>;
}

export function createApiClient(baseUrl: string, fetchImpl: typeof fetch = fetch): StudyBuddyApi {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, init);
    } catch {
      throw ApiError.network(baseUrl);
    }
    if (!response.ok) throw await ApiError.fromResponse(response);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  return {
    baseUrl,

    getHealth: () => request<HealthResponse>("/health"),

    listDocuments: () => request<DocumentResponse[]>("/documents"),

    uploadDocument: (file) => {
      const body = new FormData();
      body.append("file", file, file.name);
      return request<IngestResponse>("/documents", { method: "POST", body });
    },

    deleteDocument: (documentId) =>
      request<void>(`/documents/${encodeURIComponent(documentId)}`, { method: "DELETE" }),

    askQuestion: (query) =>
      request<QueryResponse>("/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      }),
  };
}

export const api = createApiClient(API_BASE_URL);
