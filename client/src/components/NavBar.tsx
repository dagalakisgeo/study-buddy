"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME, TAGLINE } from "./brand/brand";
import { OwlLogo } from "./brand/OwlLogo";
import { HealthIndicator } from "./HealthIndicator";

const LINKS = [
  { href: "/chat", emoji: "💬", label: "Συνομιλία" },
  { href: "/documents", emoji: "📚", label: "Τα βιβλία μου" },
  { href: "/health", emoji: "⚡", label: "Κατάσταση" },
] as const;

/** Phones: logo + status on row 1, three equal tabs on row 2. From `sm` up: a single row. */
export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-amber-100 bg-[#fffaf0]/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 sm:py-3">
        <Link href="/chat" className="group flex items-center gap-2">
          <OwlLogo size={44} className="h-9 w-9 transition-transform group-hover:-rotate-6 sm:h-11 sm:w-11" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold text-brand-700 sm:text-xl dark:text-brand-300">
              {APP_NAME}
            </span>
            <span className="hidden text-xs text-stone-500 sm:block dark:text-slate-400">{TAGLINE}</span>
          </span>
        </Link>
        <div className="ml-auto sm:order-last">
          <HealthIndicator />
        </div>
        <ul className="order-last flex w-full gap-1 sm:order-none sm:w-auto">
          {LINKS.map(({ href, emoji, label }) => {
            const active = pathname === href;
            return (
              <li key={href} className="flex-1 sm:flex-none">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors sm:px-3.5 sm:text-sm ${
                    active
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-stone-600 hover:bg-amber-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span aria-hidden="true" className="hidden min-[420px]:inline">
                    {emoji}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
