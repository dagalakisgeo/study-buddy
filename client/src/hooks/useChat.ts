"use client";

import { useCallback, useRef, useState } from "react";

import { api, type StudyBuddyApi } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { CitationResponse } from "@/lib/api/types";

export interface ChatEntry {
  id: number;
  role: "user" | "assistant";
  content: string;
  citations?: CitationResponse[];
  /** Set when the request failed; `content` then holds the error message. */
  isError?: boolean;
}

/** Conversation state for /query. The server is stateless, so history lives only in the browser. */
export function useChat(client: StudyBuddyApi = api) {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [pending, setPending] = useState(false);
  const nextId = useRef(0);

  const append = useCallback((entry: Omit<ChatEntry, "id">) => {
    const id = nextId.current++;
    setMessages((current) => [...current, { ...entry, id }]);
  }, []);

  const ask = useCallback(
    async (question: string, topK?: number) => {
      const trimmed = question.trim();
      if (!trimmed || pending) return;

      append({ role: "user", content: trimmed });
      setPending(true);
      try {
        const result = await client.askQuestion({ question: trimmed, top_k: topK });
        append({ role: "assistant", content: result.answer, citations: result.citations });
      } catch (err) {
        append({ role: "assistant", content: errorMessage(err), isError: true });
      } finally {
        setPending(false);
      }
    },
    [append, client, pending],
  );

  const reset = useCallback(() => setMessages([]), []);

  return { messages, pending, ask, reset };
}
