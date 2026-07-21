import { guard } from "../guard";
import AdminShell from "../AdminShell";
import { getSettings, getGamesSorted } from "../../lib/db";
import { saveSettingsAction } from "../../actions/admin";
import ChangePasswordForm from "./ChangePasswordForm";
import { cardPad, input, label as labelClass, btnPrimary } from "../ui";
import ActionForm from "../ActionForm";
import SubmitButton from "../SubmitButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await guard();
  const [settings, games] = await Promise.all([getSettings(), getGamesSorted()]);

  const field = input;
  const label = labelClass;

  return (
    <AdminShell title="Site Settings">
      <ActionForm
        action={saveSettingsAction}
        success="Settings saved."
        error="Could not save the settings."
        className={`${cardPad} grid gap-4 sm:grid-cols-2`}
      >
        <label className="block">
          <span className={label}>Site name</span>
          <input name="siteName" defaultValue={settings.siteName} className={field} />
        </label>
        <label className="block">
          <span className={label}>Tagline</span>
          <input name="tagline" defaultValue={settings.tagline} className={field} />
        </label>

        <label className="block">
          <span className={label}>Featured game (big banner)</span>
          <select name="featuredGameId" defaultValue={settings.featuredGameId ?? ""} className={field}>
            <option value="">— none —</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Contact email</span>
          <input name="contactEmail" defaultValue={settings.contactEmail} className={field} />
        </label>

        <label className="block">
          <span className={label}>Telegram URL</span>
          <input name="telegramUrl" defaultValue={settings.telegramUrl} className={field} />
        </label>
        <label className="block">
          <span className={label}>WhatsApp number (with country code)</span>
          <input name="whatsappNumber" defaultValue={settings.whatsappNumber} className={field} />
        </label>

        <label className="block sm:col-span-2">
          <span className={label}>Notices (one per line — lines containing “telegram” get a Telegram button)</span>
          <textarea
            name="notices"
            rows={4}
            defaultValue={settings.notices.join("\n")}
            className={field}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={label}>Disclaimer</span>
          <textarea name="disclaimer" rows={4} defaultValue={settings.disclaimer} className={field} />
        </label>

        <div className="sm:col-span-2">
          <SubmitButton className={btnPrimary} pendingLabel="Saving…">
            Save Settings
          </SubmitButton>
        </div>
      </ActionForm>

      <div className={`${cardPad} mt-6 max-w-md`}>
        <h2 className="mb-3 text-lg font-bold">Change admin password</h2>
        <ChangePasswordForm />
      </div>
    </AdminShell>
  );
}
