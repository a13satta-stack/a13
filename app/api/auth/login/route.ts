import { verifyPassword, createSession } from "../../../lib/auth";
import { json, badRequest, readJson } from "../../../lib/api";

// POST /api/auth/login  { password }  -> sets httpOnly session cookie
export async function POST(req: Request) {
  const body = await readJson(req);
  const password = String(body.password ?? "");
  if (!password) return badRequest("password is required");
  if (!(await verifyPassword(password))) {
    return json({ error: "Incorrect password" }, 401);
  }
  await createSession();
  return json({ ok: true });
}
