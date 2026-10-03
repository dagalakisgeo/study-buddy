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
    <form onSubmit={submit} className="flex items-end gap-2">
      <label htmlFor="question" className="sr-only">
        Ερώτηση
      </label>
      <textarea
        id="question"
        rows={2}
        value={question}
        maxLength={QUESTION_MAX_LENGTH}
        onChange={(event) => setQuestion(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Κάντε μια ερώτηση για τα έγγραφά σας… (Enter για αποστολή, Shift+Enter για νέα γραμμή)"
        className="min-h-[3rem] flex-1 resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-indigo-900"
      />
      <Button type="submit" disabled={!canSend} className="h-12">
        {disabled ? <Spinner /> : null}
        Αποστολή
      </Button>
    </form>
  );
}
