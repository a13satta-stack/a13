"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// UI-only user login for now — there is no user account store yet, so a
// successful "sign in" simply drops the visitor back on the homepage. Wire this
// up to a real auth action once user accounts exist.
export default function UserLoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="mb-1 block text-sm font-semibold text-zinc-800"
          htmlFor="username"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-500/40"
          placeholder="User ID"
        />
      </div>
      <div>
        <label
          className="mb-1 block text-sm font-semibold text-zinc-800"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-500/40"
          placeholder="Password"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 py-2.5 font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
