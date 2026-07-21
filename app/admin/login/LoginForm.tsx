"use client";

import { useActionState } from "react";
import { loginAction } from "../../actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500" htmlFor="password">
          Admin Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-satta-yellow/60"
          placeholder="Enter password"
        />
      </div>
      {state?.error && <p className="text-sm font-bold text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 py-2.5 font-bold text-satta-yellow shadow-sm transition hover:bg-black disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Login"}
      </button>
      <p className="text-center text-xs text-zinc-500">
        Default password: <code className="rounded bg-zinc-100 px-1 py-0.5">admin123</code> (change
        it in Settings)
      </p>
    </form>
  );
}
