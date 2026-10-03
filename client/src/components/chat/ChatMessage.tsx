import { MASCOT_NAME } from "@/components/brand/brand";
import { OwlLogo } from "@/components/brand/OwlLogo";
import type { ChatEntry } from "@/hooks/useChat";

import { CitationList } from "./CitationList";
import { MarkdownAnswer } from "./MarkdownAnswer";

function OwlAvatar({ mood }: { mood: "happy" | "sleepy" }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
      <OwlLogo size={34} mood={mood} />
    </div>
  );
}

export function ChatMessage({ message }: { message: ChatEntry }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-3xl rounded-br-md bg-brand-600 px-4 py-2.5 whitespace-pre-wrap text-white shadow-sm">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <OwlAvatar mood={message.isError ? "sleepy" : "happy"} />
      <div className="max-w-[85%] min-w-0">
        <p className="mb-1 ml-1 font-display text-xs font-bold text-amber-700 dark:text-amber-400">
          {MASCOT_NAME}
        </p>
        {message.isError ? (
          <div
            role="alert"
            className="rounded-3xl rounded-tl-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            <p className="font-semibold">Ουπς, κάτι πήγε στραβά 😕</p>
            <p className="mt-1">{message.content}</p>
          </div>
        ) : (
          <div className="rounded-3xl rounded-tl-md border border-amber-100 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <MarkdownAnswer>{message.content}</MarkdownAnswer>
            <CitationList citations={message.citations ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
