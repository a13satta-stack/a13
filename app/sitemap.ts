import type { MetadataRoute } from "next";
import { getGamesSorted } from "./lib/db";
import { slugify } from "./lib/slug";
import { absoluteUrl } from "./lib/seo";

// Game rows come from the database, so this cannot be baked at build time.
export const dynamic = "force-dynamic";

/**
 * Serves /sitemap.xml. Results change every day, so the home page and every
 * per-game chart are marked `daily` — that is the crawl budget worth spending.
 * The static policy pages are marked `yearly`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/chart"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // A sitemap that 500s is worse than one missing the game pages, so a database
  // hiccup degrades to the static routes rather than failing the whole file.
  let gameRoutes: MetadataRoute.Sitemap = [];
  try {
    const games = await getGamesSorted();
    gameRoutes = games.map((g) => ({
      url: absoluteUrl(`/game/${slugify(g.name)}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch {
    gameRoutes = [];
  }

  return [...staticRoutes, ...gameRoutes];
}
