"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "../actions/auth";
import { ToastProvider } from "./Toast";
import SubmitButton from "./SubmitButton";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/results", label: "Results", icon: "📊" },
  { href: "/admin/games", label: "Games", icon: "🎯" },
  { href: "/admin/khaiwals", label: "Khaiwal Boxes", icon: "📢" },
  { href: "/admin/posts", label: "Blog", icon: "📝" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-satta-yellow text-sm font-black text-zinc-900 shadow">
        A13
      </span>
      <span className="text-sm font-extrabold tracking-wide text-white">
        SATTA <span className="text-satta-yellow">Admin</span>
      </span>
    </div>
  );
}

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="flex items-center justify-between px-4 py-4">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-zinc-400 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <p className="px-5 pb-2 pt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Menu
      </p>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-2">
        {NAV.map((n) => {
          const active = isActive(pathname, n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-satta-yellow text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span aria-hidden className="text-base leading-none">
                {n.icon}
              </span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 px-3 py-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          View Site <span aria-hidden>↗</span>
        </Link>
        <form action={logoutAction}>
          <SubmitButton
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600/90 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            pendingLabel="Signing out…"
          >
            Logout
          </SubmitButton>
        </form>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 lg:flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>

        {/* Mobile drawer + backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setOpen(false)}
          aria-hidden
        />
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform shadow-2xl transition-transform duration-200 lg:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar}
        </aside>

        {/* Content column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Sticky top bar */}
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/75">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg p-1 text-2xl leading-none text-zinc-700 hover:text-zinc-900 lg:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>
            <h1 className="text-lg font-bold text-zinc-900 sm:text-xl">{title}</h1>
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
