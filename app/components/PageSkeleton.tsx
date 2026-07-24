/**
 * Placeholder shown the instant a navigation starts, via each route's
 * `loading.tsx`. Next streams this immediately while the server component
 * renders, so a click gives feedback right away instead of the page appearing
 * to hang until the server responds. Kept in the site's yellow/black palette so
 * the swap to real content isn't jarring.
 */
export default function PageSkeleton() {
  const bar = "rounded bg-black/10";
  return (
    <div aria-hidden className="min-h-[60vh] animate-pulse">
      <div className="bg-black px-3 py-3">
        <div className="mx-auto flex max-w-5xl gap-2">
          <div className={`h-9 flex-1 ${bar} bg-white/20`} />
          <div className={`h-9 flex-1 ${bar} bg-white/20`} />
          <div className={`h-9 flex-1 ${bar} bg-white/20`} />
          <div className={`h-9 flex-1 ${bar} bg-white/20`} />
        </div>
      </div>

      <div className="border-y-4 border-black bg-satta-yellow py-6 text-center">
        <div className={`mx-auto h-8 w-64 ${bar}`} />
      </div>

      <div className="mx-auto max-w-5xl space-y-3 px-3 py-6">
        <div className={`h-24 ${bar}`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-16 ${bar}`} />
          ))}
        </div>
        <div className={`h-40 ${bar}`} />
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
