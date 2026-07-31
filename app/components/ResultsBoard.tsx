import Link from "next/link";
import type { Game } from "../lib/types";
import { slugify } from "../lib/slug";

const COLS = "grid-cols-[1.4fr_1fr_1fr]";
const CELL_BORDER = "border-r border-black/25";

// The red spiked badge that stands in for a result that hasn't come in yet.
function PendingBurst() {
  const points = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 === 0 ? 11 : 6.2;
    const a = (Math.PI / 12) * i - Math.PI / 2;
    return `${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" role="img" aria-label="Result awaited">
      <polygon points={points} fill="#e21b1b" />
      {/* `textLength` pins the word inside the burst's inner radius (6.2) no
          matter which font the browser falls back to. */}
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        textLength="10.5"
        lengthAdjust="spacingAndGlyphs"
        fontSize="5.5"
        fontWeight="bold"
        fill="#fff"
      >
        wait
      </text>
    </svg>
  );
}

function GameRow({
  g,
  today,
  yesterday,
}: {
  g: Game;
  today: Record<string, string>;
  yesterday: Record<string, string>;
}) {
  const result = today[g.id];
  const prev = yesterday[g.id];

  return (
    <div className={`grid ${COLS} border-t border-black/25`}>
      <Link
        href={`/game/${slugify(g.name)}`}
        className={`${CELL_BORDER} group bg-satta-yellow px-2 py-2 text-center`}
      >
        <div className="text-[20px] font-bold uppercase leading-tight text-brand-indigo group-hover:underline">
          {g.name}
        </div>
        <div className="text-[15px] font-semibold leading-tight text-brand-indigo/70">{g.time}</div>
      </Link>

      <div
        className={`${CELL_BORDER} flex items-center justify-center bg-white px-2 py-2 text-lg font-bold text-brand-indigo/70`}
      >
        {prev ?? <span className="text-gray-400">--</span>}
      </div>

      <div className="flex items-center justify-center bg-white px-2 py-2">
        {result ? (
          <span className="text-xl font-black text-satta-red">{result}</span>
        ) : (
          <PendingBurst />
        )}
      </div>
    </div>
  );
}

function BoardTable({
  games,
  today,
  yesterday,
}: {
  games: Game[];
  today: Record<string, string>;
  yesterday: Record<string, string>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-brand-indigo/15 bg-white shadow-md shadow-brand-indigo/10">
      <div
        className={`grid ${COLS} bg-brand-indigo text-center text-[11px] font-bold tracking-wide text-brand-gold`}
      >
        <div className={`${CELL_BORDER} border-white/15 px-2 py-2`}>सट्टा का नाम</div>
        <div className={`${CELL_BORDER} border-white/15 px-2 py-2`}>कल आया था</div>
        <div className="px-2 py-2">आज का रिजल्ट</div>
      </div>

      {games?.reverse()?.map((g) => (
        <GameRow key={g.id} g={g} today={today} yesterday={yesterday} />
      ))}
      {games.length === 0 && (
        <div className="border-t border-black/25 bg-white px-4 py-6 text-center text-sm text-gray-500">
          No games.
        </div>
      )}
    </div>
  );
}

export default function ResultsBoard({
  games,
  today,
  yesterday,
}: {
  games: Game[];
  today: Record<string, string>;
  yesterday?: Record<string, string>;
}) {
  const yest = yesterday ?? {};
  const table1 = games.filter((g) => g.table !== "table2");
  const table2 = games.filter((g) => g.table === "table2");

  return (
    <section className="mx-auto max-w-5xl px-[5px] py-3">
      <div className="mb-3 overflow-hidden rounded-xl shadow-md shadow-brand-indigo/10">
        <div className="bg-gradient-to-r from-brand-indigo via-brand-indigo-2 to-brand-indigo py-2.5 text-center text-lg font-extrabold tracking-wide text-brand-gold">
          आज का रिजल्ट — Today&apos;s Result
        </div>
      </div>
      <div className="space-y-3">
        <BoardTable games={table1} today={today} yesterday={yest} />
        <BoardTable games={table2} today={today} yesterday={yest} />
      </div>
    </section>
  );
}
