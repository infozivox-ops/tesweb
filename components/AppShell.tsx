"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { StorageAlert } from "@/components/StorageAlert";

const navItems = [
  { href: "/", label: "Landing" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/members", label: "Üyeler" },
  { href: "/allowances", label: "Harçlıklar" },
  { href: "/expenses", label: "Giderler" },
  { href: "/settlements", label: "Bölüştür" },
  { href: "/settings", label: "Ayarlar" },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Aile Cüzdanı</p>
            <h1 className="text-lg font-semibold">Fintech Aile Hesabı Demo</h1>
          </div>
          <nav className="hidden gap-3 text-sm font-medium md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-full px-3 py-1 transition",
                  pathname === item.href
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:text-brand-700"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
        <StorageAlert />
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-6 text-sm text-slate-500">
          Gerçek para transferi yoktur. Veriler yalnızca tarayıcı depolamasında tutulur.
        </div>
      </footer>
    </div>
  );
};
