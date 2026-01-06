"use client";

import {
  MoreHorizontal,
  Flag,
  Bookmark,
  EyeOff,
  Eye,
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
  toggleSaveComment,
  hideComment,
  unhideComment,
  deleteComment,
  reportComment,
} from "@/app/actions/comments";
import { toast } from "sonner";

interface CommentActionsProps {
  commentId: string;
  postId: string;
  currentUserId: string;
  isAuthor: boolean;
  isSaved: boolean;
  isHidden?: boolean;
  onEditStart?: () => void;
  className?: string;
}

export function CommentActions({
  commentId,
  postId,
  currentUserId,
  isAuthor,
  isSaved,
  isHidden,
  onEditStart,
  className,
}: CommentActionsProps) {
  const handleSave = async () => {
    if (!currentUserId) return toast.error("Please sign in to save comments");
    try {
      const result = await toggleSaveComment(commentId);
      toast.success(result.saved ? "Comment saved" : "Comment unsaved");
    } catch (e) {
      toast.error("Failed to save comment");
    }
  };

  const handleHide = async () => {
    if (!currentUserId) return;
    try {
      if (isHidden) {
        await unhideComment(commentId);
        toast.success("Comment unhidden");
      } else {
        await hideComment(commentId);
        toast.success("Comment hidden");
      }
    } catch (e) {
      toast.error(
        isHidden ? "Failed to unhide comment" : "Failed to hide comment",
      );
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(commentId);
      toast.success("Comment deleted");
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  };

  const handleReport = async () => {
    if (!currentUserId) return (window.location.href = "/sign-in");
    try {
      await reportComment(commentId, "User reported");
      toast.success("Comment reported");
    } catch (e) {
      toast.error("Failed to report comment");
    }
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 hover:bg-muted text-muted-foreground hover:text-foreground font-semibold text-xs"
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
                {isHidden ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Unhide
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide
                  </>
                )}
              </DropdownMenuItem>
              {isAuthor && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onEditStart}>
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
