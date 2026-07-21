import { destroySession } from "../../../lib/auth";
import { json } from "../../../lib/api";

// POST /api/auth/logout -> clears session cookie
export async function POST() {
  await destroySession();
  return json({ ok: true });
}
