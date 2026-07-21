import { getGamesSorted, upsertGame, DuplicateGameNameError } from "../../lib/db";
import {
  json,
  badRequest,
  conflict,
  ensureApiAuth,
  readJson,
  revalidateSite,
} from "../../lib/api";

// GET /api/games — list all games (public)
export async function GET() {
  return json({ games: await getGamesSorted() });
}

// POST /api/games — create a game (auth)
export async function POST(req: Request) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const body = await readJson(req);
  const name = String(body.name ?? "").trim();
  const time = String(body.time ?? "").trim();
  const active = body.active === undefined ? true : Boolean(body.active);
  const table = body.table === "table2" ? "table2" : "table1";
  if (!name) return badRequest("name is required");

  let game;
  try {
    game = await upsertGame({ name, time, active, table });
  } catch (e) {
    if (e instanceof DuplicateGameNameError) return conflict(e.message);
    throw e;
  }
  revalidateSite();
  return json({ game }, 201);
}
