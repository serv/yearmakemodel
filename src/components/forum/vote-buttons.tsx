"use client";

import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { votePost, voteComment } from "@/app/actions/votes";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";

type VoteProps = {
  postId?: string;
  commentId?: string;
  initialScore: number;
  initialUserVote?: number; // 1, -1, or 0
  userId: string;
  authorId: string;
  variant?: "vertical" | "horizontal";
  className?: string;
};

export function VoteButtons({
  postId,
  commentId,
  initialScore,
  initialUserVote = 0,
  userId,
  authorId,
  variant = "vertical",
  className,
}: VoteProps) {
  const [isPending, startTransition] = useTransition();

  const [optimisticState, setOptimisticState] = useOptimistic(
    { score: initialScore, userVote: initialUserVote },
    (state, newVote: number) => {
      const oldVote = state.userVote;
      if (oldVote === newVote) {
        // Toggle off
        return { score: state.score - newVote, userVote: 0 };
      } else {
        // Change vote
        return {
          score: state.score - oldVote + newVote,
          userVote: newVote,
        };
      }
    },
  );

  const handleVote = (value: number) => {
    if (!userId) return alert("Login to vote");
    if (isPending) return;

    startTransition(async () => {
      setOptimisticState(value);
      try {
        if (postId && !commentId) {
          await votePost(postId, value, authorId);
        } else if (commentId && postId) {
          await voteComment(commentId, value, authorId, postId);
        }
      } catch (error) {
        console.error("Failed to vote:", error);
        // Error handling: The UI will automatically revert when the transition ends 
        // because we're using useOptimistic correctly linked to the server action.
      }
    });
  };

  const isUpvoted = optimisticState.userVote === 1;
  const isDownvoted = optimisticState.userVote === -1;

  if (variant === "horizontal") {
    return (
      <div className={cn("flex items-center gap-0.5 sm:gap-1", className)}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-1 hover:bg-transparent transition-colors",
            isUpvoted ? "text-orange-600 dark:text-orange-500" : "text-muted-foreground hover:text-orange-500"
          )}
          onClick={() => handleVote(1)}
          disabled={isPending}
        >
          <ArrowBigUp
            className={cn("w-4 h-4 sm:w-5 sm:h-5", isUpvoted && "fill-current")}
          />
        </Button>

        <span
          className={cn(
            "min-w-[16px] sm:min-w-[20px] text-center text-[10px] sm:text-xs font-bold",
            isUpvoted ? "text-orange-600 dark:text-orange-500" : isDownvoted ? "text-blue-600 dark:text-blue-500" : "text-muted-foreground"
          )}
        >
          {optimisticState.score}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-1 hover:bg-transparent transition-colors",
            isDownvoted ? "text-blue-600 dark:text-blue-500" : "text-muted-foreground hover:text-blue-500"
          )}
          onClick={() => handleVote(-1)}
          disabled={isPending}
        >
          <ArrowBigDown
            className={cn("w-4 h-4 sm:w-5 sm:h-5", isDownvoted && "fill-current")}
          />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-1 bg-muted/50 p-1 rounded-xl border shadow-sm", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0 rounded-lg hover:bg-background transition-colors",
          isUpvoted ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "text-muted-foreground"
        )}
        onClick={() => handleVote(1)}
        disabled={isPending}
      >
        <ArrowBigUp
          className={cn("w-6 h-6", isUpvoted && "fill-current")}
        />
      </Button>
      <span
        className={cn(
          "font-bold text-sm",
          isUpvoted ? "text-green-600 dark:text-green-400" : isDownvoted ? "text-red-600 dark:text-red-400" : "text-foreground"
        )}
      >
        {optimisticState.score}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0 rounded-lg hover:bg-background transition-colors",
          isDownvoted ? "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" : "text-muted-foreground"
        )}
        onClick={() => handleVote(-1)}
        disabled={isPending}
      >
        <ArrowBigDown
          className={cn("w-6 h-6", isDownvoted && "fill-current")}
        />
      </Button>
    </div>
  );
}
