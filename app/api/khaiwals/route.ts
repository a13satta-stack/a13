import { getKhaiwalsSorted, upsertKhaiwal } from "../../lib/db";
import type { KhaiwalLine } from "../../lib/types";
import { json, badRequest, ensureApiAuth, readJson, revalidateSite } from "../../lib/api";

/** Coerce an unknown JSON value into a clean KhaiwalLine[]. */
function toLines(value: unknown): KhaiwalLine[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      return { label: String(r.label ?? "").trim(), time: String(r.time ?? "").trim() };
    })
    .filter((l) => l.label || l.time);
}

// GET /api/khaiwals — list all khaiwal boxes (public)
export async function GET() {
  return json({ khaiwals: await getKhaiwalsSorted() });
}

// POST /api/khaiwals — create a khaiwal box (auth)
export async function POST(req: Request) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const body = await readJson(req);
  const title = String(body.title ?? "").trim();
  if (!title) return badRequest("title is required");

  const khaiwal = await upsertKhaiwal({
    heading: String(body.heading ?? "").trim(),
    title,
    lines: toLines(body.lines),
    note: String(body.note ?? "").trim(),
    footer: String(body.footer ?? "").trim(),
    whatsappNumber: String(body.whatsappNumber ?? "").trim(),
    buttonText: String(body.buttonText ?? "").trim() || "WhatsApp Click to chat",
    active: body.active === undefined ? true : Boolean(body.active),
  });
  revalidateSite();
  return json({ khaiwal }, 201);
}
