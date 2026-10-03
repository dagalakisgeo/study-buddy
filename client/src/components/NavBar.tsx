"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HealthIndicator } from "./HealthIndicator";

const LINKS = [
  { href: "/chat", label: "Συνομιλία" },
  { href: "/documents", label: "Έγγραφα" },
  { href: "/health", label: "Κατάσταση" },
] as const;

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/chat" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          📚 Study Buddy
        </Link>
        <ul className="flex gap-1">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="ml-auto">
          <HealthIndicator />
        </div>
      </nav>
    </header>
  );
}
