/**
 * Backfill full chart history from A7Satta's per-game pages.
 *
 * The background poller (app/lib/sync.ts) keeps today's results current, but the
 * home payload only carries the current month's chart. Each game's own page
 * (/_next/data/<buildId>/<slug>.json?slug=<slug>) carries the whole year, so
 * this walks every game once and imports it. Run it when setting up, or after a
 * long outage — not on a schedule.
 *
 * Usage:  BASE=http://localhost:3000 PASSWORD=admin123 node scripts/backfill-a7-history.mjs
 * Defaults: BASE=http://localhost:3000  PASSWORD=admin123  ORIGIN=https://a7satta.com
 */

const BASE = process.env.BASE || "http://localhost:3000";
const PASSWORD = process.env.PASSWORD || "admin123";
const ORIGIN = (process.env.A7_ORIGIN || "https://a7satta.com").replace(/\/+$/, "");
const UA = "Mozilla/5.0 (compatible; a7sync/1.0)";
const GAMES_PER_REQUEST = 8;
const DELAY_MS = 250; // be polite to upstream between game fetches

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, accept = "application/json") {
  const res = await fetch(url, { headers: { "user-agent": UA, accept } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return accept === "text/html" ? res.text() : res.json();
}

/** The data URL embeds upstream's build id, which rotates on every redeploy. */
async function discoverBuildId() {
  const html = await getJson(`${ORIGIN}/`, "text/html");
  const m = /"buildId"\s*:\s*"([^"]+)"/.exec(html);
  if (!m) throw new Error("could not find buildId in homepage HTML");
  return m[1];
}

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  const buildId = await discoverBuildId();
  console.log(`buildId: ${buildId}`);

  const home = await getJson(`${ORIGIN}/_next/data/${buildId}/index.json`);
  const pp = home.pageProps || {};

  // Which table each game belongs to, so backfilled rows don't move it.
  const tableOf = new Map();
  for (const [table, rows] of Object.entries(pp.results || {})) {
    for (const r of rows || []) {
      if (r.gameName) tableOf.set(r.gameName.trim().toLowerCase(), table === "table2" ? "table2" : "table1");
    }
  }

  const games = (pp.games || [])
    .filter((g) => g.gameName)
    .map((g) => ({
      name: g.gameName,
      slug: g.slug || slugify(g.gameName),
      table: tableOf.get(g.gameName.trim().toLowerCase()) || "table1",
    }));

  if (!games.length) throw new Error("no games found in home payload");
  console.log(`${games.length} games to backfill`);

  // Login once for the import cookie.
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  if (!login.ok) throw new Error(`login failed: ${login.status} ${await login.text()}`);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("no session cookie returned");

  let totalCells = 0;

  for (let i = 0; i < games.length; i += GAMES_PER_REQUEST) {
    const batch = games.slice(i, i + GAMES_PER_REQUEST);
    const chart = { table1: [], table2: [] };

    for (const game of batch) {
      try {
        const url = `${ORIGIN}/_next/data/${buildId}/${game.slug}.json?slug=${encodeURIComponent(game.slug)}`;
        const page = await getJson(url);
        const rows = page.pageProps?.data || [];
        for (const r of rows) {
          if (!r.resultDate) continue;
          chart[game.table].push({
            gameName: r.gameName || game.name,
            result: r.result,
            resultDate: r.resultDate,
            chartTable: game.table,
          });
        }
        console.log(`  ${game.name} (${game.slug}): ${rows.length} rows -> ${game.table}`);
      } catch (e) {
        console.warn(`  ${game.name} (${game.slug}): SKIPPED — ${e.message}`);
      }
      await sleep(DELAY_MS);
    }

    const rowCount = chart.table1.length + chart.table2.length;
    if (!rowCount) continue;

    const res = await fetch(`${BASE}/api/import`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ chart }),
    });
    const out = await res.json();
    if (!res.ok) throw new Error(`import failed: ${res.status} ${JSON.stringify(out)}`);
    totalCells += out.cellsWritten ?? 0;
    console.log(`imported ${rowCount} rows (${out.cellsWritten} cells written)`);
  }

  console.log(`\nDone. ${totalCells} cells written.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
