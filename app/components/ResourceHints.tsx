/**
 * DNS hints for the origins visitors actually click through to — the WhatsApp
 * and Telegram call-to-actions on the home page, khaiwal boxes and footer.
 * Resolving them while the page is still being read shaves the DNS round trip
 * off the tap.
 *
 * The Metadata API has no field for `<link rel="dns-prefetch">`. ReactDOM's
 * `prefetchDNS` is the documented alternative, but it emits nothing on the
 * server render — which is the only render a crawler or a first-paint visitor
 * ever sees. Rendering the tags directly works instead: React 19 hoists
 * `<link>` elements out of the tree and into <head>.
 */
const ORIGINS = ["https://wa.me", "https://t.me"];

export default function ResourceHints() {
  return (
    <>
      {ORIGINS.map((origin) => (
        <link key={origin} rel="dns-prefetch" href={origin} />
      ))}
    </>
  );
}
