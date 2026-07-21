import type { SiteSettings } from "../lib/types";

function whatsappLink(number: string, text: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

// `w-full` below is required: the root is a direct flex child of
// <body class="flex flex-col">, and an auto cross-axis margin (mx-auto) cancels
// align-items:stretch, which would otherwise shrink the box to fit-content.
export default function NoticeMarquee({ settings }: { settings: SiteSettings }) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-2 px-[5px] py-3">
      {settings.notices.map((notice, i) => {
        const isTelegram = /telegram/i.test(notice);
        return (
          <div
            key={i}
            className="flex items-center gap-3 overflow-hidden rounded border-2 border-black bg-white px-2 py-1"
          >
            {/* The scrolling text is absolutely positioned so its nowrap width
                never becomes an intrinsic min-width that widens the page. */}
            <div className="relative h-4 min-w-0 flex-1 overflow-hidden">
              <span className="animate-marquee absolute left-0 top-0 text-xs font-bold leading-4 text-red-700">
                {notice}
              </span>
            </div>
            {isTelegram ? (
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded bg-[#229ED9] px-3 py-1 text-xs font-bold text-white"
              >
                Telegram
              </a>
            ) : (
              <a
                href={whatsappLink(settings.whatsappNumber, "Please add me for satta results")}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded bg-[#25D366] px-3 py-1 text-xs font-bold text-white"
              >
                WhatsApp
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
