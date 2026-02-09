"use client";
import * as React from "react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { VoteButtons } from "./vote-buttons";
import { PostActions } from "./post-actions";

export function PostCard({
  post,
  userVote,
  currentUserId,
  score,
  commentCount,
  isSaved,
  isHidden,
  tags,
}: {
  post: any;
  userVote?: number;
  currentUserId: string;
  score: number;
  commentCount: number;
  isSaved: boolean;
  isHidden?: boolean;
  tags?: { name: string; type: string }[];
}) {
  const author = post.author || { name: "Unknown" };
  const isAuthor = currentUserId === post.userId;

  const yearTag = tags?.find((t) => t.type === "year");
  const makeTag = tags?.find((t) => t.type === "make");
  const modelTag = tags?.find((t) => t.type === "model");

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const formattedDate = mounted 
    ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';

  return (
    <Card className="flex flex-row overflow-hidden gap-0 py-0 relative group min-h-[140px]">
      {/* Dropdown Menu (Top Right) */}
      <PostActions
        postId={post.id}
        currentUserId={currentUserId}
        isAuthor={isAuthor}
        isSaved={isSaved}
        isHidden={isHidden}
        className="absolute top-2 right-1 sm:right-2"
      />

      <div className="p-2 sm:p-3 w-10 sm:w-14 bg-muted/20 border-r flex flex-col items-center justify-start pt-4 sm:pt-4">
        <VoteButtons
          postId={post.id}
          initialScore={score}
          initialUserVote={userVote}
          userId={currentUserId}
          authorId={post.userId}
        />
      </div>
      <div className="flex-1 p-0 flex flex-col min-w-0">
        <CardHeader className="px-3 sm:px-4 py-2 sm:py-3 gap-0.5 sm:gap-1 pb-1 sm:pb-2">
          <div className="flex items-center gap-1 mb-1 text-[10px] sm:text-xs text-muted-foreground truncate">
            <span className="font-semibold text-foreground truncate max-w-[100px] sm:max-w-none">
                {author.username || author.name}
            </span>
            <span>•</span>
            <span className="shrink-0">{formattedDate}</span>
          </div>
          <Link
            href={`/post/${post.id}`}
            className="hover:underline block w-full truncate"
          >
            <CardTitle className="text-base sm:text-lg leading-tight truncate">
              {post.title}
            </CardTitle>
          </Link>
          <div className="flex flex-wrap gap-1 mt-1">
            {yearTag && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal px-1.5 py-0">
                {yearTag.name}
              </Badge>
            )}
            {makeTag && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal px-1.5 py-0">
                {makeTag.name}
              </Badge>
            )}
            {modelTag && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal px-1.5 py-0">
                {modelTag.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 py-1 pb-1 sm:pb-2 flex-grow">
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {post.content}
          </p>
        </CardContent>
        <CardFooter className="px-3 sm:px-4 py-1.5 sm:py-2 border-t bg-muted/5 flex items-center gap-2 sm:gap-4">
          <Link
            href={`/post/${post.id}#comments`}
            className="text-[10px] sm:text-xs text-muted-foreground hover:bg-muted p-1 sm:p-1.5 rounded-sm flex items-center gap-1 sm:gap-1.5 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {commentCount} <span className="hidden xs:inline">Comments</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 sm:p-1.5 text-[10px] sm:text-xs text-muted-foreground gap-1 sm:gap-1.5"
            onClick={() =>
              navigator
                .share({ url: window.location.origin + `/post/${post.id}` })
                .catch(() => {})
            }
          >
            <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Share
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
