import { getKhaiwalById, upsertKhaiwal, deleteKhaiwalById } from "../../../lib/db";
import type { KhaiwalLine } from "../../../lib/types";
import { json, badRequest, notFound, ensureApiAuth, readJson, revalidateSite } from "../../../lib/api";

function toLines(value: unknown): KhaiwalLine[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      return { label: String(r.label ?? "").trim(), time: String(r.time ?? "").trim() };
    })
    .filter((l) => l.label || l.time);
}

// PATCH /api/khaiwals/:id — update fields (any omitted field keeps its value) (auth)
export async function PATCH(req: Request, ctx: RouteContext<"/api/khaiwals/[id]">) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const { id } = await ctx.params;
  const current = await getKhaiwalById(id);
  if (!current) return notFound("Khaiwal not found");

  const body = await readJson(req);
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);

  const title = has("title") ? String(body.title ?? "").trim() : current.title;
  if (!title) return badRequest("title cannot be empty");

  const khaiwal = await upsertKhaiwal({
    id,
    heading: has("heading") ? String(body.heading ?? "").trim() : current.heading,
    title,
    lines: has("lines") ? toLines(body.lines) : current.lines,
    note: has("note") ? String(body.note ?? "").trim() : current.note,
    footer: has("footer") ? String(body.footer ?? "").trim() : current.footer,
    whatsappNumber: has("whatsappNumber")
      ? String(body.whatsappNumber ?? "").trim()
      : current.whatsappNumber,
    buttonText: has("buttonText")
      ? String(body.buttonText ?? "").trim() || "WhatsApp Click to chat"
      : current.buttonText,
    active: has("active") ? Boolean(body.active) : current.active,
  });
  revalidateSite();
  return json({ khaiwal });
}

// DELETE /api/khaiwals/:id (auth)
export async function DELETE(_req: Request, ctx: RouteContext<"/api/khaiwals/[id]">) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const { id } = await ctx.params;
  await deleteKhaiwalById(id);
  revalidateSite();
  return json({ ok: true });
}
