import Link from "next/link";
import { guard } from "./guard";
import AdminShell from "./AdminShell";
import {
  getGamesSorted,
  getResultsForDate,
  countResultDays,
  getPosts,
  getKhaiwalsSorted,
  dateKey,
} from "../lib/db";
import { card, btnPrimary, btnGhost } from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await guard();
  const [games, todayMap, resultDays, posts, khaiwals] = await Promise.all([
    getGamesSorted(),
    getResultsForDate(dateKey()),
    countResultDays(),
    getPosts(),
    getKhaiwalsSorted(),
  ]);

  const declaredToday = Object.keys(todayMap).length;

  const cards = [
    { label: "Games", value: games.length, href: "/admin/games", icon: "🎯", accent: "bg-blue-500" },
    { label: "Result days", value: resultDays, href: "/admin/results", icon: "📅", accent: "bg-violet-500" },
    {
      label: "Declared today",
      value: `${declaredToday}/${games.length}`,
      href: "/admin/results",
      icon: "✅",
      accent: "bg-emerald-500",
    },
    { label: "Khaiwal boxes", value: khaiwals.length, href: "/admin/khaiwals", icon: "📢", accent: "bg-amber-500" },
    { label: "Blog posts", value: posts.length, href: "/admin/posts", icon: "📝", accent: "bg-rose-500" },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`${card} group relative overflow-hidden p-4 transition hover:-translate-y-0.5 hover:shadow-md`}
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${c.accent}`} />
            <div className="flex items-start justify-between">
              <span className="text-3xl font-black text-zinc-900">{c.value}</span>
              <span className="text-xl opacity-80">{c.icon}</span>
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {c.label}
            </div>
          </Link>
        ))}
      </div>

      <div className={`${card} mt-6 p-5`}>
        <h2 className="mb-3 text-lg font-bold">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/results" className={btnPrimary}>
            📊 Enter today&apos;s results
          </Link>
          <Link href="/admin/games" className={btnGhost}>
            🎯 Add / edit games
          </Link>
          <Link href="/admin/khaiwals" className={btnGhost}>
            📢 Manage khaiwal boxes
          </Link>
          <Link href="/admin/settings" className={btnGhost}>
            ⚙️ Site settings
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
