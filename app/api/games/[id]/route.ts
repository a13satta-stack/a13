import { getGameById, upsertGame, deleteGameById } from "../../../lib/db";
import {
  json,
  badRequest,
  notFound,
  ensureApiAuth,
  readJson,
  revalidateSite,
} from "../../../lib/api";

// PATCH /api/games/:id — update a game (auth)
export async function PATCH(req: Request, ctx: RouteContext<"/api/games/[id]">) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const { id } = await ctx.params;
  const existing = await getGameById(id);
  if (!existing) return notFound("Game not found");

  const body = await readJson(req);
  const name = body.name !== undefined ? String(body.name).trim() : existing.name;
  const time = body.time !== undefined ? String(body.time).trim() : existing.time;
  const active = body.active !== undefined ? Boolean(body.active) : existing.active;
  const table =
    body.table !== undefined
      ? body.table === "table2"
        ? "table2"
        : "table1"
      : existing.table;
  if (!name) return badRequest("name cannot be empty");

  const game = await upsertGame({ id, name, time, active, table });
  revalidateSite();
  return json({ game });
}

// DELETE /api/games/:id (auth)
export async function DELETE(_req: Request, ctx: RouteContext<"/api/games/[id]">) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const { id } = await ctx.params;
  await deleteGameById(id);
  revalidateSite();
  return json({ ok: true });
}
