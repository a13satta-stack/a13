import { getSettings } from "../lib/db";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const dynamic = "force-dynamic";

// The brand suffix comes from the root layout's title template.
export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using the A13SATTA results website.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader siteName={settings.siteName} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-[5px] py-6">
        <div className="rounded-lg border-2 border-black bg-white p-5">
          <h1 className="mb-4 text-center text-xl font-extrabold">Terms &amp; Conditions</h1>

          <div className="space-y-4 text-sm leading-relaxed text-gray-800">
            <p>
              By visiting {settings.siteName}, you agree to these terms. If you do not agree with
              any part of them, please stop using this website.
            </p>

            <section>
              <h2 className="mb-1 font-bold text-black">1. Information only</h2>
              <p>
                This website is a non-commercial, informational site. Results, charts and timings
                are published for general information and entertainment only. We do not run any
                game, accept any bets, hold any money, or take part in any transaction between
                visitors and any third party.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">2. Legality is your responsibility</h2>
              <p>
                Satta, matka, and similar gambling or betting activities may be prohibited in your
                country or state. It is entirely your responsibility to know and follow the laws
                that apply to you. Use this site at your own risk.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">3. No guarantee of accuracy</h2>
              <p>
                Results are updated as quickly as we can, but they may be delayed, incomplete, or
                incorrect. Nothing on this site is a guarantee of any outcome, and no content here
                should be treated as advice or a prediction. Always confirm any result from the
                official source before relying on it.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">4. Third-party content and links</h2>
              <p>
                Some content, links, and contact numbers shown on this site are sponsored or are
                supplied by third parties. We do not own, control, or endorse those third parties
                and we are not responsible for any loss, dispute, or scam arising from your dealings
                with them.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">5. Limitation of liability</h2>
              <p>
                We are not liable for any loss or damage — financial, legal, or otherwise — that
                results from using this website or from acting on information found here.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">6. Age restriction</h2>
              <p>
                This website is not intended for anyone under 18 years of age.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">7. Intellectual property</h2>
              <p>
                The layout, design, and original content of this site belong to {settings.siteName}.
                Do not copy or republish it without permission.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">8. Changes to these terms</h2>
              <p>
                We may update these terms at any time. Continuing to use the site after a change
                means you accept the updated terms.
              </p>
            </section>

            <p className="border-t border-black/10 pt-4">
              For any enquiry message us at{" "}
              <a className="font-bold text-blue-700 underline" href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
