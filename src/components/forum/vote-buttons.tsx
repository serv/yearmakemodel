"use client";

import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { votePost } from "@/app/actions/votes";
import { ArrowBigUp, ArrowBigDown } from "lucide-react"; // Assuming lucide-react is installed with shadcn usually, or we use text

type VoteProps = {
  postId: string;
  initialScore: number;
  initialUserVote?: number; // 1, -1, or 0/undefined
  userId: string;
  authorId: string;
};

export function VoteButtons({
  postId,
  initialScore,
  initialUserVote,
  userId,
  authorId,
}: VoteProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(
    { score: initialScore, userVote: initialUserVote || 0 },
    (state, newVote: number) => {
      let newScore = state.score;
      if (state.userVote === newVote) {
        // Toggle off
        newScore -= newVote;
        return { score: newScore, userVote: 0 };
      } else {
        // Change vote
        if (state.userVote !== 0) {
          newScore -= state.userVote;
        }
        newScore += newVote;
        return { score: newScore, userVote: newVote };
      }
    },
  );

  const handleVote = (value: number) => {
    if (!userId) return alert("Login to vote");

    startTransition(async () => {
      setOptimisticState(value);
      await votePost(postId, value, authorId);
    });
  };

  return (
    <div className="flex flex-col items-center gap-1 bg-muted/30 p-2 rounded-lg">
      <Button
        variant={optimisticState.userVote === 1 ? "default" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0 rounded-full"
        onClick={() => handleVote(1)}
        disabled={isPending}
      >
        ▲
      </Button>
      <span className="font-bold text-sm">{optimisticState.score}</span>
      <Button
        variant={optimisticState.userVote === -1 ? "destructive" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0 rounded-full"
        onClick={() => handleVote(-1)}
        disabled={isPending}
      >
        ▼
      </Button>
    </div>
  );
}
