import { guard } from "../guard";
import AdminShell from "../AdminShell";
import { getKhaiwalsSorted, getGamesSorted } from "../../lib/db";
import type { Khaiwal, Game } from "../../lib/types";
import {
  saveKhaiwalAction,
  deleteKhaiwalAction,
  moveKhaiwalAction,
} from "../../actions/admin";
import KhaiwalLinesEditor from "./KhaiwalLinesEditor";
import { cardPad, input, label, btnPrimary, btnSuccess, btnDanger, btnIcon } from "../ui";
import ActionForm from "../ActionForm";
import SubmitButton from "../SubmitButton";

export const dynamic = "force-dynamic";

const inputClass = input;
const labelClass = label;

/** Shared field set, used for both the "add" and "edit" forms. */
function BoxFields({ box, games }: { box?: Khaiwal; games: Game[] }) {
  return (
    <>
      <div>
        <label className={labelClass}>Top line (heading)</label>
        <input
          name="heading"
          defaultValue={box?.heading}
          placeholder="--सीधे सट्टा कंपनी का No 1 खाईवाल--"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Box title *</label>
        <input
          name="title"
          required
          defaultValue={box?.title}
          placeholder="👑 AJAY BHAI KHAIWAL 👑"
          className={`${inputClass} font-bold`}
        />
      </div>
      <div>
        <label className={labelClass}>Timing rows — select a game, set time, add one by one</label>
        <KhaiwalLinesEditor games={games} defaultLines={box?.lines ?? []} />
      </div>
      <div>
        <label className={labelClass}>Extra note (optional, shown below rows)</label>
        <textarea
          name="note"
          rows={2}
          defaultValue={box?.note}
          placeholder="minimum ID 500₹ maximum no limit"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Footer text</label>
        <input
          name="footer"
          defaultValue={box?.footer}
          placeholder="Game play करने के लिये नीचे लिंक पर क्लिक करे"
          className={inputClass}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <label className={labelClass}>WhatsApp number</label>
          <input
            name="whatsappNumber"
            defaultValue={box?.whatsappNumber}
            placeholder="911234567890"
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>Button text</label>
          <input
            name="buttonText"
            defaultValue={box?.buttonText ?? "WhatsApp Click to chat"}
            placeholder="WhatsApp Click to chat"
            className={inputClass}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="active" defaultChecked={box ? box.active : true} /> Show on
        home page
      </label>
    </>
  );
}

export default async function KhaiwalsPage() {
  await guard();
  const [boxes, games] = await Promise.all([getKhaiwalsSorted(), getGamesSorted()]);

  return (
    <AdminShell title="Khaiwal Boxes">
      <p className="mb-4 text-sm text-gray-600">
        These boxes appear near the top of the home page. Everything below — headings, timing
        rows, notes and the WhatsApp button — is fully editable here.
      </p>

      {/* Add new box */}
      <ActionForm
        action={saveKhaiwalAction}
        success="Box added."
        error="Could not add the box."
        className={`${cardPad} mb-6 space-y-3`}
      >
        <h2 className="text-lg font-bold">Add new box</h2>
        <BoxFields games={games} />
        <SubmitButton className={btnPrimary} pendingLabel="Adding…">
          + Add Box
        </SubmitButton>
      </ActionForm>

      <div className="space-y-4">
        {boxes.map((box, i) => (
          <div key={box.id} className={cardPad}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Box #{i + 1}
              </span>
              <div className="flex gap-1">
                <ActionForm
                  action={moveKhaiwalAction}
                  success={`Box #${i + 1} moved up.`}
                  error="Could not move the box."
                >
                  <input type="hidden" name="id" value={box.id} />
                  <input type="hidden" name="dir" value="up" />
                  <SubmitButton disabled={i === 0} className={btnIcon} title="Move up">
                    ↑
                  </SubmitButton>
                </ActionForm>
                <ActionForm
                  action={moveKhaiwalAction}
                  success={`Box #${i + 1} moved down.`}
                  error="Could not move the box."
                >
                  <input type="hidden" name="id" value={box.id} />
                  <input type="hidden" name="dir" value="down" />
                  <SubmitButton
                    disabled={i === boxes.length - 1}
                    className={btnIcon}
                    title="Move down"
                  >
                    ↓
                  </SubmitButton>
                </ActionForm>
              </div>
            </div>

            <ActionForm
              action={saveKhaiwalAction}
              success="Box saved."
              error="Could not save the box."
              className="space-y-3"
            >
              <input type="hidden" name="id" value={box.id} />
              <BoxFields box={box} games={games} />
              <SubmitButton className={btnSuccess} pendingLabel="Saving…">
                Save changes
              </SubmitButton>
            </ActionForm>

            <ActionForm
              action={deleteKhaiwalAction}
              success="Box deleted."
              error="Could not delete the box."
              className="mt-3 border-t border-zinc-100 pt-3 text-right"
            >
              <input type="hidden" name="id" value={box.id} />
              <SubmitButton className={btnDanger} pendingLabel="Deleting…">
                Delete box
              </SubmitButton>
            </ActionForm>
          </div>
        ))}
        {boxes.length === 0 && (
          <p className="text-center text-zinc-500">No boxes yet. Add one above.</p>
        )}
      </div>
    </AdminShell>
  );
}
