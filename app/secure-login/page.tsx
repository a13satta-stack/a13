import { getSettings } from "../lib/db";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import UserLoginForm from "./UserLoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Login",
  description: "Sign in to your A13SATTA account.",
  alternates: { canonical: "/secure-login" },
  // Not somewhere we want indexed.
  robots: { index: false, follow: false },
};

export default async function SecureLoginPage() {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader siteName={settings.siteName} />

      {/* Faint brand banner, same look as the rest of the site. */}
      <div className="bg-satta-yellow py-10 text-center">
        <span className="text-3xl font-black tracking-wide text-black/20 sm:text-4xl">
          {settings.siteName}
        </span>
      </div>

      <main className="mx-auto w-full max-w-md flex-1 px-[5px] py-10">
        <div className="rounded-xl border border-black/10 bg-white p-7 shadow-md">
          <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Sign In</h1>
          <UserLoginForm />
        </div>
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
