import { db } from "@/lib/db";
import { posts, users, comments, votes, tags } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { VoteButtons } from "@/components/forum/vote-buttons";
import { createComment } from "@/app/actions/comments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommentThread } from "@/components/forum/comment-thread";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function PostPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  // 1. Fetch Post with Author and Tags
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: true,
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!post) notFound();

  // 2. Fetch Vote Stats
  const [voteStats] = await db
    .select({
      score: sql<number>`COALESCE(SUM(${votes.value}), 0)`.mapWith(Number),
    })
    .from(votes)
    .where(eq(votes.postId, id));

  // 3. Fetch User Vote
  let userVoteValue = 0;
  if (userId) {
    const userVote = await db.query.votes.findFirst({
      where: and(eq(votes.postId, id), eq(votes.userId, userId)),
    });
    if (userVote) {
      userVoteValue = userVote.value;
    }
  }

  // 4. Fetch Comments
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
    if (!session) return;
    const content = formData.get("content") as string;
    const currentUserId = session.user.id;
    await createComment(currentUserId, id, content);
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl px-4 sm:px-6">
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Vote Buttons - Left side on desktop, top hidden on mobile (optional, but keep simple) */}
          <div className="hidden sm:flex flex-col items-center pt-1">
            <VoteButtons
              postId={id}
              initialScore={voteStats.score}
              initialUserVote={userVoteValue}
              userId={userId || ""}
              authorId={post.userId}
            />
          </div>

          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight lg:text-5xl">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map(({ tag }) => (
                  <Badge key={tag.id} variant="secondary" className="px-3 py-1 text-sm font-medium">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.image || ""} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col sm:flex-row sm:divide-x sm:divide-muted-foreground/30 sm:gap-2 text-xs sm:text-sm">
                  <span className="font-medium text-foreground">{post.author.name}</span>
                  <span className="sm:pl-2">Posted on {post.createdAt.toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
              </div>
            </div>

            <hr className="my-6 border-border" />

            {/* Content */}
            <div className="prose dark:prose-invert prose-lg max-w-none text-foreground/90 leading-relaxed">
              {post.content.split('\n').map((line, i) => (
                <p key={i} className="mb-4 last:mb-0">{line}</p>
              ))}
            </div>
            
            {/* Mobile Vote Buttons (visible only on small screens) */}
             <div className="sm:hidden flex justify-start pt-4">
              <VoteButtons
                  postId={id}
                  initialScore={voteStats.score}
                  initialUserVote={userVoteValue}
                  userId={userId || ""}
                  authorId={post.userId}
                />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">
            {postComments.length} {postComments.length === 1 ? 'Comment' : 'Comments'}
          </h3>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg border">
          <form action={addComment} className="flex gap-4">
             <Avatar className="h-8 w-8 hidden sm:block">
                  <AvatarFallback>?</AvatarFallback>
             </Avatar>
             <div className="flex-1 space-y-3">
                <textarea
                  name="content"
                  className="w-full min-h-[80px] p-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="What are your thoughts?"
                />
                <div className="flex justify-end">
                   <Button type="submit" size="sm">Post Comment</Button>
                </div>
             </div>
          </form>
        </div>

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
