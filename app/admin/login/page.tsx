import { redirect } from "next/navigation";
import { isAuthenticated } from "../../lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-satta-yellow to-satta-yellow-dark px-4">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-7 shadow-xl">
        <div className="mb-5 flex flex-col items-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-base font-black text-satta-yellow shadow">
            A13
          </span>
          <h1 className="text-xl font-extrabold text-zinc-900">SATTA Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to manage results</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
