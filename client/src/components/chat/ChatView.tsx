"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";

import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

const TOP_K_OPTIONS = [3, 5, 8, 10] as const;
const DEFAULT_TOP_K = 5;

/** POST /query. */
export function ChatView() {
  const { messages, pending, ask, reset } = useChat();
  const { documents } = useDocuments();
  const [topK, setTopK] = useState<number>(DEFAULT_TOP_K);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, pending]);

  const noDocuments = documents !== null && documents.length === 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Συνομιλία</h1>
          <p className="text-slate-500">Ρωτήστε οτιδήποτε για τα έγγραφα που έχετε ανεβάσει.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="top-k" className="text-sm text-slate-500">
            Πηγές ανά απάντηση
          </label>
          <select
            id="top-k"
            value={topK}
            onChange={(event) => setTopK(Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
          >
            {TOP_K_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={reset} disabled={messages.length === 0 || pending}>
            Νέα συνομιλία
          </Button>
        </div>
      </div>

      {noDocuments && (
        <Alert tone="info">
          Δεν έχετε ανεβάσει ακόμη έγγραφα.{" "}
          <Link href="/documents" className="font-medium underline">
            Ανεβάστε ένα PDF
          </Link>{" "}
          για να ξεκινήσετε.
        </Alert>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        {messages.length === 0 && !pending && (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
            <span className="text-4xl" aria-hidden="true">
              💬
            </span>
            <p className="mt-2 font-medium">Ξεκινήστε μια συνομιλία</p>
            <p className="text-sm">π.χ. «Ποιος ήταν ο Ιουστινιανός;»</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {pending && (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Spinner /> Σκέφτομαι…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={(question) => void ask(question, topK)} disabled={pending} />
    </div>
  );
}
