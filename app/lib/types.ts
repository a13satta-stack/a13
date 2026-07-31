// Shared domain types for the Satta results site.

/** Which of the two home-page result boards a game belongs to. */
export type ResultTable = "table1" | "table2";

export interface Game {
  id: string;
  name: string;
  /** Display time, e.g. "1:40 PM" */
  time: string;
  order: number;
  /** Whether the game is currently active/open (affects live status icon). */
  active: boolean;
  /** Home board grouping: "table1" (top games) or "table2". */
  table: ResultTable;
}

export interface BlogPost {
  id: string;
  title: string;
  body: string;
  /** ISO date string */
  createdAt: string;
}

/** One "name ---- time" row inside a khaiwal box. */
export interface KhaiwalLine {
  label: string;
  time: string;
}

/**
 * An admin-managed promotional box shown on the home page (the "khaiwal"
 * cards). Fully editable: a box can be a timings list, a free-text promo, or
 * both, each with its own WhatsApp call-to-action.
 */
export interface Khaiwal {
  id: string;
  /** Small top line, e.g. "--सीधे सट्टा कंपनी का No 1 खाईवाल--". */
  heading: string;
  /** Big box name, e.g. "👑 AJAY BHAI KHAIWAL 👑". */
  title: string;
  lines: KhaiwalLine[];
  /** Free-text block (whitespace preserved) — for promo boxes with no rows. */
  note: string;
  /** Footer text above the button, e.g. "Game play करने के लिये...". */
  footer: string;
  /** WhatsApp number for the "Click to chat" button (digits, may be blank). */
  whatsappNumber: string;
  /** Button label, e.g. "WhatsApp Click to chat". */
  buttonText: string;
  order: number;
  active: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  /** Id of the game highlighted in the big "featured" banner. */
  featuredGameId: string | null;
  /** Scrolling marquee notices shown near the top. */
  notices: string[];
  telegramUrl: string;
  whatsappNumber: string;
  contactEmail: string;
  disclaimer: string;
  /**
   * When true, page loads refresh results from a7satta in the background (after
   * the response is sent, so the site never waits on it) and store them. When
   * false, a7satta is never contacted. Toggled from the admin panel.
   */
  autoSync: boolean;
  /** Full-width contact/notice banner shown below the results board. */
  contactBanner: ContactBanner;
}

/**
 * The admin-editable "संपर्क करें" banner under the results board (WhatsApp +
 * Telegram call-to-actions). All text is optional; the whole banner is hidden
 * when `enabled` is off.
 */
export interface ContactBanner {
  enabled: boolean;
  /** Top line, e.g. "🙏 नमस्कार साथियो 🙏". */
  heading: string;
  /** Body line, e.g. "अपनी गेम का रिजल्ट हमारी वेबसाइट पर लगवाने के लिए संपर्क करें।". */
  body: string;
  /** Highlighted name, e.g. "---- ARUN BHAI ----". */
  name: string;
  /** WhatsApp number (digits) for the "Click to chat" button. */
  whatsappNumber: string;
  /** Cautionary note shown under the WhatsApp button. */
  note: string;
  /** Line above the Telegram button, e.g. the complaints message. */
  telegramText: string;
  /** Telegram URL for the "Click to connect" button. */
  telegramUrl: string;
}

/** results[dateKey][gameId] = result number string ("45", "07", ...) */
export type Results = Record<string, Record<string, string>>;

export interface DB {
  settings: SiteSettings;
  games: Game[];
  results: Results;
  posts: BlogPost[];
  khaiwals: Khaiwal[];
  /** HMAC secret + admin password hash for the admin panel. */
  auth: {
    secret: string;
    passwordHash: string;
  };
}
