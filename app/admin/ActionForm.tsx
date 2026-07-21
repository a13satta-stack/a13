"use client";

import { useToast } from "./Toast";

/**
 * `redirect()` / `notFound()` inside a Server Action surface as thrown errors
 * carrying a digest. Those are control flow, not failures — let them bubble.
 */
function isFrameworkError(e: unknown): boolean {
  const digest = (e as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && /^NEXT_(REDIRECT|NOT_FOUND|HTTP_ERROR)/.test(digest);
}

/**
 * What an action returns when it fails for a reason worth naming. Thrown
 * errors are redacted in production builds, so an action that wants to explain
 * itself — "that name is taken" — has to return the message instead.
 */
export type ActionFailure = { error: string };

function isFailure(r: unknown): r is ActionFailure {
  return typeof (r as ActionFailure | undefined)?.error === "string";
}

/**
 * A <form> whose Server Action reports its outcome as a toast.
 *
 * An action signals failure either by returning `{ error }` — shown verbatim —
 * or by throwing, which shows the generic `error` prop since the real message
 * does not survive to the client in production.
 */
export default function ActionForm({
  action,
  success,
  error,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void | ActionFailure>;
  /** Toast shown once the action resolves without an error. */
  success: string;
  /** Toast shown if it throws. Defaults to a generic failure line. */
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const toast = useToast();

  return (
    <form
      className={className}
      action={async (formData) => {
        try {
          const result = await action(formData);
          if (isFailure(result)) {
            toast(result.error, "error");
            return;
          }
          toast(success, "success");
        } catch (e) {
          if (isFrameworkError(e)) throw e;
          toast(error ?? "Something went wrong. Please try again.", "error");
        }
      }}
    >
      {children}
    </form>
  );
}
