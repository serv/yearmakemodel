"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createComment, updateComment } from "@/app/actions/comments";
import { CommentActions } from "./comment-actions";
import { toast } from "sonner";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { voteComment } from "@/app/actions/votes";
import { useOptimistic, useTransition } from "react";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  author: { name: string | null; username?: string | null };
  children?: Comment[];
  userId: string;
  score?: number;
  userVote?: number;
};

interface CommentThreadProps {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  isSaved?: boolean;
  isHidden?: boolean;
}

export function CommentThread({
  comment,
  postId,
  currentUserId,
  isSaved = false,
  isHidden = false,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  const isAuthor = currentUserId === comment.userId;
  const isEdited =
    comment.updatedAt &&
    new Date(comment.updatedAt).getTime() !==
      new Date(comment.createdAt).getTime();

  // Vote state
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(
    { score: comment.score || 0, userVote: comment.userVote || 0 },
    (state, newVote: number) => {
      let newScore = state.score;
      if (state.userVote === newVote) {
        newScore -= newVote;
        return { score: newScore, userVote: 0 };
      } else {
        if (state.userVote !== 0) {
          newScore -= state.userVote;
        }
        newScore += newVote;
        return { score: newScore, userVote: newVote };
      }
    },
  );

  const handleVote = (value: number) => {
    if (!currentUserId) {
      toast.error("Please sign in to vote");
      return;
    }
    startTransition(async () => {
      setOptimisticState(value);
      await voteComment(comment.id, value, comment.userId, postId);
    });
  };

  async function handleReply(formData: FormData) {
    const content = formData.get("content") as string;
    if (!currentUserId) {
      toast.error("Please sign in to reply");
      return;
    }
    await createComment(currentUserId, postId, content, comment.id);
    setIsReplying(false);
  }

  async function handleEditSave() {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      await updateComment(comment.id, editContent);
      toast.success("Comment updated");
      setIsEditing(false);
    } catch (e) {
      toast.error("Failed to update comment");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEditCancel() {
    setEditContent(comment.content);
    setIsEditing(false);
  }

  return (
    <div className="flex gap-2">
      {/* Left border line */}
      <div className="w-0.5 bg-border hover:bg-primary/50 transition-colors cursor-pointer flex-shrink-0" />

      <div className="flex-1 py-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs mb-2">
          <span className="font-semibold text-foreground">
            {comment.author?.username || comment.author?.name || "Unknown"}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString()}
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
          <p className="text-sm mb-2 leading-relaxed">{comment.content}</p>
        )}

        {/* Action buttons - Reddit style */}
        {!isEditing && (
          <div className="flex items-center gap-1 text-xs font-semibold">
            {/* Vote buttons - horizontal */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-1 hover:bg-transparent ${
                optimisticState.userVote === 1
                  ? "text-orange-500"
                  : "text-muted-foreground hover:text-orange-500"
              }`}
              onClick={() => handleVote(1)}
              disabled={isPending}
            >
              <ArrowBigUp
                className={`w-5 h-5 ${optimisticState.userVote === 1 ? "fill-current" : ""}`}
              />
            </Button>

            <span
              className={`min-w-[20px] text-center ${
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
              className={`h-6 px-1 hover:bg-transparent ${
                optimisticState.userVote === -1
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-blue-500"
              }`}
              onClick={() => handleVote(-1)}
              disabled={isPending}
            >
              <ArrowBigDown
                className={`w-5 h-5 ${optimisticState.userVote === -1 ? "fill-current" : ""}`}
              />
            </Button>

            <span className="text-muted-foreground mx-1">•</span>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </Button>

            {currentUserId && (
              <>
                <span className="text-muted-foreground mx-1">•</span>
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
          <div className="mt-4">
            {comment.children.map((child) => (
              <CommentThread
                key={child.id}
                comment={child}
                postId={postId}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
