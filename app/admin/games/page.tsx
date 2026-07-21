import { guard } from "../guard";
import AdminShell from "../AdminShell";
import { getGamesSorted } from "../../lib/db";
import { saveGameAction } from "../../actions/admin";
import { cardPad, label, input, btnPrimary, muted } from "../ui";
import ActionForm from "../ActionForm";
import TimeField from "../TimeField";
import GamesTable from "./GamesTable";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  await guard();
  const games = await getGamesSorted();

  return (
    <AdminShell title="Manage Games">
      {/* Add new game */}
      <ActionForm
        action={saveGameAction}
        success="Game added."
        error="Could not add the game."
        className={`${cardPad} mb-6 flex flex-wrap items-end gap-3`}
      >
        <div>
          <label className={label}>Name</label>
          <input name="name" required placeholder="e.g. DISAWER" className={input} />
        </div>
        <div>
          <label className={label}>Time</label>
          <TimeField name="time" className={input} ariaLabel="Result time" />
        </div>
        <div>
          <label className={label}>Table</label>
          <select name="table" defaultValue="table1" className={input}>
            <option value="table1">Table 1</option>
            <option value="table2">Table 2</option>
          </select>
        </div>
        <label className="flex items-center gap-2 py-2 text-sm font-semibold">
          <input type="checkbox" name="active" defaultChecked /> Active
        </label>
        <button className={btnPrimary}>+ Add Game</button>
      </ActionForm>

      <p className={`${muted} mb-2`}>
        Drag the <span className="font-semibold text-zinc-700">⠿</span> handle to reorder, or use
        the ↑ ↓ arrows.
      </p>

      <GamesTable games={games} />
    </AdminShell>
  );
}
