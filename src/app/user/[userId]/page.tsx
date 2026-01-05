import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { 
  getUserProfile, 
  getUserPosts, 
  getUserComments, 
  getUserSavedPosts, 
  getUserHiddenPosts 
} from "@/app/actions/user-profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { PostCard } from "@/components/forum/post-card";
import { UserCommentCard } from "@/components/profile/user-comment-card";

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { userId } = await params;
  const { view = "posts" } = await searchParams;
  
  const user = await getUserProfile(userId);
  
  if (!user) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  const isOwner = session?.user.id === userId;

  // Security check for private tabs
  if ((view === "saved" || view === "hidden") && !isOwner) {
    // If trying to access private tabs without ownership, default to posts or 403?
  }

  let content;
  
  switch (view) {
    case "comments":
      const comments = await getUserComments(userId);
      content = comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((item) => (
            <UserCommentCard
              key={item.comment.id}
              comment={item.comment}
              post={item.post}
              author={item.author}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">No comments yet</div>
      );
      break;
      
    case "saved":
      if (!isOwner) {
        content = <div className="text-center py-10 text-muted-foreground">Unauthorized</div>;
        break;
      }
      const savedPosts = await getUserSavedPosts();
      content = savedPosts.length > 0 ? (
        <div className="space-y-6">
          {savedPosts.map((postData: any) => (
            <PostCard
              key={postData.post.id}
              post={{ ...postData.post, author: postData.author }}
              currentUserId={session?.user?.id ?? ""}
              score={postData.score}
              commentCount={postData.commentCount}
              tags={postData.tags}
              userVote={postData.userVote}
              isSaved={true} // It is in saved tab
              isHidden={postData.isHidden}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">No saved posts</div>
      );
      break;
      
    case "hidden":
      if (!isOwner) {
        content = <div className="text-center py-10 text-muted-foreground">Unauthorized</div>;
        break;
      }
      const hiddenPosts = await getUserHiddenPosts();
      content = hiddenPosts.length > 0 ? (
        <div className="space-y-6">
          {hiddenPosts.map((postData: any) => (
            <PostCard
              key={postData.post.id}
              post={{ ...postData.post, author: postData.author }}
              currentUserId={session?.user?.id ?? ""}
              score={postData.score}
              commentCount={postData.commentCount}
              tags={postData.tags}
              userVote={postData.userVote}
              isSaved={postData.isSaved}
              isHidden={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">No hidden posts</div>
      );
      break;
      
    case "posts":
    default:
      const posts = await getUserPosts(userId);
      content = posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((postData: any) => (
            <PostCard
              key={postData.post.id}
              post={{ ...postData.post, author: postData.author }}
              currentUserId={session?.user?.id ?? ""}
              score={postData.score}
              commentCount={postData.commentCount}
              tags={postData.tags}
              userVote={postData.userVote}
              isSaved={postData.isSaved}
              isHidden={postData.isHidden}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">No posts yet</div>
      );
      break;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <ProfileHeader user={user} isOwner={isOwner} />
      
      <div className="space-y-6">
        <ProfileTabs userId={userId} isOwner={isOwner} />
        {content}
      </div>
    </div>
  );
}
