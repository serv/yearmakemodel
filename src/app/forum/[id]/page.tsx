import { db } from "@/lib/db";
import { posts, users, comments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { VoteButtons } from "@/components/forum/vote-buttons";
import { createComment } from "@/app/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Assuming generic textarea or use standard
import { Badge } from "@/components/ui/badge";
import { CommentThread } from "@/components/forum/comment-thread";

export default async function PostPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  // Fetch post
  const [post] = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, id));

  if (!post) notFound();

  // Fetch comments
  const postComments = await db
    .select({
      comment: comments,
      author: users,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, id))
    .orderBy(desc(comments.createdAt));

  async function addComment(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;
    const currentUserId = post.post.userId; // Mock: using author as current user for demo
    await createComment(currentUserId, id, content);
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{post.post.title}</h1>
        <div className="flex gap-2 mb-4">
          <Badge variant="secondary">2023</Badge>
          <Badge variant="secondary">Toyota</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <span>Posted by {post.author?.name}</span>
          <span>{post.post.createdAt.toLocaleDateString()}</span>
        </div>

        <div className="prose dark:prose-invert max-w-none border-l-4 pl-4 border-primary">
          {post.post.content}
        </div>

        <div className="mt-8 flex gap-4">
          <VoteButtons
            postId={id}
            initialScore={0}
            userId={post.post.userId} // Mock
            authorId={post.post.userId}
          />
        </div>
      </div>

      <div className="border-t pt-8">
        <h3 className="text-xl font-bold mb-4">Comments</h3>

        <form action={addComment} className="mb-8 space-y-4">
          <textarea
            name="content"
            className="w-full p-2 border rounded-md bg-background"
            placeholder="Add a comment..."
            rows={3}
          />
          <Button type="submit">Post Comment</Button>
        </form>

        <div className="space-y-6">
          {buildCommentTree(postComments).map((comment) => (
            <CommentThread key={comment.id} comment={comment} postId={id} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to build tree from flat list
function buildCommentTree(flatComments: any[]) {
  const map = new Map();
  const roots: any[] = [];

  // Initialize map
  flatComments.forEach((item) => {
    // Spread to avoid mutation issues if generic object type
    map.set(item.comment.id, {
      ...item.comment,
      author: item.author,
      children: [],
    });
  });

  // Build hierarchy
  flatComments.forEach((item) => {
    const comment = map.get(item.comment.id);
    if (item.comment.parentId) {
      const parent = map.get(item.comment.parentId);
      if (parent) {
        parent.children.push(comment);
      } else {
        // Parent not found (deleted?), treat as root or orphan
        roots.push(comment);
      }
    } else {
      roots.push(comment);
    }
  });

  return roots;
}
