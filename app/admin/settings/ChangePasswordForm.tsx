"use client";

import { useActionState, useEffect } from "react";
import { changePasswordAction } from "../../actions/auth";
import { useToast } from "../Toast";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, {});
  const toast = useToast();

  // `state` is a fresh object per submit, so each outcome toasts exactly once.
  useEffect(() => {
    if (state?.ok) toast("Password updated.");
    else if (state?.error) toast(state.error, "error");
  }, [state, toast]);

  const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500";
  const field =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-satta-yellow/60";

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className={label}>Current password</label>
        <input name="current" type="password" className={field} />
      </div>
      <div>
        <label className={label}>New password</label>
        <input name="next" type="password" className={field} />
      </div>
      {state?.error && <p className="text-sm font-bold text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2 text-sm font-bold text-satta-yellow shadow-sm transition hover:bg-black disabled:opacity-60"
      >
        {pending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}
