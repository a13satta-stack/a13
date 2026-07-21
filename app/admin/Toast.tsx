"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type ToastKind = "success" | "error";
type Toast = { id: number; message: string; kind: ToastKind };
type ShowToast = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<ShowToast | null>(null);

/** Show a toast from any client component under <ToastProvider>. */
export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside <ToastProvider>");
  return show;
}

const DURATION_MS = 3500;
let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ShowToast>(
    (message, kind = "success") => {
      const id = nextId++;
      setToasts((list) => [...list, { id, message, kind }]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-toast-in pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${
              t.kind === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            <span aria-hidden className="text-base leading-none">
              {t.kind === "success" ? "✓" : "⚠"}
            </span>
            <span className="min-w-0 flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-white/70 transition hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
