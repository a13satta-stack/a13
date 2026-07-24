"use client";

import { useTransition } from "react";
import { syncNowAction } from "../actions/admin";
import { useToast } from "./Toast";
import { btnPrimary } from "./ui";

/**
 * Pulls the latest results from a7satta.com into the database on click. The
 * upstream fetch runs only here — public pages never touch a7satta — so the
 * operator decides when to refresh. The outcome (how many results landed, or
 * why it failed) is shown as a toast, and the panel's own numbers refresh
 * because the action revalidates the admin layout.
 */
export default function SyncNowButton({
  className = btnPrimary,
  label = "⏬ Fetch results from Other",
}: {
  className?: string;
  label?: string;
}) {
  const toast = useToast();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      onClick={() =>
        start(async () => {
          const r = await syncNowAction();
          toast(r.message, r.ok ? "success" : "error");
        })
      }
      className={className}
    >
      {pending && (
        <svg
          className="h-3.5 w-3.5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
          />
        </svg>
      )}
      {pending ? "Fetching from other web" : label}
    </button>
  );
}
