"use client";

import {
  MoreHorizontal,
  Flag,
  Bookmark,
  EyeOff,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  toggleSavePost,
  hidePost,
  deletePost,
  reportPost,
} from "@/app/actions/posts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PostActionsProps {
  postId: string;
  currentUserId: string;
  isAuthor: boolean;
  isSaved: boolean;
  className?: string; // Allow custom positioning
}

export function PostActions({
  postId,
  currentUserId,
  isAuthor,
  isSaved,
  className,
}: PostActionsProps) {
  const router = useRouter();

  const handleSave = async () => {
    if (!currentUserId) return toast.error("Please sign in to save posts");
    try {
      const result = await toggleSavePost(postId);
      toast.success(result.saved ? "Post saved" : "Post unsaved");
    } catch (e) {
      toast.error("Failed to save post");
    }
  };

  const handleHide = async () => {
    if (!currentUserId) return;
    try {
      await hidePost(postId);
      toast.success("Post hidden");
      // If hiding from single post page, maybe redirect? For now just visual.
      // On feed it disappears. On single page it might stay but be "hidden" state.
      // Let's assume user stays on page.
    } catch (e) {
      toast.error("Failed to hide post");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(postId);
      toast.success("Post deleted");
      // If we are on the post page, we should redirect.
      // If we are on the list, the list updates.
      // We can check if we are on the post page using path, or safe to just always redirect to home if successful?
      // Actually deletePost does revalidatePath('/').
      // If we are on /post/[id], we probably want to go home.
      // Let's try to detect context or just letting the user navigate. 
      // Ideally reuse this component carefully.
      // For now, let's just do router.push('/') if deleted.
      router.push("/"); 
    } catch (e) {
      toast.error("Failed to delete post");
    }
  };

  const handleReport = async () => {
    if (!currentUserId) return (window.location.href = "/sign-in");
    try {
      await reportPost(postId, "User reported");
      toast.success("Post reported");
    } catch (e) {
      toast.error("Failed to report post");
    }
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentUserId ? (
            <>
              <DropdownMenuItem onClick={handleSave}>
                <Bookmark
                  className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                />
                {isSaved ? "Unsave" : "Save"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleHide}>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide
              </DropdownMenuItem>
              {isAuthor && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/post/${postId}/edit`)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onClick={() => (window.location.href = "/sign-in")}
              >
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => (window.location.href = "/sign-in")}
              >
                Log in for more options
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
