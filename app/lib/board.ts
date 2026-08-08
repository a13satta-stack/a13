import type { Game } from "./types";

/** One slot on the home page's black board. Absent `result` → show WAIT. */
export type LiveBoardEntry = { game: Game; result?: string };

/**
 * Parse a "6:10 PM" style result time into minutes since midnight, for ordering
 * games by when their result lands. Returns -1 for unparseable times.
 */
export function parseTimeToMinutes(time: string): number {
  const m = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(time);
  if (!m) return -1;
  let hour = Number(m[1]) % 12;
  const minute = Number(m[2]);
  if (m[3]?.toUpperCase() === "PM") hour += 12;
  return hour * 60 + minute;
}

/** Current minutes-since-midnight on the site's clock (India by default). */
export function nowMinutesInSiteTz(now: Date, tz = process.env.SITE_TZ ?? "Asia/Kolkata"): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hh * 60 + mm;
}

/** Minutes before a game's result time that the board starts showing it. */
export const LEAD_MINUTES = 30;
/** Minutes a game stays on the board after its result time (recent result). */
export const KEEP_MINUTES = 120;
/** Always keep at least this many of the most recent results on the board. */
export const MIN_RECENT = 2;
/** Safety cap on how many games the board shows at once. */
export const MAX_BOARD = 6;

/**
 * Pick the games the black board shows, by the clock:
 *
 *  - Every game whose window contains now — from `LEAD_MINUTES` before its
 *    result time until `KEEP_MINUTES` after it — appears, showing its number
 *    once declared or WAIT while awaited. So a fresh result stays up for a
 *    couple of hours and the next game(s) join with WAIT half an hour early.
 *  - On top of that, the last `MIN_RECENT` results that actually came today are
 *    always kept on the board, so the two most recent numbers stay visible even
 *    during a quiet gap between games.
 *  - Before the day's first result, it falls back to yesterday's last couple of
 *    results so the board is never empty.
 *
 * Entries come back in schedule (time) order.
 */
export function pickLiveBoard(
  games: Game[],
  today: Record<string, string>,
  yesterday: Record<string, string>,
  nowMin: number
): LiveBoardEntry[] {
  const timed = games
    .map((g) => ({ g, t: parseTimeToMinutes(g.time) }))
    .filter((x) => x.t >= 0)
    .sort((a, b) => a.t - b.t);
  if (timed.length === 0) return [];

  // Games currently in their [t - LEAD, t + KEEP] window (recent + upcoming).
  const inWindow = timed.filter(
    ({ t }) => nowMin >= t - LEAD_MINUTES && nowMin <= t + KEEP_MINUTES
  );
  // The most recent results that came today (whatever the hour), last MIN_RECENT.
  const recent = timed.filter((x) => today[x.g.id] && x.t <= nowMin).slice(-MIN_RECENT);

  const ids = new Set([...inWindow, ...recent].map((x) => x.g.id));
  if (ids.size > 0) {
    let chosen = timed.filter((x) => ids.has(x.g.id));
    // If it overflows, keep the ones nearest "now" (drop the oldest).
    if (chosen.length > MAX_BOARD) chosen = chosen.slice(chosen.length - MAX_BOARD);
    return chosen.map(({ g }) => ({ game: g, result: today[g.id] }));
  }

  // Nothing today yet — hold yesterday's last couple of results.
  const ydayDeclared = timed.filter((x) => yesterday[x.g.id]);
  const fallback = (ydayDeclared.length ? ydayDeclared : timed).slice(-MIN_RECENT);
  return fallback.map(({ g }) => ({ game: g, result: today[g.id] ?? yesterday[g.id] }));
}

/**
 * Pick the game for the yellow band under the board — the one that matters
 * *right now*, by the clock, instead of a single game pinned in settings:
 *
 *  - The freshest result of the day stays up for `KEEP_MINUTES` (2 hours)
 *    after its result time.
 *  - Once that window is over, the band moves on to the game whose result is
 *    still awaited (the next one due, or one running late).
 *  - Nothing awaited left today → keep the day's last declared result.
 *
 * Returns null only when there is no game with a usable time; the caller then
 * falls back to the admin's configured featured game.
 */
export function pickFeatured(
  games: Game[],
  today: Record<string, string>,
  nowMin: number
): Game | null {
  const timed = games
    .map((g) => ({ g, t: parseTimeToMinutes(g.time) }))
    .filter((x) => x.t >= 0)
    .sort((a, b) => a.t - b.t);
  if (timed.length === 0) return null;

  const declared = timed.filter((x) => today[x.g.id] && x.t <= nowMin);
  const last = declared[declared.length - 1];

  // A result that just came in owns the band for the next couple of hours.
  if (last && nowMin - last.t <= KEEP_MINUTES) return last.g;

  // Otherwise show the game we're waiting on — the earliest one still without a
  // result today that isn't long overdue (a skipped game must not stick).
  const awaiting = timed.find((x) => !today[x.g.id] && nowMin <= x.t + KEEP_MINUTES);
  if (awaiting) return awaiting.g;

  // Late in the day with everything declared: hold the last result.
  return last?.g ?? timed[timed.length - 1].g;
}
