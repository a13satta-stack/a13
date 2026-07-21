import crypto from "crypto";
import type { Collection } from "mongodb";
import { getDb } from "./mongo";
import type {
  Game,
  BlogPost,
  SiteSettings,
  Results,
  Khaiwal,
  KhaiwalLine,
  ResultTable,
} from "./types";

// ---- Document shapes stored in MongoDB ------------------------------------

interface GameDoc {
  _id: string; // uuid
  name: string;
  time: string;
  order: number;
  active: boolean;
  table: ResultTable;
}
interface ResultDoc {
  _id: string; // date key "YYYY-MM-DD"
  values: Record<string, string>; // gameId -> result
}
interface PostDoc {
  _id: string; // uuid
  title: string;
  body: string;
  createdAt: string;
}
interface KhaiwalDoc {
  _id: string; // uuid
  heading: string;
  title: string;
  lines: KhaiwalLine[];
  note: string;
  footer: string;
  whatsappNumber: string;
  buttonText: string;
  order: number;
  active: boolean;
}
interface SettingsDoc extends SiteSettings {
  _id: "site";
}
interface AuthDoc {
  _id: "auth";
  secret: string;
  passwordHash: string;
}

async function games(): Promise<Collection<GameDoc>> {
  return (await getDb()).collection<GameDoc>("games");
}
async function resultsCol(): Promise<Collection<ResultDoc>> {
  return (await getDb()).collection<ResultDoc>("results");
}
async function posts(): Promise<Collection<PostDoc>> {
  return (await getDb()).collection<PostDoc>("posts");
}
async function khaiwals(): Promise<Collection<KhaiwalDoc>> {
  return (await getDb()).collection<KhaiwalDoc>("khaiwals");
}
async function settingsCol(): Promise<Collection<SettingsDoc>> {
  return (await getDb()).collection<SettingsDoc>("settings");
}
async function authCol(): Promise<Collection<AuthDoc>> {
  return (await getDb()).collection<AuthDoc>("auth");
}

// ---- Password hashing ------------------------------------------------------

export function hashPassword(password: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(password).digest("hex");
}

export function newId(): string {
  return crypto.randomUUID();
}

// ---- Date helpers ----------------------------------------------------------

/**
 * Every game on this site declares its result on an India-time clock, so a
 * day's results belong to the IST date — not to whatever date the host happens
 * to be on. Pinning this matters once results are pulled from upstream
 * automatically: on a UTC host, IST midnight to 5:30 AM is still "yesterday"
 * locally, which would file upstream's results a day early.
 */
const SITE_TZ = process.env.SITE_TZ ?? "Asia/Kolkata";

// en-CA renders as YYYY-MM-DD, which is the key format we store.
const dateKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: SITE_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function dateKey(d: Date = new Date()): string {
  return dateKeyFormat.format(d);
}

// ---- Seeding ---------------------------------------------------------------

function seedGames(): GameDoc[] {
  const names: [string, string][] = [
    ["SADAR BAZAR", "1:40 PM"],
    ["GWALIOR", "2:40 PM"],
    ["DELHI BAZAR", "3:15 PM"],
    ["DELHI MATKA", "3:40 PM"],
    ["SHRI GANESH", "4:40 PM"],
    ["AGRA", "5:30 PM"],
    ["FARIDABAD", "6:10 PM"],
    ["ALWAR", "9:50 PM"],
    ["GAZIABAD", "10:35 PM"],
    ["DWARKA", "11:50 PM"],
    ["GALI", "11:50 PM"],
    ["HR SATTA", "12:15 PM"],
    ["KKR CITY", "12:30 PM"],
    ["UJJALA SUPER", "12:30 PM"],
    ["MADHUPURI", "12:30 PM"],
    ["KAROL BAGH", "1:45 PM"],
    ["ANMOL BAZAR", "2:00 PM"],
    ["SKY KING", "2:00 PM"],
    ["DELHI DARBAR", "2:10 PM"],
    ["NEW GANGA", "3:30 PM"],
    ["RAJ SHREE", "7:30 PM"],
    ["UDAIPUR CITY", "7:30 PM"],
    ["VIP AGRA", "7:45 PM"],
    ["MANDI BAZAR", "8:10 PM"],
    ["BHADRA BAZAR", "8:20 PM"],
    ["SIALKOT", "8:20 PM"],
    ["LION BAZAR", "8:30 PM"],
    ["MOHALI-7", "8:40 PM"],
    ["DEHRADUN CITY", "9:40 PM"],
    ["DAMAN", "9:50 PM"],
  ];
  // First 11 games (SADAR BAZAR … GALI) form table1; the rest table2.
  return names.map(([name, time], i) => ({
    _id: crypto.randomUUID(),
    name,
    time,
    order: i,
    active: true,
    table: (i <= 10 ? "table1" : "table2") as ResultTable,
  }));
}

