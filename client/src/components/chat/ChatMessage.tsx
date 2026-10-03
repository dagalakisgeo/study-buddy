import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ChatEntry } from "@/hooks/useChat";

import { CitationList } from "./CitationList";

export function ChatMessage({ message }: { message: ChatEntry }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2 whitespace-pre-wrap text-white">
          {message.content}
        </p>
      </div>
    );
  }

  if (message.isError) {
    return (
      <div role="alert" className="max-w-[85%] rounded-2xl rounded-bl-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        {message.content}
      </div>
    );
  }

  return (
    <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
      </div>
      <CitationList citations={message.citations ?? []} />
    </div>
  );
}
