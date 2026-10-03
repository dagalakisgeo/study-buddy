// Mirrors server/src/study_buddy/api/schemas.py — keep in sync with the server.

export type HealthStatus = "ok" | "degraded";

export interface HealthResponse {
  status: HealthStatus;
  checks: Record<string, boolean>;
}

export interface IngestResponse {
  document_id: string;
  filename: string;
  pages: number;
  chunks: number;
}

export interface DocumentResponse {
  document_id: string;
  filename: string;
  chunks: number;
}

export interface QueryRequest {
  question: string;
  top_k?: number | null;
}

export interface CitationResponse {
  document_id: string;
  filename: string;
  page: number;
  snippet: string;
  score: number;
}

export interface QueryResponse {
  answer: string;
  citations: CitationResponse[];
}

/** Limits enforced by the server's QueryRequest model. */
export const QUESTION_MAX_LENGTH = 2000;
export const TOP_K_MIN = 1;
export const TOP_K_MAX = 20;