function seedSettings(featuredGameId: string | null): SettingsDoc {
  return {
    _id: "site",
    siteName: "A13SATTA  OFFICIAL",
    tagline: "सबसे पहले यहाँ रिजल्ट देखो",
    featuredGameId,
    notices: [
      "NOW TELEGRAM PLAYERS CAN ALSO JOIN OUR TELEGRAM CHANNEL TO GET RESULTS QUICKLY AND RECEIVE SUPERFAST RESULTS.",
      "NOW WHATSAPP PLAYERS CAN ALSO JOIN OUR WHATSAPP CHANNEL TO GET RESULTS QUICKLY AND RECEIVE SUPERFAST RESULTS.",
      "SHRI GANESH SATTA KING RESULT IS UPDATED EVERYDAY AT 4:40 PM.",
    ],
    telegramUrl: "https://t.me/",
    whatsappNumber: "911234567890",
    contactEmail: "raossachin37@gmail.com",
    disclaimer:
      "DISCLAIMER - A13 Satta is a non-commercial informational website. Please view this site at your own risk. All the information shown on this website is sponsored, and we warn you that satta matka gambling / betting may be banned in your country. We are not responsible for any issues or scams. Everything here is subject to copyright. Thank you.",
  };
}

function seedKhaiwals(): KhaiwalDoc[] {
  const rows: KhaiwalLine[] = [
    { label: "सदर बाजार", time: "1:30 PM" },
    { label: "ग्वालियर", time: "2:30 PM" },
    { label: "दिल्ली बाजार", time: "2:50 PM" },
    { label: "दिल्ली मटका", time: "3:20 PM" },
    { label: "श्री गणेश", time: "4:20 PM" },
    { label: "आगरा", time: "5:20 PM" },
    { label: "फरीदाबाद", time: "5:50 PM" },
    { label: "अलवर", time: "7:20 PM" },
    { label: "गाज़ियाबाद", time: "8:50 PM" },
    { label: "द्वारका", time: "10:10 PM" },
    { label: "गली", time: "11:20 PM" },
    { label: "दिसावर", time: "1:30 AM" },
  ];
  const names = ["AJAY BHAI KHAIWAL", "JASSI BHAI KHAIWAL", "RAMAN BHAI KHAIWAL"];
  return names.map((name, i) => ({
    _id: crypto.randomUUID(),
    heading: "--सीधे सट्टा कंपनी का No 1 खाईवाल--",
    title: `👑 ${name} 👑`,
    lines: rows,
    note: "",
    footer: "Game play करने के लिये नीचे लिंक पर क्लिक करे",
    whatsappNumber: "911234567890",
    buttonText: "WhatsApp Click to chat",
    order: i,
    active: true,
  }));
}

let seedPromise: Promise<void> | null = null;

/** Seed baseline data on first use. Safe to call repeatedly. */
export async function ensureSeed(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const auth = await authCol();
    const existing = await auth.findOne({ _id: "auth" });
    if (existing) return;

    const secret = crypto.randomBytes(32).toString("hex");
    const g = seedGames();
    const settings = seedSettings(g[6]?._id ?? null); // FARIDABAD featured

    await (await games()).insertMany(g);
    await (await khaiwals()).insertMany(seedKhaiwals());
    await (await settingsCol()).insertOne(settings);
    await (await posts()).insertOne({
      _id: crypto.randomUUID(),
      title: "What is Shri Ganesh Satta King?",
      body: "Shri Ganesh is one of the popular satta king games whose result is published everyday. This post explains how the results are updated and where to view them.",
      createdAt: new Date().toISOString(),
    });
    await auth.insertOne({
      _id: "auth",
      secret,
      passwordHash: hashPassword("admin123", secret),
    });
  })();
  return seedPromise;
}

