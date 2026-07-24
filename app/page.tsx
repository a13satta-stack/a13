import Link from "next/link";
import {
  getGamesSorted,
  getSettings,
  getResultsForMonth,
  getResultsForDate,
  getPosts,
  getKhaiwalsSorted,
  dateKey,
} from "./lib/db";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import FeaturedBanner from "./components/FeaturedBanner";
import NoticeMarquee from "./components/NoticeMarquee";
import KhaiwalBoxes from "./components/KhaiwalBoxes";
import ResultsBoard from "./components/ResultsBoard";
import ChartTable from "./components/ChartTable";

export const dynamic = "force-dynamic";

function whatsappLink(number: string, text: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default async function Home() {
  // Reads straight from the database — no upstream fetch on the render path.
  // Results are pulled from a7satta only when an admin clicks "Fetch results"
  // in the panel; this page just shows whatever is stored.
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);

  const [settings, games, results, yesterdayResults, posts, khaiwals] = await Promise.all([
    getSettings(),
    getGamesSorted(),
    getResultsForMonth(now.getFullYear(), now.getMonth()),
    getResultsForDate(yesterdayKey),
    getPosts(),
    getKhaiwalsSorted(),
  ]);

  const today = dateKey();
  const todayResults = results[today] ?? {};
  const featured = games.find((g) => g.id === settings.featuredGameId) ?? games[0] ?? null;
  // The black live board shows the first three games in admin order; the
  // featured game gets the yellow band underneath.
  const liveGames = games.filter((g) => g.id !== featured?.id).slice(0, 3);

  return (
    <>
      <SiteHeader siteName={settings.siteName} />

      <FeaturedBanner
        siteName={settings.siteName}
        tagline={settings.tagline}
        liveGames={liveGames}
        featured={featured}
        today={todayResults}
        yesterday={yesterdayResults}
      />

      <NoticeMarquee settings={settings} />

      <main className="flex-1">
        <KhaiwalBoxes boxes={khaiwals} />

        <ResultsBoard games={games} today={todayResults} yesterday={yesterdayResults} />

        {/* WhatsApp CTA */}
        <section className="mx-auto max-w-5xl px-[5px] py-2">
          <div className="rounded-lg border-2 border-black bg-white p-4 text-center">
            <p className="text-sm font-bold text-red-700">
              सबसे तेज़ रिजल्ट के लिए हमारे व्हाट्सएप ग्रुप से जुड़ें
            </p>
            <a
              href={whatsappLink(settings.whatsappNumber, "Add me to satta results group")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded bg-[#25D366] px-6 py-2 text-sm font-bold text-white"
            >
              Join WhatsApp
            </a>
          </div>
        </section>

        {/* Record chart (current month) */}
        <section className="mx-auto max-w-5xl px-[5px] py-3">
          <ChartTable
            games={games}
            results={results}
            year={now.getFullYear()}
            month={now.getMonth()}
          />
          <div className="mt-2 text-center">
            <Link
              href="/chart"
              className="inline-block rounded bg-black px-5 py-2 text-sm font-bold text-satta-yellow"
            >
              View Full Record Chart
            </Link>
          </div>
        </section>

        {/* Blog */}
        {posts.length > 0 && (
          <section className="mx-auto max-w-5xl px-[5px] py-3">
            <div className="overflow-hidden rounded-lg border-2 border-black bg-white">
              <div className="bg-black py-2 text-center text-lg font-bold text-satta-yellow">
                A13SATTA  BLOG
              </div>
              <div className="divide-y divide-black/10">
                {posts.map((p) => (
                  <article key={p.id} className="px-4 py-3">
                    <h2 className="text-base font-bold text-black">{p.title}</h2>
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{p.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
