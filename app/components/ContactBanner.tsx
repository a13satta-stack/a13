import type { ContactBanner as ContactBannerData } from "../lib/types";

function waLink(number: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

/**
 * Full-width "संपर्क करें" banner under the results board — admin-editable via
 * Site Settings. Shows a heading/body/name, a WhatsApp call-to-action, a note,
 * and a Telegram call-to-action. Hidden entirely when disabled.
 */
export default function ContactBanner({ banner }: { banner: ContactBannerData }) {
  if (!banner?.enabled) return null;

  const hasWhatsapp = Boolean(banner.whatsappNumber.replace(/\D/g, ""));
  const hasTelegram = Boolean(banner.telegramUrl.trim());

  return (
    <section className="mx-auto max-w-5xl px-[5px] py-3">
      {/* Bright green frame with a dashed inner border, matching the promo look. */}
      <div className="rounded-2xl bg-[#22c55e] p-1.5 shadow-md shadow-brand-indigo/10">
        <div className="rounded-xl border-2 border-dashed border-satta-red bg-gradient-to-b from-satta-yellow to-satta-yellow-dark px-4 py-5 text-center text-brand-indigo">
          {banner.heading && (
            <h2 className="text-lg font-extrabold leading-snug">{banner.heading}</h2>
          )}
          {banner.body && (
            <p className="mx-auto mt-2 max-w-xl text-base font-semibold leading-snug">
              {banner.body}
            </p>
          )}
          {banner.name && (
            <p className="mt-2 text-lg font-extrabold tracking-wide">{banner.name}</p>
          )}

          {hasWhatsapp && (
            <a
              href={waLink(banner.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-2.5 text-base font-bold text-white shadow-sm transition hover:brightness-95"
            >
              <span aria-hidden className="text-xl leading-none">💬</span>
              WhatsApp Click to chat
            </a>
          )}

          {banner.note && (
            <p className="mx-auto mt-4 max-w-xl text-sm font-bold leading-snug">
              <span className="font-extrabold">NOTE:</span> {banner.note}
            </p>
          )}

          {banner.telegramText && (
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-snug">
              {banner.telegramText}
            </p>
          )}

          {hasTelegram && (
            <a
              href={banner.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#229ED9] px-6 py-2.5 text-base font-bold text-white shadow-sm transition hover:brightness-95"
            >
              <span aria-hidden className="text-xl leading-none">✈️</span>
              Telegram Click to connect
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
