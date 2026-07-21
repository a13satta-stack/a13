import Link from "next/link";
import type { Metadata } from "next";
import { getGamesSorted, getSettings } from "../lib/db";
import { syncOnPageLoad } from "../lib/sync";
import { slugify } from "../lib/slug";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const year = new Date().getFullYear();
  const title = `Satta King Chart ${year} — All Games Record Chart`;
  const description = `View the full satta king record chart ${year} for sadar bazar, shri ganesh, delhi bazar, gali and disawar. Pick a game to open its complete yearly chart.`;
  return {
    title,
    description,
    alternates: { canonical: "/chart" },
    openGraph: { title, description, url: "/chart", type: "website" },
  };
}

export default async function ChartPage() {
  await syncOnPageLoad();

  const [settings, games] = await Promise.all([getSettings(), getGamesSorted()]);
  const year = new Date().getFullYear();

  return (
    <>
      <SiteHeader siteName={settings.siteName} />

      {/* Title banner */}
      <div className="bg-satta-yellow py-6 text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wide text-black sm:text-4xl">
          {settings.siteName}
        </h1>
      </div>
      <div className="bg-black py-6 text-center">
        <p className="text-base font-bold text-white sm:text-lg">
          {settings.siteName.replace(/\s+OFFICIAL$/i, "")} provides all kind of satta king
          results everyday.
        </p>
      </div>

      {/* Section header */}
      <div className="bg-gradient-to-b from-satta-yellow via-orange-400 to-satta-yellow py-6 text-center">
        <h2 className="text-2xl font-extrabold uppercase tracking-wide text-black sm:text-3xl">
          Satta King Chart {year}
        </h2>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-[5px] py-5">
        {games.length === 0 ? (
          <p className="py-10 text-center font-bold text-black">No games configured.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <Link
                key={g.id}
                href={`/game/${slugify(g.name)}`}
                className="rounded-md bg-satta-yellow px-4 py-4 text-center text-sm font-extrabold uppercase text-black transition-colors hover:bg-black hover:text-satta-yellow"
              >
                {g.name} Satta King Chart {year}
              </Link>
            ))}
          </div>
        )}
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
