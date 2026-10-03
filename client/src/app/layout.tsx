import type { Metadata } from "next";
import { Comfortaa, Manrope } from "next/font/google";

import { APP_NAME, TAGLINE } from "@/components/brand/brand";
import { NavBar } from "@/components/NavBar";

import "./globals.css";

// Both fonts include Greek glyphs: Manrope for reading, Comfortaa for headings and the logo.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "greek"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin", "greek"],
});

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: `${TAGLINE}: ρώτα τα σχολικά σου βιβλία και πάρε απαντήσεις με παραπομπές σε σελίδες.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="el" className={`${manrope.variable} ${comfortaa.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NavBar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
