"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { voteComment } from "@/app/actions/votes";
import { createComment } from "@/app/actions/comments";
import { CommentActions } from "./comment-actions";

interface Author {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  postId: string;
  parentId: string | null;
  author: Author | null;
  isSaved?: boolean;
  isHidden?: boolean;
  children?: Comment[];
  userVote?: number;
  score: number;
}

interface CommentThreadProps {
  comment: Comment;
  postId: string;
  currentUserId: string | undefined;
  isSaved: boolean;
  isHidden: boolean;
}

export function CommentThread({
  comment,
  postId,
  currentUserId,
  isSaved,
  isHidden,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isAuthor = currentUserId === comment.userId;
  const isEdited = comment.updatedAt && new Date(comment.updatedAt) > new Date(comment.createdAt);

  const [optimisticState, addOptimisticVote] = useOptimistic(
    { score: comment.score, userVote: comment.userVote || 0 },
    (state, newVote: number) => {
      const oldVote = state.userVote;
      if (oldVote === newVote) {
        return { score: state.score - newVote, userVote: 0 };
      }
      return {
        score: state.score - oldVote + newVote,
        userVote: newVote,
      };
    }
  );

  const handleVote = async (value: number) => {
    if (!currentUserId) return;
    
    // Optimistic update
    startTransition(async () => {
      addOptimisticVote(value);
      try {
        await voteComment(comment.id, value, comment.userId, postId);
      } catch (error) {
        console.error("Failed to vote:", error);
      }
    });
  };

  const handleReply = async (formData: FormData) => {
    const content = formData.get("content") as string;
    if (!content || !currentUserId) return;

    try {
      await createComment(currentUserId, postId, content, comment.id);
      setIsReplying(false);
    } catch (error) {
      console.error("Failed to create reply:", error);
    }
  };

  const handleEditSave = async () => {
    if (!editContent || editContent === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, you'd call an updateComment action here
      // await updateComment(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-1 sm:gap-2">
      {/* Left border line */}
      <div className="w-0.5 bg-border hover:bg-primary/50 transition-colors cursor-pointer flex-shrink-0" />

      <div className="flex-1 py-1.5 sm:py-2 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs mb-1.5 sm:mb-2 truncate">
          <span className="font-semibold text-foreground truncate max-w-[80px] sm:max-w-none">
            {comment.author?.username || comment.author?.name || "Unknown"}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground shrink-0">
            {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          {isEdited && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground italic">edited</span>
            </>
          )}
        </div>

        {/* Comment content or edit mode */}
        {isEditing ? (
          <div className="space-y-2 mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-md text-sm min-h-[80px]"
              placeholder="Edit your comment..."
            />
            <div className="flex gap-2">
              <Button onClick={handleEditSave} size="sm" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleEditCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm mb-1.5 sm:mb-2 leading-relaxed break-words">{comment.content}</p>
        )}

        {/* Action buttons - Reddit style */}
        {!isEditing && (
          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold">
            {/* Vote buttons - horizontal */}
            <div className="flex items-center">
                <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-1 hover:bg-transparent ${
                    optimisticState.userVote === 1
                    ? "text-orange-500"
                    : "text-muted-foreground hover:text-orange-500"
                }`}
                onClick={() => handleVote(1)}
                disabled={isPending}
                >
                <ArrowBigUp
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${optimisticState.userVote === 1 ? "fill-current" : ""}`}
                />
                </Button>

                <span
                className={`min-w-[16px] sm:min-w-[20px] text-center ${
                    optimisticState.userVote === 1
                    ? "text-orange-500"
                    : optimisticState.userVote === -1
                        ? "text-blue-500"
                        : "text-muted-foreground"
                }`}
                >
                {optimisticState.score}
                </span>

                <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-1 hover:bg-transparent ${
                    optimisticState.userVote === -1
                    ? "text-blue-500"
                    : "text-muted-foreground hover:text-blue-500"
                }`}
                onClick={() => handleVote(-1)}
                disabled={isPending}
                >
                <ArrowBigDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${optimisticState.userVote === -1 ? "fill-current" : ""}`}
                />
                </Button>
            </div>

            <span className="text-muted-foreground mx-0.5 sm:mx-1">•</span>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5 sm:px-2 hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </Button>

            {currentUserId && (
              <>
                <span className="text-muted-foreground mx-0.5 sm:mx-1">•</span>
                <CommentActions
                  commentId={comment.id}
                  postId={postId}
                  currentUserId={currentUserId}
                  isAuthor={isAuthor}
                  isSaved={isSaved}
                  isHidden={isHidden}
                  onEditStart={() => setIsEditing(true)}
                  className="inline-flex"
                />
              </>
            )}
          </div>
        )}

        {/* Reply form */}
        {isReplying && (
          <form action={handleReply} className="mt-3 space-y-2">
            <textarea
              name="content"
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Write a reply..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Reply
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Recursive rendering of children */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-2 sm:mt-4 ml-1 sm:ml-2">
            {comment.children.map((child) => (
              <CommentThread
                key={child.id}
                comment={child}
                postId={postId}
                currentUserId={currentUserId}
                isSaved={false}
                isHidden={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
