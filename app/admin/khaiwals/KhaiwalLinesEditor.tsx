"use client";

import { useState } from "react";
import type { Game, KhaiwalLine } from "../../lib/types";
import TimeField from "../TimeField";

const inputClass = "w-full rounded border-2 border-black px-3 py-2 text-sm";

/**
 * Timing-row editor: the admin types any label (Hindi or English), sets the
 * time, and adds rows one at a time. The game list is offered as autocomplete
 * suggestions — picking one auto-fills its time — but the label is free text,
 * so custom rows that aren't games can be added too. Rows are serialised into a
 * hidden "label | time" textarea so the server action (parseKhaiwalLines) keeps
 * working unchanged.
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
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("");

  function onLabelChange(value: string) {
    setLabel(value);
    // Convenience: if what they typed matches a game exactly and no time is set
    // yet, fill in that game's time. Never clobbers a time already entered.
    if (!time.trim()) {
      const g = games.find((x) => x.name.toLowerCase() === value.trim().toLowerCase());
      if (g?.time) setTime(g.time);
    }
  }

  function addRow() {
    const text = label.trim();
    if (!text) return;
    setRows([...rows, { label: text, time: time.trim() }]);
    setLabel("");
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
          <input
            list="khaiwal-game-suggestions"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addRow();
              }
            }}
            placeholder="कोई भी नाम लिखें / type any label (Hindi or English)"
            aria-label="Row label"
            className={inputClass}
          />
          <datalist id="khaiwal-game-suggestions">
            {games.map((g) => (
              <option key={g.id} value={g.name} />
            ))}
          </datalist>
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
          disabled={!label.trim()}
          className="rounded bg-black px-4 py-2 text-sm font-bold text-satta-yellow disabled:opacity-40"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
