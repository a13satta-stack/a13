/**
 * The games shown to visitors. Everything else upstream sends is still imported
 * — its results are stored — but the game is kept INACTIVE, so it never appears
 * on the public board, chart, or game pages. This list is the single source of
 * truth for "which games are active"; the importer enforces it on every sync.
 *
 * Names are matched loosely (lower-cased, punctuation and spaces dropped) so
 * upstream spelling differences still resolve — e.g. a7satta writes "disawer",
 * other places write "desawar"/"disawar"; "shri" vs "shree"; etc.
 */

export interface AllowedGame {
  /** Canonical display name used when this game has to be created. */
  name: string;
  /** Normalized spellings (see `normalizeGameName`) that map to this game. */
  aliases: string[];
}

export const ALLOWED_GAMES: AllowedGame[] = [
  { name: "DELHI BAZAR", aliases: ["delhibazar"] },
  { name: "SHRI GANESH", aliases: ["shriganesh", "shreeganesh"] },
  { name: "FARIDABAD", aliases: ["faridabad"] },
  { name: "GAZIABAD", aliases: ["gaziabad", "ghaziabad"] },
  { name: "GALI", aliases: ["gali"] },
  { name: "DISAWAR", aliases: ["disawar", "disawer", "desawar", "dishawar"] },
];

/** Lower-case and strip everything that isn't a letter or digit. */
export function normalizeGameName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const ALIAS_TO_NAME = new Map<string, string>(
  ALLOWED_GAMES.flatMap((g) => g.aliases.map((a) => [a, g.name] as const))
);

/** True when a game (by any spelling) is one of the public/active games. */
export function isAllowedGame(name: string): boolean {
  return ALIAS_TO_NAME.has(normalizeGameName(name));
}

/** Canonical display name for an allowed game, or null if it isn't one. */
export function canonicalGameName(name: string): string | null {
  return ALIAS_TO_NAME.get(normalizeGameName(name)) ?? null;
}
