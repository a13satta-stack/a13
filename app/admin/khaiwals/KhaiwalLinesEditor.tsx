"use client";

import { useState } from "react";
import type { Game, KhaiwalLine } from "../../lib/types";
import TimeField from "../TimeField";

const inputClass = "w-full rounded border-2 border-black px-3 py-2 text-sm";

/**
 * Timing-row editor: admin picks a game from the dropdown, sets the time, and
 * adds rows one at a time. Each game can be added only once. The rows are
 * serialised into a hidden "label | time" textarea so the existing server
 * action (parseKhaiwalLines) keeps working unchanged.
 */
export default function KhaiwalLinesEditor({
  games,
  defaultLines,
  fieldName = "lines",
}: {
  games: Pick<Game, "id" | "name" | "time">[];
  defaultLines: KhaiwalLine[];
  fieldName?: string;
}) {
  const [rows, setRows] = useState<KhaiwalLine[]>(defaultLines);
  const [gameName, setGameName] = useState("");
  const [time, setTime] = useState("");

  const used = new Set(rows.map((r) => r.label));
  const available = games.filter((g) => !used.has(g.name));

  function onSelectGame(name: string) {
    setGameName(name);
    const g = games.find((x) => x.name === name);
    setTime(g?.time ?? "");
  }

  function addRow() {
    const label = gameName.trim();
    if (!label || used.has(label)) return; // one game, one row
    setRows([...rows, { label, time: time.trim() }]);
    setGameName("");
    setTime("");
  }

  function removeRow(idx: number) {
    setRows(rows.filter((_, i) => i !== idx));
  }

  const serialized = rows.map((r) => `${r.label} | ${r.time}`).join("\n");

  return (
    <div className="space-y-2">
      {/* Value submitted with the form (parsed by parseKhaiwalLines). */}
      <input type="hidden" name={fieldName} value={serialized} />

      {rows.length > 0 ? (
        <ul className="space-y-1">
          {rows.map((r, i) => (
            <li
              key={`${r.label}-${i}`}
              className="flex items-center justify-between rounded border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm"
            >
              <span>
                <span className="font-bold">{r.label}</span>
                {r.time ? <span className="text-gray-600"> — {r.time}</span> : null}
              </span>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500">No timing rows yet. Add one below.</p>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[140px] flex-1">
          <select
            value={gameName}
            onChange={(e) => onSelectGame(e.target.value)}
            className={inputClass}
          >
            <option value="">Select game…</option>
            {available.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <TimeField
            value={time}
            onChange={setTime}
            ariaLabel="Row time"
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={addRow}
          disabled={!gameName}
          className="rounded bg-black px-4 py-2 text-sm font-bold text-satta-yellow disabled:opacity-40"
        >
          + Add
        </button>
      </div>

      {available.length === 0 && games.length > 0 && (
        <p className="text-xs text-gray-500">All games have been added.</p>
      )}
    </div>
  );
}
