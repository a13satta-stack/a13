import { json } from "../../lib/api";
import { getSettings } from "../../lib/db";
import { syncOnPageLoad } from "../../lib/sync";

// Never cache this — it must consult the live toggle and run the sync.
export const dynamic = "force-dynamic";

/**
 * POST /api/auto-sync — the public auto-refresh trigger.
 *
 * Called by the home page's client trigger after paint. It does something ONLY
 * when the admin's `autoSync` setting is on; otherwise it returns immediately
 * without ever contacting a7satta. `syncOnPageLoad` throttles and shares one
 * in-flight fetch, so a burst of visitors collapses to a single upstream pull —
 * this can't be used to hammer upstream. No auth: it only mirrors a7satta's
 * public results into the database, and only while the operator has enabled it.
 */
export async function POST() {
  const settings = await getSettings();
  if (!settings.autoSync) {
    return json({ ok: true, status: "disabled" });
  }
  const result = await syncOnPageLoad();
  return json({ ok: true, ...result });
}
