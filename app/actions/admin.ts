"use server";

import { revalidatePath } from "next/cache";
import {
  upsertGame,
  DuplicateGameNameError,
  deleteGameById,
  moveGame,
  reorderGames,
  saveResultsForDate,
  saveSettings,
  savePost,
  deletePostById,
  upsertKhaiwal,
  deleteKhaiwalById,
  moveKhaiwal,
} from "../lib/db";
import type { KhaiwalLine } from "../lib/types";
import { requireAuth } from "../lib/auth";

/** Parse the admin textarea (one "label | time" per line) into rows. */
function parseKhaiwalLines(raw: string): KhaiwalLine[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const idx = l.indexOf("|");
      if (idx === -1) return { label: l, time: "" };
      return { label: l.slice(0, idx).trim(), time: l.slice(idx + 1).trim() };
    });
}

function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/chart");
  revalidatePath("/admin", "layout");
}

// ---- Games ----------------------------------------------------------------

export async function saveGameAction(
  formData: FormData
): Promise<void | { error: string }> {
  await requireAuth();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const active = formData.get("active") === "on";
  const table = String(formData.get("table") ?? "") === "table2" ? "table2" : "table1";
  if (!name) return { error: "Game name is required." };
  try {
    await upsertGame({ id: id || undefined, name, time, active, table });
  } catch (e) {
    // Returned rather than rethrown so the admin sees which name clashed —
    // thrown messages are redacted in production.
    if (e instanceof DuplicateGameNameError) {
      return { error: `A game named "${name}" already exists.` };
    }
    throw e;
  }
  revalidateSite();
}

export async function deleteGameAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  await deleteGameById(id);
  revalidateSite();
}

export async function moveGameAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "") === "up" ? "up" : "down";
  await moveGame(id, dir);
  revalidateSite();
}

/** Persist a drag-and-drop reorder. Called directly from the client table. */
export async function reorderGamesAction(ids: string[]): Promise<void> {
  await requireAuth();
  if (!Array.isArray(ids)) return;
  await reorderGames(ids.filter((id): id is string => typeof id === "string"));
  revalidateSite();
}

// ---- Results --------------------------------------------------------------

export async function saveResultsAction(formData: FormData): Promise<void> {
  await requireAuth();
  const date = String(formData.get("date") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");

  const values: Record<string, string> = {};
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("r_")) {
      values[key.slice(2)] = String(val);
    }
  }
  await saveResultsForDate(date, values);
  revalidateSite();
}

// ---- Settings -------------------------------------------------------------

export async function saveSettingsAction(formData: FormData): Promise<void> {
  await requireAuth();
  const notices = String(formData.get("notices") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  await saveSettings({
    siteName: String(formData.get("siteName") ?? "").trim() || "A13SATTA  OFFICIAL",
    tagline: String(formData.get("tagline") ?? "").trim(),
    featuredGameId: String(formData.get("featuredGameId") ?? "").trim() || null,
    telegramUrl: String(formData.get("telegramUrl") ?? "").trim(),
    whatsappNumber: String(formData.get("whatsappNumber") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    disclaimer: String(formData.get("disclaimer") ?? "").trim(),
    notices,
  });
  revalidateSite();
}

// ---- Blog posts -----------------------------------------------------------

export async function savePostAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) throw new Error("Title is required");
  await savePost({ id: id || undefined, title, body });
  revalidateSite();
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  await deletePostById(id);
  revalidateSite();
}

// ---- Khaiwal boxes ---------------------------------------------------------

export async function saveKhaiwalAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Box title is required");
  await upsertKhaiwal({
    id: id || undefined,
    heading: String(formData.get("heading") ?? "").trim(),
    title,
    lines: parseKhaiwalLines(String(formData.get("lines") ?? "")),
    note: String(formData.get("note") ?? "").trim(),
    footer: String(formData.get("footer") ?? "").trim(),
    whatsappNumber: String(formData.get("whatsappNumber") ?? "").trim(),
    buttonText: String(formData.get("buttonText") ?? "").trim() || "WhatsApp Click to chat",
    active: formData.get("active") === "on",
  });
  revalidateSite();
}

export async function deleteKhaiwalAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  await deleteKhaiwalById(id);
  revalidateSite();
}

export async function moveKhaiwalAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "") === "up" ? "up" : "down";
  await moveKhaiwal(id, dir);
  revalidateSite();
}