// ---- Readers ---------------------------------------------------------------

function toGame(d: GameDoc): Game {
  return {
    id: d._id,
    name: d.name,
    time: d.time,
    order: d.order,
    active: d.active,
    table: d.table === "table2" ? "table2" : "table1",
  };
}

/**
 * Normalize a raw result value for storage.
 * Returns "" (meaning "clear / not declared") for blank, "-1", or negatives.
 * Numeric values 0-99 are zero-padded to two digits ("5" -> "05", "0" -> "00").
 */
export function normalizeResult(raw: unknown): string {
  const v = String(raw ?? "").trim();
  if (v === "" || v === "-1") return "";
  if (/^-?\d+$/.test(v)) {
    const n = Number(v);
    if (n < 0) return "";
    return n < 100 ? String(n).padStart(2, "0") : String(n);
  }
  return v;
}

export async function getGamesSorted(): Promise<Game[]> {
  await ensureSeed();
  const docs = await (await games()).find().sort({ order: 1 }).toArray();
  return docs.map(toGame);
}

export async function getGameById(id: string): Promise<Game | null> {
  await ensureSeed();
  const d = await (await games()).findOne({ _id: id });
  return d ? toGame(d) : null;
}

export async function getSettings(): Promise<SiteSettings> {
  await ensureSeed();
  const d = await (await settingsCol()).findOne({ _id: "site" });
  if (!d) return seedSettings(null);
  const { _id, ...rest } = d;
  void _id;
  return rest;
}

export async function getPosts(): Promise<BlogPost[]> {
  await ensureSeed();
  const docs = await (await posts()).find().sort({ createdAt: -1 }).toArray();
  return docs.map((d) => ({ id: d._id, title: d.title, body: d.body, createdAt: d.createdAt }));
}

function toKhaiwal(d: KhaiwalDoc): Khaiwal {
  return {
    id: d._id,
    heading: d.heading,
    title: d.title,
    lines: d.lines ?? [],
    note: d.note,
    footer: d.footer,
    whatsappNumber: d.whatsappNumber,
    buttonText: d.buttonText,
    order: d.order,
    active: d.active,
  };
}

export async function getKhaiwalsSorted(): Promise<Khaiwal[]> {
  await ensureSeed();
  const docs = await (await khaiwals()).find().sort({ order: 1 }).toArray();
  return docs.map(toKhaiwal);
}

export async function getKhaiwalById(id: string): Promise<Khaiwal | null> {
  await ensureSeed();
  const d = await (await khaiwals()).findOne({ _id: id });
  return d ? toKhaiwal(d) : null;
}

/** All results for a single date, as a { gameId: value } map. */
export async function getResultsForDate(date: string): Promise<Record<string, string>> {
  await ensureSeed();
  const d = await (await resultsCol()).findOne({ _id: date });
  return d?.values ?? {};
}

/** Results whose date key is within [startKey, endKey] inclusive (lexical). */
export async function getResultsForRange(startKey: string, endKey: string): Promise<Results> {
  await ensureSeed();
  const docs = await (await resultsCol())
    .find({ _id: { $gte: startKey, $lte: endKey } })
    .toArray();
  const out: Results = {};
  for (const d of docs) out[d._id] = d.values;
  return out;
}

export async function getResultsForMonth(year: number, monthIndex: number): Promise<Results> {
  const mm = String(monthIndex + 1).padStart(2, "0");
  return getResultsForRange(`${year}-${mm}-01`, `${year}-${mm}-31`);
}

export async function getResultsForYear(year: number): Promise<Results> {
  return getResultsForRange(`${year}-01-01`, `${year}-12-31`);
}

/** Number of distinct dates that have any results recorded. */
export async function countResultDays(): Promise<number> {
  await ensureSeed();
  return (await resultsCol()).countDocuments();
}

// ---- Auth ------------------------------------------------------------------

export async function getAuth(): Promise<{ secret: string; passwordHash: string }> {
  await ensureSeed();
  const d = await (await authCol()).findOne({ _id: "auth" });
  if (!d) throw new Error("Auth not initialised");
  return { secret: d.secret, passwordHash: d.passwordHash };
}

