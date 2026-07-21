import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGamesSorted, getSettings, getResultsForYear, getResultsForDate, dateKey } from "../../lib/db";
import { slugify } from "../../lib/slug";
import { syncOnPageLoad } from "../../lib/sync";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import YearlyChart from "../../components/YearlyChart";
import RefreshButton from "../../components/RefreshButton";

export const dynamic = "force-dynamic";

async function findGame(slug: string) {
  const games = await getGamesSorted();
  return games.find((g) => slugify(g.name) === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await findGame(slug);
  if (!game) return { title: "Game not found" };

  const year = new Date().getFullYear();
  const title = `${game.name} Satta King Result Today & Chart ${year}`;
  const description = `${game.name} satta king result today, live update at ${game.time}, plus the full ${year} record chart. Fastest ${game.name} result on A13SATTA.`;

  return {
    title,
    description,
    // Each game page targets its own name — the phrase people actually type.
    keywords: [
      game.name,
      `${game.name} satta king`,
      `${game.name} satta king result`,
      `${game.name} result today`,
      `${game.name} chart`,
      `${game.name} record chart ${year}`,
    ],
    alternates: { canonical: `/game/${slug}` },
    openGraph: { title, description, url: `/game/${slug}`, type: "article" },
  };
}

export default async function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  await syncOnPageLoad();

  const { slug } = await params;
  const game = await findGame(slug);
  if (!game) notFound();

  const sp = await searchParams;
  const now = new Date();
  const year = Number(sp.year) || now.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 4 + i);

  const [settings, results, todayMap] = await Promise.all([
    getSettings(),
    getResultsForYear(year),
    getResultsForDate(dateKey()),
  ]);
  const todayResult = todayMap[game.id];
  const name = game.name;

  return (
    <>
      <SiteHeader siteName={settings.siteName} />

      <div className="bg-satta-yellow py-3 text-center">
        <h2 className="text-xl font-extrabold">{settings.siteName}</h2>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-[5px] py-4">
        {/* Controls */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-bold">Today&apos;s {name}:</span>{" "}
            <span className="text-xl font-black text-satta-red">
              {todayResult ?? "Wait"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <form method="GET" className="flex items-center gap-2">
              <select
                name="year"
                defaultValue={year}
                className="rounded border-2 border-black bg-white px-3 py-1.5 text-sm font-bold"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button className="rounded bg-zinc-800 px-3 py-1.5 text-sm font-bold text-white">
                Show
              </button>
            </form>
            <RefreshButton />
          </div>
        </div>

        <div className="rounded-lg border-2 border-black">
          <YearlyChart game={game} results={results} year={year} />
        </div>

        {/* SEO / info content */}
        <section className="mt-6 space-y-5 text-[15px] leading-relaxed text-zinc-800">
          <div>
            <h3 className="text-2xl font-extrabold text-black">What is {name.toLowerCase()} satta?</h3>
            <p className="mt-1">
              {name} satta is a popular satta king game which is famous across India. It has been
              widely played and is named after a well-known market. In the local language the game
              carries the market&apos;s name, and over the years {name} has become one of the most
              searched satta results.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-black">
              What time {name.toLowerCase()} satta result comes?
            </h3>
            <p className="mt-1">
              {name} satta, also called {name.toLowerCase()} satta king result, comes everyday around{" "}
              <span className="font-bold">{game.time || "its scheduled time"}</span>.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-black">
              Where can i check {name.toLowerCase()} latest result realtime?
            </h3>
            <p className="mt-1">
              {settings.siteName} updates {name.toLowerCase()} result realtime everyday at{" "}
              {game.time || "the result time"}. To check today&apos;s result{" "}
              <Link href="/" className="text-blue-700 underline">
                click here
              </Link>
              .
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-black">
              Which website shows instant {name.toLowerCase()} satta king result?
            </h3>
            <p className="mt-1">
              On the internet you will find thousands of result websites, but the question is which
              one is instant and reliable. {settings.siteName} is one of the fast and consistent
              websites to publish real-time {name.toLowerCase()} satta results along with other satta
              games. To check today&apos;s result click{" "}
              <Link href="/" className="text-blue-700 underline">
                Today&apos;s {name} Superfast Result
              </Link>
              .
            </p>
          </div>
        </section>

        <div className="mt-6 bg-satta-yellow py-2 text-center">
          <h3 className="text-xl font-extrabold">
            {name} Satta King as a form of entertainment
          </h3>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-800">
          {name} Satta King has evolved into a popular form of entertainment, captivating a wide
          range of players who are drawn to the thrill and anticipation that the game provides. For
          many, it serves as a break from daily routines, offering an engaging experience that
          combines luck, strategy, and community interaction. The simplicity of the rules makes it
          accessible to newcomers, yet the game&apos;s dynamic nature keeps seasoned players
          returning for more. For many, the experience isn&apos;t solely about winning; rather,
          it&apos;s the combination of excitement, community, and chance that makes {name} a
          cherished pastime.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="rounded bg-black px-6 py-2 text-sm font-bold text-satta-yellow"
          >
            ← Back to all results
          </Link>
        </div>
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
