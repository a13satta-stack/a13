import Link from "next/link";
import type { Game, Results } from "../lib/types";
import { slugify } from "../lib/slug";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ChartTable({
  games,
  results,
  year,
  month, // 0-indexed
}: {
  games: Game[];
  results: Results;
  year: number;
  month: number;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="overflow-hidden rounded-lg border-2 border-black">
      <div className="bg-black py-2 text-center text-lg font-bold text-satta-yellow">
        SATTA RECORD CHART — {MONTHS[month]} {year}
      </div>
      <div className="overflow-x-auto bg-white">
        <table className="w-full border-collapse text-center text-xs">
          <thead>
            <tr className="bg-satta-yellow-dark">
              <th className="sticky left-0 z-10 border border-black bg-satta-yellow-dark px-2 py-1">
                Date
              </th>
              {games.map((g) => (
                <th key={g.id} className="border border-black px-2 py-1 font-bold uppercase">
                  <Link href={`/game/${slugify(g.name)}`} className="hover:underline">
                    {g.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((d) => {
              const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                d
              ).padStart(2, "0")}`;
              const row = results[dateKey] ?? {};
              return (
                <tr key={d} className="odd:bg-white even:bg-yellow-50">
                  <td className="sticky left-0 z-10 border border-black bg-inherit px-2 py-1 font-bold">
                    {String(d).padStart(2, "0")}
                  </td>
                  {games.map((g) => (
                    <td key={g.id} className="border border-black px-2 py-1 font-semibold text-satta-red">
                      {row[g.id] ?? "-"}
                    </td>
                  ))}
                </tr>
              );
            })}
            {games.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500">No games configured.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { MONTHS };
