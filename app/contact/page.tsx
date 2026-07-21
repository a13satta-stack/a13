import { getSettings } from "../lib/db";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const dynamic = "force-dynamic";

// The brand suffix comes from the root layout's title template.
export const metadata = {
  title: "Contact Us",
  description:
    "Contact A13SATTA for any query about satta king results, record charts or game timings.",
  alternates: { canonical: "/contact" },
};

function whatsappLink(number: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader siteName={settings.siteName} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-[5px] py-6">
        <div className="rounded-lg border-2 border-black bg-white p-5">
          <h1 className="mb-4 text-center text-xl font-extrabold">Contact Us</h1>
          <p className="mb-4 rounded border-2 border-black bg-satta-yellow px-3 py-3 text-center text-sm font-bold">
            For any enquiry message us at{" "}
            <a className="underline" href={`mailto:${settings.contactEmail}`}>
              {settings.contactEmail}
            </a>
          </p>
         
          <p className="mt-5 text-xs text-gray-600">
            For any query related to results, please reach out via the channels above.
          </p>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
