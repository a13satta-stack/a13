import { getSettings } from "../lib/db";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const dynamic = "force-dynamic";

// The brand suffix comes from the root layout's title template.
export const metadata = {
  title: "Privacy Policy",
  description: "How the A13SATTA results website handles visitor information.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader siteName={settings.siteName} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-[5px] py-6">
        <div className="rounded-lg border-2 border-black bg-white p-5">
          <h1 className="mb-4 text-center text-xl font-extrabold">Privacy Policy</h1>

          <div className="space-y-4 text-sm leading-relaxed text-gray-800">
            <p>
              This policy explains what information {settings.siteName} collects when you visit, and
              how it is used.
            </p>

            <section>
              <h2 className="mb-1 font-bold text-black">1. Information we collect</h2>
              <p>
                You do not need an account to view results, and we do not ask visitors for personal
                details. We do not collect your name, address, or payment information. If you
                contact us by email, WhatsApp, or Telegram, we receive whatever you choose to send
                us in that message.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">2. Automatically collected data</h2>
              <p>
                Like most websites, our hosting provider may record standard technical information
                such as your IP address, browser type, device type, and the pages you opened. This
                is used only to keep the site running and to understand overall traffic — never to
                identify you personally.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">3. Cookies</h2>
              <p>
                The public pages of this site do not use tracking or advertising cookies. A cookie
                is used only for the admin login area, to keep an administrator signed in. You can
                block or delete cookies in your browser settings without affecting your ability to
                view results.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">4. Third-party links and services</h2>
              <p>
                This site links out to third-party services such as WhatsApp and Telegram, and shows
                sponsored contact details. Once you leave our site, the privacy policy of that other
                service applies. We do not control those services and are not responsible for how
                they handle your information.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">5. Sharing your information</h2>
              <p>
                We do not sell, rent, or trade visitor information. We may disclose information only
                if required to do so by law.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">6. Children</h2>
              <p>
                This website is not intended for anyone under 18, and we do not knowingly collect
                information from children.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-bold text-black">7. Changes to this policy</h2>
              <p>
                We may update this policy from time to time. The latest version will always be
                available on this page.
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
