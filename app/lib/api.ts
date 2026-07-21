import { revalidatePath } from "next/cache";
import { isAuthenticated } from "./auth";

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

export function unauthorized(): Response {
  return json({ error: "Unauthorized" }, 401);
}

export function notFound(message = "Not found"): Response {
  return json({ error: message }, 404);
}

/** The request was well formed but clashes with existing state. */
export function conflict(message: string): Response {
  return json({ error: message }, 409);
}

/** Returns an error Response when the caller is not authenticated, otherwise null. */
export async function ensureApiAuth(): Promise<Response | null> {
  return (await isAuthenticated()) ? null : unauthorized();
}

/** Revalidate the public pages after a mutation via the API. */
export function revalidateSite(): void {
  revalidatePath("/");
  revalidatePath("/chart");
  revalidatePath("/admin", "layout");
}

/** Safely parse a JSON request body, returning {} on failure. */
export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
