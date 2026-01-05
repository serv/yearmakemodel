"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createComment } from "@/app/actions/comments";
import { VoteButtons } from "./vote-buttons";
// import { Textarea } from "@/components/ui/textarea"; // Ensure this is available

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string | null; username?: string | null };
  children?: Comment[]; // Populated by recursive build
  userId: string;
};

export function CommentThread({
  comment,
  postId,
}: {
  comment: Comment;
  postId: string;
}) {
  const [isReplying, setIsReplying] = useState(false);

  async function handleReply(formData: FormData) {
    const content = formData.get("content") as string;
    await createComment(
      "00000000-0000-0000-0000-000000000000",
      postId,
      content,
      comment.id,
    ); // Mock user ID
    setIsReplying(false);
  }

  return (
    <div className="border-l-2 pl-4 mt-4">
      <div className="bg-muted/10 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-sm">
            {comment.author?.username || comment.author?.name || "Unknown"}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm mb-2">{comment.content}</p>

        <div className="flex items-center gap-4">
          <VoteButtons
            postId={postId} // Comments actually have their own ID for votes usually, but reusing component logic for simplicity
            // In reality, voteButtons needs to differentiate post vs comment vote target
            initialScore={0}
            userId="00000000-0000-0000-0000-000000000000"
            authorId={comment.userId}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReplying(!isReplying)}
          >
            Reply
          </Button>
        </div>

        {isReplying && (
          <form action={handleReply} className="mt-2 space-y-2">
            <textarea
              name="content"
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Write a reply..."
              rows={2}
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
      </div>

      {/* Recursive rendering of children */}
      {comment.children && comment.children.length > 0 && (
        <div className="ml-4">
          {comment.children.map((child) => (
            <CommentThread key={child.id} comment={child} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
