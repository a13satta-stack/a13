import { guard } from "../guard";
import AdminShell from "../AdminShell";
import { getPosts } from "../../lib/db";
import { savePostAction, deletePostAction } from "../../actions/admin";
import { cardPad, input, btnPrimary, btnSuccess, btnDanger } from "../ui";
import ActionForm from "../ActionForm";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  await guard();
  const posts = await getPosts();

  return (
    <AdminShell title="Blog Posts">
      {/* New post */}
      <ActionForm
        action={savePostAction}
        success="Post published."
        error="Could not publish the post."
        className={`${cardPad} mb-6 space-y-3`}
      >
        <h2 className="text-lg font-bold">Add new post</h2>
        <input name="title" required placeholder="Post title" className={input} />
        <textarea name="body" rows={4} placeholder="Post content" className={input} />
        <button className={btnPrimary}>+ Publish</button>
      </ActionForm>

      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p.id} className={`${cardPad}`}>
            <ActionForm
              action={savePostAction}
              success="Post saved."
              error="Could not save the post."
              className="space-y-2"
            >
              <input type="hidden" name="id" value={p.id} />
              <input name="title" defaultValue={p.title} className={`${input} font-bold`} />
              <textarea name="body" rows={3} defaultValue={p.body} className={input} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {new Date(p.createdAt).toLocaleString()}
                </span>
                <button className={btnSuccess}>Save</button>
              </div>
            </ActionForm>
            <ActionForm
              action={deletePostAction}
              success="Post deleted."
              error="Could not delete the post."
              className="mt-3 border-t border-zinc-100 pt-3 text-right"
            >
              <input type="hidden" name="id" value={p.id} />
              <button className={btnDanger}>Delete post</button>
            </ActionForm>
          </div>
        ))}
        {posts.length === 0 && <p className="text-center text-zinc-500">No posts yet.</p>}
      </div>
    </AdminShell>
  );
}
