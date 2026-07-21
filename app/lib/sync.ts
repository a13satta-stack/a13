import { fetchA7Home } from "./a7";
import { importA7Payload, type ImportSummary } from "./import-a7";

/**
 * Pulls results from upstream when a page is served, so a visitor loading or
 * refreshing the site sees the latest numbers without an operator importing by
 * hand. No timer: with nobody on the site, nothing is fetched.
 *
 * What keeps this from being expensive on every render:
 *  - `fetchA7Home` sends an If-None-Match, so an unchanged check is a 0-byte
 *    304 and never touches Mongo.
 *  - Concurrent renders share one in-flight fetch instead of each starting one.
 *  - A short throttle skips the upstream hop entirely during bursts of traffic.
 */

// Minimum gap between upstream checks. A burst of visitors inside this window
// renders from the database rather than each triggering their own request.
const MIN_INTERVAL_MS = Number(process.env.A7_SYNC_MIN_INTERVAL_MS ?? 3000);
// Off by default: upstream's notifications would replace notices set in admin.
const SYNC_NOTICES = process.env.A7_SYNC_NOTICES === "1";
const ENABLED = process.env.A7_SYNC_ENABLED !== "0";

export interface SyncState {
  enabled: boolean;
  minIntervalMs: number;
  runs: number;
  changes: number;
  errors: number;
  skipped: number;
  lastRunAt: string | null;
  lastChangeAt: string | null;
  lastStatus: "ok" | "unchanged" | "error" | null;
  lastError: string | null;
  lastSummary: ImportSummary | null;
}

// Held on globalThis so dev hot reloads don't reset counters or lose the lock.
const globalForSync = globalThis as unknown as {
  _a7Sync?: {
    state: SyncState;
    inFlight: Promise<SyncResult> | null;
    lastAttemptMs: number;
  };
};

function store() {
  if (!globalForSync._a7Sync) {
    globalForSync._a7Sync = {
      state: {
        enabled: ENABLED,
        minIntervalMs: MIN_INTERVAL_MS,
        runs: 0,
        changes: 0,
        errors: 0,
        skipped: 0,
        lastRunAt: null,
        lastChangeAt: null,
        lastStatus: null,
        lastError: null,
        lastSummary: null,
      },
      inFlight: null,
      lastAttemptMs: 0,
    };
  }
  return globalForSync._a7Sync;
}

export function getSyncState(): SyncState {
  return { ...store().state };
}

export type SyncResult =
  | { status: "unchanged" }
  | { status: "ok"; summary: ImportSummary }
  | { status: "skipped" };

async function doSync(force: boolean): Promise<SyncResult> {
  const s = store().state;
  try {
    const res = await fetchA7Home(force);
    s.runs++;
    s.lastRunAt = new Date().toISOString();
    s.lastError = null;

    if (res.status === "unchanged") {
      s.lastStatus = "unchanged";
      return { status: "unchanged" };
    }

    const summary = await importA7Payload(res.data, { importNotices: SYNC_NOTICES });
    s.changes++;
    s.lastChangeAt = s.lastRunAt;
    s.lastStatus = "ok";
    s.lastSummary = summary;
    console.log(
      `[a7-sync] upstream changed: ${summary.cellsWritten} cells across ${summary.gamesTouched} games`
    );
    return { status: "ok", summary };
  } catch (err) {
    s.runs++;
    s.errors++;
    s.lastRunAt = new Date().toISOString();
    s.lastStatus = "error";
    s.lastError = err instanceof Error ? err.message : String(err);
    throw err;
  }
}

/**
 * Run one sync pass, sharing any pass already in flight. Throws if upstream or
 * the import fails — callers rendering a page should use `syncOnPageLoad`.
 */
export function runSyncOnce(force = false): Promise<SyncResult> {
  const g = store();
  if (g.inFlight) return g.inFlight;

  g.lastAttemptMs = Date.now();
  const p = doSync(force).finally(() => {
    g.inFlight = null;
  });
  g.inFlight = p;
  return p;
}

/**
 * Refresh from upstream while serving a page.
 *
 * Never throws and never blocks a render for long: if upstream is slow, down,
 * or was checked moments ago, the page just renders what's already in the
 * database. Stale results beat a broken page.
 */
export async function syncOnPageLoad(): Promise<SyncResult> {
  const g = store();
  if (!ENABLED) return { status: "skipped" };

  // Join a pass already running rather than starting a second one.
  if (g.inFlight) {
    try {
      return await g.inFlight;
    } catch {
      return { status: "skipped" };
    }
  }

  if (Date.now() - g.lastAttemptMs < MIN_INTERVAL_MS) {
    g.state.skipped++;
    return { status: "skipped" };
  }

  try {
    return await runSyncOnce();
  } catch (err) {
    // Already recorded in state; a page load is not the place to surface it.
    const msg = err instanceof Error ? err.message : String(err);
    if (g.state.errors <= 3) console.error(`[a7-sync] ${msg}`);
    return { status: "skipped" };
  }
}
