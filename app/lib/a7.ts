import { createHash } from "crypto";
import type { A7Payload, ChartRow } from "./import-a7";

/**
 * Client for the upstream A7Satta Next.js data endpoints.
 *
 * Two things make this fiddly and are handled here:
 *
 *  - The data URL embeds upstream's *build id* (`/_next/data/<buildId>/...`),
 *    which rotates on every redeploy and makes the old URL 404. We discover it
 *    from `__NEXT_DATA__` in the homepage HTML and re-discover on a 404 rather
 *    than hardcoding it.
 *  - The endpoint honours `If-None-Match`, so an unchanged poll costs a 0-byte
 *    304 instead of ~97 KB. That is what makes a 10s interval reasonable.
 */

const ORIGIN = (process.env.A7_ORIGIN ?? "https://a7satta.com").replace(/\/+$/, "");
const UA = process.env.A7_USER_AGENT ?? "Mozilla/5.0 (compatible; a7sync/1.0)";
const TIMEOUT_MS = Number(process.env.A7_TIMEOUT_MS ?? 15000);

// Survive dev hot reloads so we don't re-discover the build id on every edit.
const globalForA7 = globalThis as unknown as {
  _a7?: { buildId: string | null; etag: string | null; hash: string | null };
};
function state() {
  if (!globalForA7._a7) globalForA7._a7 = { buildId: null, etag: null, hash: null };
  return globalForA7._a7;
}

/**
 * Fingerprint of just the parts we import. Upstream's ETag also rotates when
 * their page is regenerated with identical data, so this is what actually
 * decides whether there's work to do.
 */
function payloadHash(data: A7Payload): string {
  return createHash("sha1")
    .update(JSON.stringify({ results: data.results ?? null, chart: data.chart ?? null }))
    .digest("hex");
}

function get(url: string, headers: Record<string, string> = {}): Promise<Response> {
  return fetch(url, {
    headers: { "user-agent": UA, accept: "application/json", ...headers },
    // Deliberately no `cache: "no-store"`. That makes fetch send
    // `Cache-Control: no-cache`, which tells upstream's CDN to bypass its cache
    // and answer 200 even when our If-None-Match matches — defeating the whole
    // point of conditional polling. Next's default ("auto no cache") already
    // hits the network every time, and `revalidate: 0` keeps it out of the Data
    // Cache; the AbortSignal also opts this out of request memoization.
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

/** Scrape the current build id out of the upstream homepage's __NEXT_DATA__. */
async function discoverBuildId(): Promise<string> {
  const res = await get(`${ORIGIN}/`, { accept: "text/html" });
  if (!res.ok) throw new Error(`homepage returned ${res.status}`);
  const html = await res.text();
  const m = /"buildId"\s*:\s*"([^"]+)"/.exec(html);
  if (!m) throw new Error("could not find buildId in homepage HTML");
  return m[1];
}

export async function getBuildId(force = false): Promise<string> {
  const s = state();
  if (!s.buildId || force) s.buildId = await discoverBuildId();
  return s.buildId;
}

export type A7Fetch = { status: "unchanged" } | { status: "ok"; data: A7Payload };

/**
 * Fetch the upstream home payload — every game's live today/yesterday plus the
 * current month's chart — in a single request.
 *
 * Returns `{ status: "unchanged" }` when upstream answers 304, which is the
 * common case on a short poll interval. Pass `force` to ignore the cached ETag.
 */
export async function fetchA7Home(force = false): Promise<A7Fetch> {
  const s = state();
  let buildId = await getBuildId();

  const attempt = (id: string) => {
    const headers: Record<string, string> = {};
    if (s.etag && !force) headers["if-none-match"] = s.etag;
    return get(`${ORIGIN}/_next/data/${id}/index.json`, headers);
  };

  let res = await attempt(buildId);

  // A redeploy rotates the build id; the stale URL 404s. Re-discover and retry.
  if (res.status === 404) {
    const fresh = await discoverBuildId();
    if (fresh !== buildId) {
      s.buildId = fresh;
      s.etag = null;
      buildId = fresh;
      res = await attempt(fresh);
    }
  }

  if (res.status === 304) return { status: "unchanged" };
  if (!res.ok) throw new Error(`index.json returned ${res.status}`);

  const body = (await res.json()) as { pageProps?: A7Payload };
  const data = body?.pageProps;
  if (!data || typeof data !== "object") {
    throw new Error("unexpected payload: pageProps missing");
  }

  // Only trust these once the body actually parsed.
  s.etag = res.headers.get("etag");
  const hash = payloadHash(data);
  const seen = s.hash === hash;
  s.hash = hash;

  // A 200 whose contents we've already imported (upstream regenerated the page
  // without changing any result). Nothing to write.
  if (seen && !force) return { status: "unchanged" };

  return { status: "ok", data };
}

/**
 * Fetch one game's full-year chart history from its per-slug page
 * (`/_next/data/<buildId>/<slug>.json`). Used for backfill, not for polling —
 * the home payload already carries every game's live result.
 */
export async function fetchA7GameChart(slug: string): Promise<ChartRow[]> {
  const buildId = await getBuildId();
  const url = `${ORIGIN}/_next/data/${buildId}/${slug}.json?slug=${encodeURIComponent(slug)}`;

  let res = await get(url);
  if (res.status === 404) {
    const fresh = await getBuildId(true);
    res = await get(`${ORIGIN}/_next/data/${fresh}/${slug}.json?slug=${encodeURIComponent(slug)}`);
  }
  if (!res.ok) throw new Error(`${slug}.json returned ${res.status}`);

  const body = (await res.json()) as { pageProps?: { data?: ChartRow[] } };
  return body?.pageProps?.data ?? [];
}
