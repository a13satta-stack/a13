"use server";

import { redirect } from "next/navigation";
import { getAuth, setPasswordHash, hashPassword } from "../lib/db";
import {
  verifyPassword,
  createSession,
  destroySession,
  requireAuth,
} from "../lib/auth";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { error: "Password is required." };
  }
  if (!(await verifyPassword(password))) {
    return { error: "Incorrect password." };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  await requireAuth();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!(await verifyPassword(current))) {
    return { error: "Current password is incorrect." };
  }
  if (next.length < 6) {
    return { error: "New password must be at least 6 characters." };
  }
  const { secret } = await getAuth();
  await setPasswordHash(hashPassword(next, secret));
  return { ok: true };
}
