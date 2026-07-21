import { savePost, deletePostById } from "../../../lib/db";
import { json, badRequest, ensureApiAuth, readJson, revalidateSite } from "../../../lib/api";

// PATCH /api/posts/:id  { title?, body? }  (auth)
export async function PATCH(req: Request, ctx: RouteContext<"/api/posts/[id]">) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const { id } = await ctx.params;
  const body = await readJson(req);
  const title = String(body.title ?? "").trim();
  const text = String(body.body ?? "").trim();
  if (!title) return badRequest("title is required");

  await savePost({ id, title, body: text });
  revalidateSite();
  return json({ ok: true });
}

// DELETE /api/posts/:id (auth)
export async function DELETE(_req: Request, ctx: RouteContext<"/api/posts/[id]">) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const { id } = await ctx.params;
  await deletePostById(id);
  revalidateSite();
  return json({ ok: true });
}
