import { isAuthenticated } from "../../../lib/auth";
import { json } from "../../../lib/api";

// GET /api/auth/session -> { authenticated: boolean }
export async function GET() {
  return json({ authenticated: await isAuthenticated() });
}
