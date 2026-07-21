import {
  getResultsForDate,
  getResultsForMonth,
  getResultsForYear,
  saveResultsForDate,
} from "../../lib/db";
import { json, badRequest, ensureApiAuth, readJson, revalidateSite } from "../../lib/api";

// GET /api/results?date=YYYY-MM-DD
// GET /api/results?year=YYYY[&month=0-11]
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return badRequest("invalid date");
    return json({ date, values: await getResultsForDate(date) });
  }
  if (year) {
    const y = Number(year);
    if (!Number.isInteger(y)) return badRequest("invalid year");
    if (month !== null) {
      const m = Number(month);
      if (!Number.isInteger(m) || m < 0 || m > 11) return badRequest("invalid month (0-11)");
      return json({ results: await getResultsForMonth(y, m) });
    }
    return json({ results: await getResultsForYear(y) });
  }
  return badRequest("provide ?date= or ?year=[&month=]");
}

// POST /api/results  { date: "YYYY-MM-DD", values: { gameId: "45", ... } }  (auth)
export async function POST(req: Request) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const body = await readJson(req);
  const date = String(body.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return badRequest("invalid date");
  const rawValues = body.values;
  if (!rawValues || typeof rawValues !== "object") return badRequest("values object required");

  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawValues as Record<string, unknown>)) {
    values[k] = v == null ? "" : String(v);
  }

  await saveResultsForDate(date, values);
  revalidateSite();
  return json({ date, values: await getResultsForDate(date) });
}
