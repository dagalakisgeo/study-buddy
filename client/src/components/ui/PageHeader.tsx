import type { ReactNode } from "react";

export function PageHeader({
  emoji,
  title,
  subtitle,
  actions,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          <span aria-hidden="true">{emoji}</span> {title}
        </h1>
        <p className="mt-1 text-stone-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}
