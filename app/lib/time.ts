// Conversions between the two clock formats the app juggles: the 12-hour
// display string that games and khaiwal rows are stored and rendered in
// ("1:30 PM"), and the 24-hour "HH:MM" that `<input type="time">` speaks.

/**
 * "13:30" -> "1:30 PM". Anything that is not a bare 24-hour time is returned
 * trimmed and unchanged, so upstream oddities pass through instead of becoming
 * a wrong time.
 */
export function to12h(raw: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(raw.trim());
  if (!m) return raw.trim();
  let h = Number(m[1]);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m[2]} ${ap}`;
}

/**
 * "1:30 PM" -> "13:30", for seeding a time picker. Returns "" when the value
 * cannot be read as a clock time — the caller shows an empty picker rather
 * than a wrong one, and keeps the original text until a new time is chosen.
 */
export function to24h(display: string): string {
  const s = display.trim();
  if (!s) return "";

  const m = /^(\d{1,2})[:.](\d{2})\s*([AaPp])\.?[Mm]\.?$/.exec(s);
  if (m) {
    let h = Number(m[1]) % 12;
    if (m[3].toLowerCase() === "p") h += 12;
    return `${String(h).padStart(2, "0")}:${m[2]}`;
  }

  // Already 24-hour ("13:30", "9:05").
  const h24 = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (h24 && Number(h24[1]) < 24 && Number(h24[2]) < 60) {
    return `${h24[1].padStart(2, "0")}:${h24[2]}`;
  }

  return "";
}
