import { redirect } from "next/navigation";
import { isAuthenticated } from "../lib/auth";

/** Redirects to the login page when the request is not authenticated. */
export async function guard(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/control-panel");
  }
}
