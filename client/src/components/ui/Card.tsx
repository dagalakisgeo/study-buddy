import type { ReactNode } from "react";

export function Card({
  title,
  actions,
  children,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
