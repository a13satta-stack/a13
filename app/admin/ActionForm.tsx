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
 * A <form> whose Server Action reports its outcome as a toast.
 *
 * Server Actions are redacted in production, so a failure shows `error` (or a
 * generic line) rather than the raw message.
 */
export default function ActionForm({
  action,
  success,
  error,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  /** Toast shown once the action resolves. */
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
          await action(formData);
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
