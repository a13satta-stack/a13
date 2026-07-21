import { getSettings, saveSettings } from "../../lib/db";
import { json, ensureApiAuth, readJson, revalidateSite } from "../../lib/api";
import type { SiteSettings } from "../../lib/types";

// GET /api/settings (public)
export async function GET() {
  return json({ settings: await getSettings() });
}

// PUT /api/settings (auth) — partial update
export async function PUT(req: Request) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const body = await readJson(req);
  const partial: Partial<SiteSettings> = {};
  const str = (k: keyof SiteSettings) => {
    if (body[k] !== undefined) partial[k] = String(body[k]).trim() as never;
  };
  str("siteName");
  str("tagline");
  str("telegramUrl");
  str("whatsappNumber");
  str("contactEmail");
  str("disclaimer");
  if (body.featuredGameId !== undefined) {
    partial.featuredGameId = body.featuredGameId ? String(body.featuredGameId) : null;
  }
  if (body.notices !== undefined) {
    const n = Array.isArray(body.notices)
      ? body.notices.map((s) => String(s))
      : String(body.notices).split("\n");
    partial.notices = n.map((s) => s.trim()).filter(Boolean);
  }

  await saveSettings(partial);
  revalidateSite();
  return json({ settings: await getSettings() });
}
