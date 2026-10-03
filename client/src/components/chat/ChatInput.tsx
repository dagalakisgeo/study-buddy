"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { QUESTION_MAX_LENGTH } from "@/lib/api/types";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (question: string) => void;
  disabled: boolean;
}) {
  const [question, setQuestion] = useState("");
  const canSend = !disabled && question.trim().length > 0;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend(question);
    setQuestion("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div>
      <form
        onSubmit={submit}
        className="flex items-end gap-2 rounded-3xl border border-amber-200 bg-white p-2 shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:ring-brand-950"
      >
        <label htmlFor="question" className="sr-only">
          Η ερώτησή σου
        </label>
        <textarea
          id="question"
          rows={2}
          value={question}
          maxLength={QUESTION_MAX_LENGTH}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Γράψε την ερώτησή σου…"
          className="min-h-[3rem] flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-stone-400"
        />
        <Button type="submit" disabled={!canSend} className="h-11 px-5">
          {disabled ? <Spinner /> : <span aria-hidden="true">🦉</span>}
          Ρώτα
        </Button>
      </form>
      <p className="mt-1.5 hidden text-center text-xs text-stone-400 sm:block">
        Enter για αποστολή · Shift+Enter για νέα γραμμή
      </p>
    </div>
  );
}
