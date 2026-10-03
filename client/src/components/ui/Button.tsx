import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-500 active:scale-[0.98] disabled:bg-brand-300 disabled:shadow-none dark:disabled:bg-brand-900",
  secondary:
    "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  danger:
    "border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
