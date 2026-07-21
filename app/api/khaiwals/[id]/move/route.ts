import { moveKhaiwal, getKhaiwalsSorted } from "../../../../lib/db";
import { json, badRequest, ensureApiAuth, readJson, revalidateSite } from "../../../../lib/api";

// POST /api/khaiwals/:id/move  { dir: "up" | "down" }  (auth)
export async function POST(req: Request, ctx: RouteContext<"/api/khaiwals/[id]/move">) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const { id } = await ctx.params;
  const body = await readJson(req);
  const dir = body.dir === "up" ? "up" : body.dir === "down" ? "down" : null;
  if (!dir) return badRequest('dir must be "up" or "down"');

  await moveKhaiwal(id, dir);
  revalidateSite();
  return json({ khaiwals: await getKhaiwalsSorted() });
}
