import { guard } from "../guard";
import AdminShell from "../AdminShell";
import { getGamesSorted, getResultsForDate, dateKey } from "../../lib/db";
import { saveResultsAction } from "../../actions/admin";
import { card, cardPad, label, input, btnPrimary, btnGhost } from "../ui";
import ActionForm from "../ActionForm";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await guard();
  const sp = await searchParams;
  const date =
    sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : dateKey();

  const [games, dayResults] = await Promise.all([
    getGamesSorted(),
    getResultsForDate(date),
  ]);

  return (
    <AdminShell title="Enter Results">
      <form method="GET" className="mb-5 flex flex-wrap items-end gap-3">
        <div>
          <label className={label}>Result date</label>
          <input type="date" name="date" defaultValue={date} className={input} />
        </div>
        <button className={btnGhost}>Load date</button>
      </form>

      <ActionForm
        action={saveResultsAction}
        success={`Results saved for ${date}.`}
        error="Could not save the results."
        className={cardPad}
      >
        <input type="hidden" name="date" value={date} />
        <p className="mb-4 text-sm text-zinc-500">
          Editing results for <span className="font-bold text-zinc-900">{date}</span>. Leave a
          field blank to clear it. Numbers appear on the site instantly after saving.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((g) => (
            <label key={g.id} className={`${card} block p-2`}>
              <span className="block text-xs font-bold uppercase leading-tight text-zinc-800">
                {g.name}
              </span>
              <span className="block text-[10px] text-zinc-500">{g.time}</span>
              <input
                name={`r_${g.id}`}
                defaultValue={dayResults[g.id] ?? ""}
                inputMode="numeric"
                maxLength={3}
                placeholder="--"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1 text-center text-lg font-black text-satta-red outline-none focus:border-zinc-900 focus:ring-2 focus:ring-satta-yellow/60"
              />
            </label>
          ))}
        </div>
        {games.length === 0 && <p className="text-center text-zinc-500">Add games first.</p>}
        <div className="mt-5 flex justify-end">
          <button className={btnPrimary}>Save Results</button>
        </div>
      </ActionForm>
    </AdminShell>
  );
}
