import { MASCOT_NAME } from "@/components/brand/brand";
import { OwlLogo } from "@/components/brand/OwlLogo";

export function ThinkingIndicator() {
  return (
    <div role="status" className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
        <OwlLogo size={34} mood="thinking" className="animate-owl-bob" />
      </div>
      <div className="flex items-center gap-2 rounded-3xl rounded-tl-md border border-amber-100 bg-white px-4 py-3 text-sm text-stone-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Η {MASCOT_NAME} ψάχνει στα βιβλία σου
        <span className="flex gap-1" aria-hidden="true">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
