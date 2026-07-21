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