export async function setPasswordHash(hash: string): Promise<void> {
  await (await authCol()).updateOne({ _id: "auth" }, { $set: { passwordHash: hash } });
}

// ---- Mutators --------------------------------------------------------------

/**
 * Thrown when a game name would collide with one that already exists. Callers
 * catch this to report "name already taken" instead of a generic failure.
 */
export class DuplicateGameNameError extends Error {
  /** The name that clashed. Not `name` — that is Error's own class label. */
  readonly gameName: string;

  constructor(gameName: string) {
    super(`A game named "${gameName}" already exists`);
    this.name = "DuplicateGameNameError";
    this.gameName = gameName;
  }
}

/** Anchored, case-insensitive match on a trimmed name. */
function exactNameFilter(name: string) {
  return {
    $regex: `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    $options: "i",
  };
}

export async function upsertGame(input: {
  id?: string;
  name: string;
  time: string;
  active: boolean;
  table?: ResultTable;
  /**
   * Where a newly created game lands in the board order. New games go to the
   * top so a just-added game is visible without scrolling or reordering. The
   * upstream importer passes "bottom" — games it discovers should not push
   * their way onto the home page's live board unasked.
   */
  placement?: "top" | "bottom";
}): Promise<Game> {
  await ensureSeed();
  const col = await games();

  // One name, one game. Checked for creates and renames alike, and here rather
  // than in the admin action so the JSON API and importer are covered too.
  const clash = await col.findOne({
    name: exactNameFilter(input.name),
    ...(input.id ? { _id: { $ne: input.id } } : {}),
  });
  if (clash) throw new DuplicateGameNameError(input.name.trim());

  if (input.id) {
    const set: Partial<GameDoc> = {
      name: input.name,
      time: input.time,
      active: input.active,
    };
    if (input.table) set.table = input.table;
    await col.updateOne({ _id: input.id }, { $set: set });
    const d = await col.findOne({ _id: input.id });
    if (!d) throw new Error("Game not found");
    return toGame(d);
  }

  // `order` is a sort key, not an index — `reorderGames` renumbers from 0 on
  // the next drag, so going one below the current minimum is safe even if it
  // lands negative.
  const edge =
    input.placement === "bottom"
      ? await col.find().sort({ order: -1 }).limit(1).next()
      : await col.find().sort({ order: 1 }).limit(1).next();
  const order =
    input.placement === "bottom" ? (edge?.order ?? -1) + 1 : (edge?.order ?? 1) - 1;

  const doc: GameDoc = {
    _id: newId(),
    name: input.name,
    time: input.time,
    active: input.active,
    order,
    table: input.table ?? "table1",
  };
  await col.insertOne(doc);
  return toGame(doc);
}

/** Case-insensitive lookup by trimmed name (used by the importer). */
export async function findGameByName(name: string): Promise<Game | null> {
  await ensureSeed();
  const d = await (await games()).findOne({ name: exactNameFilter(name) });
  return d ? toGame(d) : null;
}

export async function deleteGameById(id: string): Promise<void> {
  const col = await games();
  await col.deleteOne({ _id: id });
  // Drop this game's column from every day's results.
  await (await resultsCol()).updateMany({}, { $unset: { [`values.${id}`]: "" } });
  // Clear featured reference if it pointed here.
  await (await settingsCol()).updateOne(
    { _id: "site", featuredGameId: id },
    { $set: { featuredGameId: null } }
  );
}

export async function moveGame(id: string, dir: "up" | "down"): Promise<void> {
  const col = await games();
  const sorted = await col.find().sort({ order: 1 }).toArray();
  const idx = sorted.findIndex((g) => g._id === id);
  if (idx === -1) return;
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= sorted.length) return;
  const a = sorted[idx];
  const b = sorted[swap];
  await col.updateOne({ _id: a._id }, { $set: { order: b.order } });
  await col.updateOne({ _id: b._id }, { $set: { order: a.order } });
}

/** Persist an explicit ordering: each id's position becomes its `order`. */
export async function reorderGames(ids: string[]): Promise<void> {
  const col = await games();
  await Promise.all(
    ids.map((id, index) => col.updateOne({ _id: id }, { $set: { order: index } }))
  );
}

/**
 * Save results for a date. A normalized-empty value ("", "-1", negative)
 * clears that game; numbers are zero-padded to two digits.
 */
export async function saveResultsForDate(
  date: string,
  values: Record<string, string>
): Promise<void> {
  await ensureSeed();
  const col = await resultsCol();
  const existing = (await col.findOne({ _id: date }))?.values ?? {};
  const merged: Record<string, string> = { ...existing };
  for (const [gameId, raw] of Object.entries(values)) {
    const v = normalizeResult(raw);
    if (v === "") delete merged[gameId];
    else merged[gameId] = v;
  }
  if (Object.keys(merged).length === 0) {
    await col.deleteOne({ _id: date });
  } else {
    await col.updateOne({ _id: date }, { $set: { values: merged } }, { upsert: true });
  }
}

/**
 * Bulk-set individual result cells across many dates in one pass (used by the
 * importer). Each entry sets results[date][gameId]; `-1`/blank values are
 * skipped (not cleared). Returns the number of cells written.
 */
export async function bulkSetResults(
  entries: { date: string; gameId: string; value: unknown }[]
): Promise<number> {
  await ensureSeed();
  const col = await resultsCol();
  // Group by date, merge with existing docs, then one upsert per date.
  const byDate = new Map<string, Record<string, string>>();
  for (const e of entries) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) continue;
    const v = normalizeResult(e.value);
    if (v === "") continue;
    let m = byDate.get(e.date);
    if (!m) {
      m = {};
      byDate.set(e.date, m);
    }
    m[e.gameId] = v;
  }
  let written = 0;
  for (const [date, values] of byDate) {
    const existing = (await col.findOne({ _id: date }))?.values ?? {};
    const merged = { ...existing, ...values };
    await col.updateOne({ _id: date }, { $set: { values: merged } }, { upsert: true });
    written += Object.keys(values).length;
  }
  return written;
}

export async function saveSettings(partial: Partial<SiteSettings>): Promise<void> {
  await ensureSeed();
  await (await settingsCol()).updateOne({ _id: "site" }, { $set: partial });
}

export async function savePost(input: {
  id?: string;
  title: string;
  body: string;
}): Promise<void> {
  await ensureSeed();
  const col = await posts();
  if (input.id) {
    await col.updateOne({ _id: input.id }, { $set: { title: input.title, body: input.body } });
  } else {
    await col.insertOne({
      _id: newId(),
      title: input.title,
      body: input.body,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function deletePostById(id: string): Promise<void> {
  await (await posts()).deleteOne({ _id: id });
}

// ---- Khaiwal boxes ---------------------------------------------------------

export async function upsertKhaiwal(input: {
  id?: string;
  heading: string;
  title: string;
  lines: KhaiwalLine[];
  note: string;
  footer: string;
  whatsappNumber: string;
  buttonText: string;
  active: boolean;
}): Promise<Khaiwal> {
  await ensureSeed();
  const col = await khaiwals();
  const fields = {
    heading: input.heading,
    title: input.title,
    lines: input.lines,
    note: input.note,
    footer: input.footer,
    whatsappNumber: input.whatsappNumber,
    buttonText: input.buttonText,
    active: input.active,
  };
  if (input.id) {
    await col.updateOne({ _id: input.id }, { $set: fields });
    const d = await col.findOne({ _id: input.id });
    if (!d) throw new Error("Khaiwal not found");
    return toKhaiwal(d);
  }
  const last = await col.find().sort({ order: -1 }).limit(1).next();
  const doc: KhaiwalDoc = { _id: newId(), order: (last?.order ?? -1) + 1, ...fields };
  await col.insertOne(doc);
  return toKhaiwal(doc);
}

export async function deleteKhaiwalById(id: string): Promise<void> {
  await (await khaiwals()).deleteOne({ _id: id });
}

export async function moveKhaiwal(id: string, dir: "up" | "down"): Promise<void> {
  const col = await khaiwals();
  const sorted = await col.find().sort({ order: 1 }).toArray();
  const idx = sorted.findIndex((k) => k._id === id);
  if (idx === -1) return;
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= sorted.length) return;
  const a = sorted[idx];
  const b = sorted[swap];
  await col.updateOne({ _id: a._id }, { $set: { order: b.order } });
  await col.updateOne({ _id: b._id }, { $set: { order: a.order } });
}
