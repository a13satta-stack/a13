import { cookies } from "next/headers";
import crypto from "crypto";
import { getAuth, hashPassword } from "./db";

const COOKIE_NAME = "admin_session";

/** Token = HMAC(secret, "admin-authenticated"). Cannot be forged without the secret. */
function makeToken(secret: string): string {
  return crypto.createHmac("sha256", secret).update("admin-authenticated").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const auth = await getAuth();
  return safeEqual(hashPassword(password, auth.secret), auth.passwordHash);
}

export async function createSession(): Promise<void> {
  const auth = await getAuth();
  const token = makeToken(auth.secret);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const auth = await getAuth();
  return safeEqual(token, makeToken(auth.secret));
}

/** Throws if the current request is not authenticated. Call inside every admin mutation. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }
}
