import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "@/lib/api/client";
import { ApiError, NETWORK_ERROR_STATUS } from "@/lib/api/errors";

import { jsonResponse } from "../fakes";

const BASE = "http://localhost:8000/api/v1";

function setup(response: Response | Error) {
  const fetchMock = vi.fn<typeof fetch>(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  return { client: createApiClient(BASE, fetchMock), fetchMock };
}

describe("createApiClient", () => {
  it("GET /health", async () => {
    const { client, fetchMock } = setup(jsonResponse({ status: "ok", checks: { vector_store: true } }));

    await expect(client.getHealth()).resolves.toEqual({ status: "ok", checks: { vector_store: true } });
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/health`, undefined);
  });

  it("GET /documents", async () => {
    const docs = [{ document_id: "d1", filename: "bio.pdf", chunks: 3 }];
    const { client, fetchMock } = setup(jsonResponse(docs));

    await expect(client.listDocuments()).resolves.toEqual(docs);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/documents`, undefined);
  });

  it("POST /documents sends the file as multipart field `file`", async () => {
    const ingest = { document_id: "d1", filename: "bio.pdf", pages: 2, chunks: 4 };
    const { client, fetchMock } = setup(jsonResponse(ingest, 201));
    const file = new File(["%PDF-1.4"], "bio.pdf", { type: "application/pdf" });

    await expect(client.uploadDocument(file)).resolves.toEqual(ingest);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/documents`);
    expect(init?.method).toBe("POST");
    const body = init?.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect((body.get("file") as File).name).toBe("bio.pdf");
  });

  it("DELETE /documents/{id} encodes the id and handles 204", async () => {
    const { client, fetchMock } = setup(new Response(null, { status: 204 }));

    await expect(client.deleteDocument("a/b")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/documents/a%2Fb`, { method: "DELETE" });
  });

  it("POST /query sends JSON", async () => {
    const answer = { answer: "ATP", citations: [] };
    const { client, fetchMock } = setup(jsonResponse(answer));

    await expect(client.askQuestion({ question: "Τι;", top_k: 5 })).resolves.toEqual(answer);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/query`);
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init?.body as string)).toEqual({ question: "Τι;", top_k: 5 });
  });

  it.each([
    [415, "Υποστηρίζονται μόνο αρχεία PDF."],
    [413, "Το αρχείο είναι πολύ μεγάλο."],
    [502, "Σφάλμα του γλωσσικού μοντέλου."],
    [503, "Η βάση διανυσμάτων δεν είναι διαθέσιμη."],
  ])("maps HTTP %i to a Greek ApiError that includes the server detail", async (status, greek) => {
    const { client } = setup(jsonResponse({ detail: "server says no" }, status));

    const error = await client.listDocuments().catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(status);
    expect((error as ApiError).message).toContain(greek);
    expect((error as ApiError).detail).toBe("server says no");
  });

  it("flattens FastAPI validation errors (422 with a detail array)", async () => {
    const { client } = setup(
      jsonResponse({ detail: [{ msg: "String should have at least 1 character" }] }, 422),
    );

    const error = (await client.askQuestion({ question: "" }).catch((err: unknown) => err)) as ApiError;

    expect(error.status).toBe(422);
    expect(error.detail).toBe("String should have at least 1 character");
  });

  it("reports an unreachable server as a network error", async () => {
    const { client } = setup(new TypeError("Failed to fetch"));

    const error = (await client.getHealth().catch((err: unknown) => err)) as ApiError;

    expect(error.status).toBe(NETWORK_ERROR_STATUS);
    expect(error.isNetworkError).toBe(true);
    expect(error.message).toContain(BASE);
  });
});
