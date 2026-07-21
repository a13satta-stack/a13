import { getPosts, savePost } from "../../lib/db";
import { json, badRequest, ensureApiAuth, readJson, revalidateSite } from "../../lib/api";

// GET /api/posts (public)
export async function GET() {
  return json({ posts: await getPosts() });
}

// POST /api/posts  { title, body }  (auth)
export async function POST(req: Request) {
  const deny = await ensureApiAuth();
  if (deny) return deny;

  const body = await readJson(req);
  const title = String(body.title ?? "").trim();
  const text = String(body.body ?? "").trim();
  if (!title) return badRequest("title is required");

  await savePost({ title, body: text });
  revalidateSite();
  return json({ posts: await getPosts() }, 201);
}
