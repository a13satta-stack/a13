import { json, ensureApiAuth, readJson, revalidateSite } from "../../lib/api";
import { importA7Payload, type A7Payload } from "../../lib/import-a7";

/**
 * POST /api/import  (auth)
 * Body = the A7Satta home payload (or { data: <payload> }) containing
 * `results.table1/table2`, `chart.table1/table2`, and optional `notifications`.
 * Games are upserted by name, today/yesterday cells are written to the current
 * dates, and the full chart history is stored. Values of -1 are skipped.
 */
export async function POST(req: Request) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const body = await readJson(req);
  const data = (body.data ?? body) as A7Payload;

  const summary = await importA7Payload(data);

  revalidateSite();
  return json({ ok: true, ...summary });
}
