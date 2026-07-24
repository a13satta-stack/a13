import Link from "next/link";
import type { SiteSettings } from "../lib/types";

export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-6 bg-black text-satta-yellow">
      <div className="mx-auto max-w-5xl px-[5px] py-4 text-center text-xs leading-relaxed">
        <div className="mb-2 flex flex-wrap justify-center gap-3 font-bold">
          <Link href="/">Home</Link>
          <Link href="/chart">Chart</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/control-panel">Admin</Link>
        </div>
        <p className="text-[11px] text-yellow-200/80">{settings.disclaimer}</p>
        <p className="mt-2">© {year} A13 Satta. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
