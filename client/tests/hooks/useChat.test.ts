import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useChat } from "@/hooks/useChat";
import { ApiError } from "@/lib/api/errors";

import { fakeApi } from "../fakes";

describe("useChat", () => {
  it("adds the question and the answer with citations", async () => {
    const citations = [{ document_id: "d", filename: "a.pdf", page: 1, snippet: "s", score: 0.9 }];
    const client = fakeApi({ askQuestion: vi.fn().mockResolvedValue({ answer: "Απάντηση", citations }) });
    const { result } = renderHook(() => useChat(client));

    await act(() => result.current.ask("  Ερώτηση;  ", 3));

    expect(client.askQuestion).toHaveBeenCalledWith({ question: "Ερώτηση;", top_k: 3 });
    expect(result.current.messages).toMatchObject([
      { role: "user", content: "Ερώτηση;" },
      { role: "assistant", content: "Απάντηση", citations },
    ]);
    expect(result.current.pending).toBe(false);
  });

  it("adds an error message when the request fails", async () => {
    const client = fakeApi({
      askQuestion: vi.fn().mockRejectedValue(new ApiError(502, "Σφάλμα του γλωσσικού μοντέλου.")),
    });
    const { result } = renderHook(() => useChat(client));

    await act(() => result.current.ask("Ερώτηση;"));

    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      isError: true,
      content: "Σφάλμα του γλωσσικού μοντέλου.",
    });
  });

  it("ignores blank questions and can reset", async () => {
    const client = fakeApi({ askQuestion: vi.fn().mockResolvedValue({ answer: "x", citations: [] }) });
    const { result } = renderHook(() => useChat(client));

    await act(() => result.current.ask("   "));
    expect(client.askQuestion).not.toHaveBeenCalled();

    await act(() => result.current.ask("q"));
    act(() => result.current.reset());
    expect(result.current.messages).toEqual([]);
  });
});
