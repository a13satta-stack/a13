"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      className="inline-flex items-center gap-2 rounded bg-black px-4 py-2 text-sm font-bold text-satta-yellow disabled:opacity-60"
      disabled={pending}
    >
      <span className={pending ? "animate-spin" : ""}>⟳</span>
      {pending ? "Refreshing…" : "Refresh"}
    </button>
  );
}
