import { findGameByName, upsertGame, bulkSetResults, saveSettings, dateKey } from "./db";
import type { ResultTable } from "./types";
import { to12h } from "./time";

// ---- Upstream payload shapes ----------------------------------------------

export interface ResultRow {
  gameName?: string;
  gameResultTime?: string;
  today?: number | string;
  yesterday?: number | string;
}
export interface ChartRow {
  gameName?: string;
  result?: number | string;
  resultDate?: string;
  chartTable?: string;
}
export interface Notification {
  title?: string;
  content?: string;
  status?: string;
}

/** The A7Satta home payload (`pageProps` of `/_next/data/<buildId>/index.json`). */
export interface A7Payload {
  results?: Record<string, ResultRow[]>;
  chart?: Record<string, ChartRow[]>;
  notifications?: Notification[];
  games?: { gameName?: string; slug?: string }[];
}

export interface ImportSummary {
  gamesTouched: number;
  cellsWritten: number;
  noticesImported: number;
}

export interface ImportOptions {
  /**
   * Replace the site's marquee notices with upstream's notifications.
   * On for an operator-triggered import; off for the background poller, which
   * would otherwise overwrite notices edited in admin every time a result lands.
   */
  importNotices?: boolean;
}

// ---- Format helpers --------------------------------------------------------

/** Convert "01-07-2026" (DD-MM-YYYY) -> "2026-07-01". */
export function toDateKey(raw: string): string | null {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(raw.trim());
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;|["“”]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// ---- Import ----------------------------------------------------------------

/**
 * Apply an A7Satta home payload to the database: games are upserted by name,
 * today/yesterday cells are written to the current dates, and any chart history
 * in the payload is stored. Values of -1 are skipped rather than cleared.
 *
 * Callers running inside a request should follow up with `revalidateSite()`.
 */
export async function importA7Payload(
  data: A7Payload,
  options: ImportOptions = {}
): Promise<ImportSummary> {
  const { importNotices = true } = options;
  const nameToId = new Map<string, string>();
  let gamesTouched = 0;

  // Only the results tables carry a game's time and true table; chart rows have
  // neither. Resolve both up front, because the chart is imported first and
  // would otherwise create a game with a blank time and cache it — after which
  // the results pass hits the cache and never gets to apply the real one.
  const timeByName = new Map<string, string>();
  const tableByName = new Map<string, ResultTable>();
  for (const [table, rows] of Object.entries(data.results ?? {})) {
    const t: ResultTable = table === "table2" ? "table2" : "table1";
    for (const r of rows ?? []) {
      if (!r.gameName) continue;
      const key = r.gameName.trim().toLowerCase();
      tableByName.set(key, t);
      const time = to12h(String(r.gameResultTime ?? ""));
      if (time) timeByName.set(key, time);
    }
  }

  async function ensureGame(name: string, fallbackTable: ResultTable): Promise<string> {
    const key = name.trim().toLowerCase();
    const cached = nameToId.get(key);
    if (cached) return cached;

    const time = timeByName.get(key) ?? "";
    const table = tableByName.get(key) ?? fallbackTable;

    const existing = await findGameByName(name);
    if (existing) {
      await upsertGame({
        id: existing.id,
        name: existing.name,
        // Keep whatever is set if upstream didn't tell us a time.
        time: time || existing.time,
        active: existing.active,
        table: table || existing.table,
      });
      nameToId.set(key, existing.id);
      gamesTouched++;
      return existing.id;
    }
    // Appended, not prepended: a game upstream just started publishing should
    // not silently take over the home page's live board.
    const created = await upsertGame({
      name: name.trim(),
      time,
      active: true,
      table,
      placement: "bottom",
    });
    nameToId.set(key, created.id);
    gamesTouched++;
    return created.id;
  }

  const today = dateKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dateKey(yesterdayDate);

  const cells: { date: string; gameId: string; value: unknown }[] = [];

  // 1) Historical chart data (previous days).
  const chart = data.chart ?? {};
  for (const [table, rows] of Object.entries(chart)) {
    const t: ResultTable = table === "table2" ? "table2" : "table1";
    for (const r of rows ?? []) {
      if (!r.gameName) continue;
      const date = toDateKey(String(r.resultDate ?? ""));
      if (!date) continue;
      const id = await ensureGame(r.gameName, t);
      cells.push({ date, gameId: id, value: r.result });
    }
  }

  // 2) Live today/yesterday from the results tables (these win over chart).
  const results = data.results ?? {};
  for (const [table, rows] of Object.entries(results)) {
    const t: ResultTable = table === "table2" ? "table2" : "table1";
    for (const r of rows ?? []) {
      if (!r.gameName) continue;
      const id = await ensureGame(r.gameName, t);
      cells.push({ date: today, gameId: id, value: r.today });
      cells.push({ date: yesterday, gameId: id, value: r.yesterday });
    }
  }

  const cellsWritten = await bulkSetResults(cells);

  // 3) Notifications -> marquee notices (optional).
  let noticesImported = 0;
  if (importNotices && Array.isArray(data.notifications)) {
    const notices = data.notifications
      .filter((n) => (n.status ?? "Y") === "Y" && n.content)
      .map((n) => stripHtml(String(n.content)))
      .filter(Boolean);
    if (notices.length) {
      await saveSettings({ notices });
      noticesImported = notices.length;
    }
  }

  return { gamesTouched, cellsWritten, noticesImported };
}
