// Single source of truth for everything search engines and social crawlers
// read: the canonical origin, the keyword set, and the shared descriptions.
// Root metadata, per-page metadata, robots.txt and sitemap.xml all pull from
// here so the site never advertises two different origins.

/**
 * Canonical origin, no trailing slash. Override per environment with
 * `NEXT_PUBLIC_SITE_URL` (staging, preview deploys) so those never emit
 * canonicals pointing at production.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://a13satta.com"
).replace(/\/+$/, "");

/** Absolute URL for a site-relative path — required by og:/twitter: tags. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_NAME = "A13 Satta";

/**
 * Home title. Front-loads the brand, then the highest-volume query the site
 * competes for, so both "a13 satta" and chart searches match the <title>.
 */
export const HOME_TITLE = "A13 SATTA KING | SHRI GANESH SATTA KING CHART";

/**
 * Kept under ~155 characters so Google shows it whole instead of truncating
 * mid-sentence in the result snippet.
 */
export const HOME_DESCRIPTION =
  "A13satta is famous for real time result posts of sadar bazar satta king & shri ganesh satta king. Get today's fastest satta king result and record chart.";

/**
 * Brand variants first (people mistype the brand a dozen ways), then the game
 * names the site actually publishes results for. Only terms that genuinely
 * appear on the page — stuffing unrelated terms gets the whole site demoted.
 */
export const SITE_KEYWORDS = [
  "a13satta",
  "a13 satta",
  "a13-satta",
  "a13sattaking",
  "a13 satta king",
  "satta a13",
  "a13",
  "satta king",
  "satta king result",
  "satta king result today",
  "satta king chart",
  "satta result",
  "sadar bazar satta",
  "sadar bazar satta king",
  "shri ganesh satta",
  "shri ganesh satta king",
  "shree ganesh satta",
  "sg satta king",
  "delhi bazar satta",
  "delhi bazar satta king",
  "gali satta king",
  "disawar satta king",
  "faridabad satta king",
  "ghaziabad satta king",
  "satta king live result",
  "satta record chart",
];
