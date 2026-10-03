import { vi } from "vitest";

import type { StudyBuddyApi } from "@/lib/api/client";

export function fakeApi(overrides: Partial<StudyBuddyApi> = {}): StudyBuddyApi {
  return {
    baseUrl: "http://test/api/v1",
    getHealth: vi.fn().mockResolvedValue({ status: "ok", checks: { vector_store: true } }),
    listDocuments: vi.fn().mockResolvedValue([]),
    uploadDocument: vi.fn(),
    deleteDocument: vi.fn().mockResolvedValue(undefined),
    askQuestion: vi.fn(),
    ...overrides,
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
