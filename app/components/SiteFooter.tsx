import Link from "next/link";
import type { SiteSettings } from "../lib/types";

export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const linkCls = "transition-colors hover:text-white";
  return (
    <footer className="mt-8 border-t-4 border-brand-gold bg-gradient-to-b from-brand-indigo-2 to-brand-indigo text-brand-gold">
      <div className="mx-auto max-w-5xl px-[5px] py-5 text-center text-xs leading-relaxed">
        <div className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2 font-bold">
          <Link href="/" className={linkCls}>Home</Link>
          <Link href="/chart" className={linkCls}>Chart</Link>
          <Link href="/contact" className={linkCls}>Contact</Link>
          <Link href="/terms" className={linkCls}>Terms &amp; Conditions</Link>
          <Link href="/privacy" className={linkCls}>Privacy Policy</Link>
          <Link href="/control-panel" className={linkCls}>Admin</Link>
        </div>
        <p className="text-[11px] text-brand-gold/60">{settings.disclaimer}</p>
        <p className="mt-3 font-semibold text-brand-gold/90">© {year} A13 Satta. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
