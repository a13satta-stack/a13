import { verifyPassword } from "../../../lib/auth";
import { getAuth, setPasswordHash, hashPassword } from "../../../lib/db";
import { json, badRequest, ensureApiAuth, readJson } from "../../../lib/api";

// POST /api/auth/password  { current, next }  (auth)
export async function POST(req: Request) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const body = await readJson(req);
  const current = String(body.current ?? "");
  const next = String(body.next ?? "");
  if (!(await verifyPassword(current))) return json({ error: "Current password is incorrect" }, 403);
  if (next.length < 6) return badRequest("new password must be at least 6 characters");

  const { secret } = await getAuth();
  await setPasswordHash(hashPassword(next, secret));
  return json({ ok: true });
}
