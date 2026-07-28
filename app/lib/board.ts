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

/**
 * Pick the ONE game the black board shows, by the clock:
 *
 *  - From `LEAD_MINUTES` before a game's result time until the next game's
 *    time, that game is "being awaited" → show its name with WAIT (until its
 *    number lands, when it becomes the last result).
 *  - Otherwise show the most recently declared result — the last number that
 *    actually came — so between declarations the board holds the last result.
 *  - Before the day's first declaration, fall back to yesterday's last result.
 *
 * Returns an array so the caller can render it with a simple map; it holds one
 * entry (or none, if no game has a usable time).
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

  // The game currently being awaited: earliest undeclared game whose window is
  // open — from LEAD_MINUTES before its time until the next game's time (after
  // which an undeclared game is treated as missed and skipped).
  for (let i = 0; i < timed.length; i++) {
    const { g, t } = timed[i];
    if (today[g.id]) continue;
    const start = t - LEAD_MINUTES;
    const end = i + 1 < timed.length ? timed[i + 1].t : t + 120;
    if (nowMin >= start && nowMin < end) return [{ game: g, result: undefined }];
  }

  // Nobody awaited → the most recent declared result whose time has passed.
  const declaredPast = timed.filter((x) => today[x.g.id] && x.t <= nowMin);
  if (declaredPast.length) {
    const g = declaredPast[declaredPast.length - 1].g;
    return [{ game: g, result: today[g.id] }];
  }
  // Any result declared today at all (e.g. an early one).
  const declaredAny = timed.filter((x) => today[x.g.id]);
  if (declaredAny.length) {
    const g = declaredAny[declaredAny.length - 1].g;
    return [{ game: g, result: today[g.id] }];
  }
  // Nothing today yet — hold yesterday's last result.
  const last = timed[timed.length - 1].g;
  return [{ game: last, result: yesterday[last.id] }];
}
