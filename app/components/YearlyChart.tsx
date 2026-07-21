import type { Game, Results } from "../lib/types";

const MONTH_ABBR = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export default function YearlyChart({
  game,
  results,
  year,
}: {
  game: Game;
  results: Results;
  year: number;
}) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="overflow-hidden">
      <div className="bg-gradient-to-b from-satta-yellow to-satta-yellow-dark py-3 text-center">
        <h1 className="text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
          {game.name} Yearly Chart {year}
        </h1>
      </div>
      <div className="overflow-x-auto bg-white">
        <table className="w-full border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="border-b-2 border-black px-2 py-2 font-extrabold">{year}</th>
              {MONTH_ABBR.map((m) => (
                <th key={m} className="border-b-2 border-black px-2 py-2 font-extrabold">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d}>
                <td className="px-2 py-1.5 font-extrabold text-black">{d}</td>
                {MONTH_ABBR.map((_, mIdx) => {
                  const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
                  if (d > daysInMonth) {
                    return <td key={mIdx} className="px-2 py-1.5" />;
                  }
                  const key = `${year}-${String(mIdx + 1).padStart(2, "0")}-${String(
                    d
                  ).padStart(2, "0")}`;
                  const val = results[key]?.[game.id];
                  return (
                    <td key={mIdx} className="px-2 py-1.5 font-bold text-blue-700">
                      {val ?? <span className="text-gray-400">-</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
