import { json, unauthorized, revalidateSite } from "../../lib/api";
import { isAuthenticated } from "../../lib/auth";
import { runSyncOnce, getSyncState } from "../../lib/sync";

/**
 * Pull one update from upstream on demand. The background loop in
 * `instrumentation.ts` does this automatically; this endpoint exists for the
 * admin "sync now" path and for an external scheduler (cron / Task Scheduler)
 * when you'd rather not run the in-process loop.
 *
 * Authorised by an admin session, or by `Authorization: Bearer $CRON_SECRET`
 * so a scheduler can call it without logging in.
 */
async function authorize(req: Request): Promise<boolean> {
  if (await isAuthenticated()) return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

/** GET /api/sync — loop status and counters. */
export async function GET(req: Request) {
  if (!(await authorize(req))) return unauthorized();
  return json({ ok: true, state: getSyncState() });
}

/** POST /api/sync — run one pass now. `?force=1` ignores the cached ETag. */
export async function POST(req: Request) {
  if (!(await authorize(req))) return unauthorized();

  const force = new URL(req.url).searchParams.get("force") === "1";

  try {
    const result = await runSyncOnce(force);
    if (result.status === "ok") revalidateSite();
    return json({ ok: true, ...result, state: getSyncState() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message, state: getSyncState() }, 502);
  }
}
