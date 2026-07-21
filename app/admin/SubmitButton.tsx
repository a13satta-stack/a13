"use client";

import { useFormStatus } from "react-dom";

function Spinner() {
  return (
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
  );
}

/**
 * Submit button that shows the form's own in-flight state.
 *
 * `useFormStatus` reports on the nearest enclosing <form>, so each admin form
 * — and each per-row save/delete/reorder form in a table — tracks its own
 * request. Disabling while pending also stops a double submit from creating
 * two games or firing a delete twice.
 */
export default function SubmitButton({
  className,
  pendingLabel,
  disabled,
  title,
  children,
}: {
  className?: string;
  /** Replaces the label while the action is in flight, e.g. "Saving…". */
  pendingLabel?: string;
  /** Disabled for reasons of its own, e.g. a first row's "move up". */
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      title={title}
      className={className}
    >
      {pending && <Spinner />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
