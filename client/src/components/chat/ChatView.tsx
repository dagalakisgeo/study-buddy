"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { MASCOT_NAME } from "@/components/brand/brand";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";

import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ChatWelcome } from "./ChatWelcome";
import { ThinkingIndicator } from "./ThinkingIndicator";

const TOP_K_OPTIONS = [3, 5, 8, 10] as const;
const DEFAULT_TOP_K = 5;

/** POST /query. */
export function ChatView() {
  const { messages, pending, ask, reset } = useChat();
  const { documents } = useDocuments();
  const [topK, setTopK] = useState<number>(DEFAULT_TOP_K);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll only the message list; scrollIntoView would also scroll the window under the sticky nav.
  useEffect(() => {
    const list = scrollRef.current;
    if (list && (messages.length > 0 || pending)) {
      list.scrollTo?.({ top: list.scrollHeight, behavior: "smooth" });
    }
  }, [messages, pending]);

  const noDocuments = documents !== null && documents.length === 0;
  const send = (question: string) => void ask(question, topK);

  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-[32rem] flex-col gap-4">
      <PageHeader
        emoji="💬"
        title={`Συνομιλία με τη ${MASCOT_NAME}`}
        subtitle="Κάνε ερωτήσεις για τα βιβλία σου και μάθε πιο εύκολα."
        actions={
          <div className="flex items-center gap-2">
            <label htmlFor="top-k" className="text-sm whitespace-nowrap text-stone-500 dark:text-slate-400">
              Πηγές<span className="hidden sm:inline"> ανά απάντηση</span>
            </label>
            <select
              id="top-k"
              value={topK}
              onChange={(event) => setTopK(Number(event.target.value))}
              className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {TOP_K_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              onClick={reset}
              disabled={messages.length === 0 || pending}
              className="whitespace-nowrap"
            >
              ✨ Νέα συνομιλία
            </Button>
          </div>
        }
      />

      {noDocuments && (
        <Alert tone="info">
          <span aria-hidden="true">📚 </span>
          Η βιβλιοθήκη σου είναι άδεια.{" "}
          <Link href="/documents" className="font-semibold underline">
            Πρόσθεσε ένα βιβλίο
          </Link>{" "}
          για να ξεκινήσουμε!
        </Alert>
      )}

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto rounded-3xl border border-amber-100 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950">
        {messages.length === 0 && !pending ? (
          <ChatWelcome onPick={send} disabled={pending} />
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
        {pending && <ThinkingIndicator />}
      </div>

      <ChatInput onSend={send} disabled={pending} />
    </div>
  );
}
