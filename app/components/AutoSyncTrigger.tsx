"use client";

import { useEffect } from "react";

/**
 * Fires a fire-and-forget refresh from a7satta once the home page has painted,
 * but only when the admin's auto-sync toggle is on. Running in the browser
 * after paint (not during the server render) is what keeps the page fast: the
 * ISR page is still served instantly from the edge cache, and this request goes
 * out afterwards on the visitor's side. `/api/auto-sync` re-checks the toggle
 * server-side and throttles, so this can never hammer upstream.
 *
 * Renders nothing.
 */
export default function AutoSyncTrigger({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    // Fire and forget — we never block on or read the response.
    fetch("/api/auto-sync", { method: "POST", keepalive: true }).catch(() => {});
  }, [enabled]);

  return null;
}
