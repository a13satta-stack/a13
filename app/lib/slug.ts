/** Turn a game name into a URL slug, e.g. "SADAR BAZAR" -> "sadar-bazar". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
