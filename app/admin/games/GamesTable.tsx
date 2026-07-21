"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Game } from "../../lib/types";
import {
  saveGameAction,
  deleteGameAction,
  moveGameAction,
  reorderGamesAction,
} from "../../actions/admin";
import { card, btnSuccess, btnDanger, btnIcon } from "../ui";
import ActionForm from "../ActionForm";
import TimeField from "../TimeField";
import { useToast } from "../Toast";

const fieldCls =
  "rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-satta-yellow/60";

export default function GamesTable({ games }: { games: Game[] }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<Game[]>(games);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, startTransition] = useTransition();

  // Re-sync when the server sends new data (add / edit / delete / reorder).
  // Adjusting state during render is React's recommended alternative to an effect.
  const [prevGames, setPrevGames] = useState<Game[]>(games);
  if (prevGames !== games) {
    setPrevGames(games);
    setRows(games);
  }

  function handleDrop(target: number) {
    const from = dragIndex;
    setDragIndex(null);
    setOverIndex(null);
    if (from === null || from === target) return;

    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(target, 0, moved);
    setRows(next); // optimistic

    startTransition(async () => {
      try {
        await reorderGamesAction(next.map((g) => g.id));
        toast("Order saved.");
      } catch {
        setRows(rows); // roll the optimistic move back
        toast("Could not save the new order.", "error");
      }
      router.refresh();
    });
  }

  return (
    <div className={`${card} ${saving ? "opacity-70" : ""}`}>
      {/* Column headings only make sense once the row lays out horizontally. */}
      <div className="hidden border-b border-zinc-200 bg-zinc-50 px-3 py-3 text-xs uppercase tracking-wide text-zinc-500 md:flex md:items-center md:gap-3">
        <div className="w-[108px] shrink-0">Order</div>
        <div className="flex-1">Game</div>
        <div className="w-[84px] shrink-0 text-right">Actions</div>
      </div>

      <ul className="divide-y divide-zinc-100">
        {rows.map((g, i) => {
          const isDragging = dragIndex === i;
          const isDropTarget = overIndex === i && dragIndex !== null && dragIndex !== i;
          return (
            <li
              key={g.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (overIndex !== i) setOverIndex(i);
              }}
              onDrop={() => handleDrop(i)}
              className={`flex flex-col gap-3 p-3 transition-colors md:flex-row md:items-center md:gap-3 ${
                isDragging ? "opacity-40" : "hover:bg-zinc-50/60"
              } ${isDropTarget ? "bg-satta-yellow/25" : ""}`}
            >
              {/* Order controls */}
              <div className="flex shrink-0 items-center gap-1 md:w-[108px]">
                <span
                  draggable
                  onDragStart={(e) => {
                    setDragIndex(i);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className="cursor-grab select-none rounded-lg px-1.5 py-1 text-lg leading-none text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 active:cursor-grabbing"
                  title="Drag to reorder"
                  aria-label="Drag to reorder"
                >
                  ⠿
                </span>
                <ActionForm
                  action={moveGameAction}
                  success={`${g.name} moved up.`}
                  error="Could not move the game."
                >
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button disabled={i === 0} className={btnIcon} title="Move up">
                    ↑
                  </button>
                </ActionForm>
                <ActionForm
                  action={moveGameAction}
                  success={`${g.name} moved down.`}
                  error="Could not move the game."
                >
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button disabled={i === rows.length - 1} className={btnIcon} title="Move down">
                    ↓
                  </button>
                </ActionForm>
              </div>

              {/* Edit form */}
              <ActionForm
                action={saveGameAction}
                success={`${g.name} saved.`}
                error="Could not save the game."
                className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
              >
                <input type="hidden" name="id" value={g.id} />
                <input
                  name="name"
                  defaultValue={g.name}
                  aria-label="Game name"
                  className={`${fieldCls} min-w-0 flex-1 basis-[140px]`}
                />
                <TimeField
                  name="time"
                  defaultValue={g.time}
                  ariaLabel="Result time"
                  className={`${fieldCls} w-28 shrink-0`}
                />
                <select
                  name="table"
                  defaultValue={g.table}
                  aria-label="Board table"
                  className={`${fieldCls} shrink-0 text-xs`}
                >
                  <option value="table1">Table 1</option>
                  <option value="table2">Table 2</option>
                </select>
                <label className="flex shrink-0 items-center gap-1 text-xs">
                  <input type="checkbox" name="active" defaultChecked={g.active} /> Active
                </label>
                <button className={`${btnSuccess} shrink-0`}>Save</button>
              </ActionForm>

              {/* Delete */}
              <ActionForm
                action={deleteGameAction}
                success={`${g.name} deleted.`}
                error="Could not delete the game."
                className="shrink-0 md:w-[84px] md:text-right"
              >
                <input type="hidden" name="id" value={g.id} />
                <button className={`${btnDanger} w-full md:w-auto`}>Delete</button>
              </ActionForm>
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="px-4 py-8 text-center text-zinc-500">No games yet. Add one above.</li>
        )}
      </ul>
    </div>
  );
}
