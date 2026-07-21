import type { Khaiwal } from "../lib/types";

function whatsappLink(number: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

function KhaiwalCard({ box }: { box: Khaiwal }) {
  return (
    <div className="flex flex-col rounded-xl border-2 border-dashed border-satta-red bg-gradient-to-b from-satta-yellow to-satta-yellow-dark p-3 text-center shadow-sm">
      {box.heading && (
        <p className="text-sm font-bold leading-tight text-black">{box.heading}</p>
      )}
      {box.title && (
        <h3 className="mt-1 text-base font-extrabold leading-tight text-black">{box.title}</h3>
      )}

      {box.lines.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm font-semibold text-black">
          {box.lines.map((ln, i) => (
            <li key={i} className="flex items-baseline gap-1">
              <span className="whitespace-nowrap">⏰ {ln.label}</span>
              <span className="mx-1 flex-1 border-b border-dotted border-black/40" />
              <span className="whitespace-nowrap">{ln.time}</span>
            </li>
          ))}
        </ul>
      )}

      {box.note && (
        <p className="mt-2 whitespace-pre-line text-sm font-semibold text-black">{box.note}</p>
      )}

      {box.footer && (
        <p className="mt-2 text-sm font-bold text-blue-800 underline">{box.footer}</p>
      )}

      {box.whatsappNumber && (
        <a
          href={whatsappLink(box.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 self-center rounded-full bg-[#25D366] px-5 py-2 pt-3 text-sm font-bold text-white"
        >
          <span aria-hidden className="text-lg leading-none">
            💬
          </span>
          <span className="whitespace-pre-line leading-tight">{box.buttonText}</span>
        </a>
      )}
    </div>
  );
}

/** Admin-managed promotional "khaiwal" boxes shown near the top of the home page. */
export default function KhaiwalBoxes({ boxes }: { boxes: Khaiwal[] }) {
  const active = boxes.filter((b) => b.active);
  if (active.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-[5px] py-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {active.map((box) => (
          <KhaiwalCard key={box.id} box={box} />
        ))}
      </div>
    </section>
  );
}
