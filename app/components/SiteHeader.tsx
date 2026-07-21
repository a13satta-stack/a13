import Link from "next/link";
import LiveClock from "./LiveClock";

// Pill nav buttons: equal widths in a 2-col grid on phones, 4-across on
// desktop. The light ring + hard bottom shadow give the raised look.
const pill =
  "rounded-full px-3 py-2 text-center text-xs font-extrabold tracking-wide text-black " +
  "ring-2 ring-white/60 shadow-[0_3px_0_rgba(255,255,255,0.25)] sm:px-4 sm:text-sm";

export default function SiteHeader({
  siteName,
  welcome,
}: {
  siteName: string;
  welcome?: string;
}) {
  const welcomeText =
    welcome ??
    `${siteName} official website welcomes you. Get informed about satta king's history, rules, and today's fastest results right here.`;

  return (
    <header className="bg-black text-satta-yellow">
      <nav className="mx-auto grid max-w-5xl grid-cols-2 gap-2 px-[5px] py-3 sm:grid-cols-4 sm:gap-4">
        <Link href="/" className={`${pill} bg-white`}>
          {siteName} 🏠
        </Link>
        <Link href="/chart" className={`${pill} bg-satta-yellow`}>
          CHART
        </Link>
        <Link href="/contact" className={`${pill} bg-satta-yellow`}>
          CONTACT
        </Link>
        <Link href="/admin/login" className={`${pill} bg-satta-yellow`}>
          LOGIN
        </Link>
      </nav>

      {/* Welcome line, scrolling right-to-left. Absolutely positioned like the
          notice marquee so its nowrap width never widens the page. */}
      <div className="mx-auto max-w-5xl px-[5px] pb-1">
        <div className="relative h-5 overflow-hidden">
          <span
            className="animate-marquee absolute left-0 top-0 text-sm font-bold leading-5 text-white"
            style={{ animationDuration: "32s" }}
          >
            {welcomeText}
          </span>
        </div>
      </div>

      <div className="bg-black pb-2 text-center text-xs text-satta-yellow">
        <LiveClock />
      </div>
    </header>
  );
}
