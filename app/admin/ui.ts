// Shared class-name tokens for the admin panel, so every page uses one
// consistent, polished visual language. Plain strings → usable from both
// server and client components.

/** Surface panel. Add your own padding, or use `cardPad`. */
export const card =
  "rounded-xl border border-zinc-200 bg-white shadow-sm";
export const cardPad =
  "rounded-xl border border-zinc-200 bg-white p-5 shadow-sm";

/** Field label. */
export const label =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500";

/** Text input / select / textarea. */
export const input =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-satta-yellow/60";

/** Buttons — a shared base plus color variants. */
const btnBase =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40";
export const btnPrimary = `${btnBase} bg-zinc-900 text-satta-yellow hover:bg-black`;
export const btnSuccess = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`;
export const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700`;
export const btnGhost = `${btnBase} bg-zinc-100 text-zinc-700 shadow-none hover:bg-zinc-200`;

/** Small icon-only button (reorder arrows etc.). */
export const btnIcon =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40";

/** Muted helper / intro paragraph. */
export const muted = "text-sm text-zinc-500";
