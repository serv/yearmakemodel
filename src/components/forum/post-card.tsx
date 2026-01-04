"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "./vote-buttons";
import { PostActions } from "./post-actions";
import { MessageSquare, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";


export function PostCard({
  post,
  userVote,
  currentUserId,
  score,
  commentCount,
  isSaved,
}: {
  post: any;
  userVote?: number;
  currentUserId: string;
  score: number;
  commentCount: number;
  isSaved: boolean;
}) {
  const author = post.author || { name: "Unknown" };
  const isAuthor = currentUserId === post.userId;

  return (
    <Card className="flex flex-row overflow-hidden gap-0 py-0 relative group">
      {/* Dropdown Menu (Top Right) */}
      <PostActions
        postId={post.id}
        currentUserId={currentUserId}
        isAuthor={isAuthor}
        isSaved={isSaved}
        className="absolute top-2 right-2"
      />

      <div className="p-3 w-14 bg-muted/20 border-r flex flex-col items-center justify-start pt-4">
        <VoteButtons
          postId={post.id}
          initialScore={score}
          initialUserVote={userVote}
          userId={currentUserId}
          authorId={post.userId}
        />
      </div>
      <div className="flex-1 p-0 flex flex-col">
        <CardHeader className="px-4 py-3 gap-1 pb-2">
          <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
            {/* Logic for tags can be improved later */}
            <span className="font-semibold text-foreground">{author.name}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <Link
            href={`/post/${post.id}`}
            className="hover:underline block w-fit"
          >
            <CardTitle className="text-lg leading-tight">
              {post.title}
            </CardTitle>
          </Link>
          <div className="flex gap-1 mt-1">
            <Badge variant="secondary" className="text-xs font-normal">
              2023
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal">
              Toyota
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-1 pb-2 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {post.content}
          </p>
        </CardContent>
        <CardFooter className="px-4 py-2 border-t bg-muted/5 flex items-center gap-4">
          <Link
            href={`/post/${post.id}#comments`}
            className="text-xs text-muted-foreground hover:bg-muted p-1.5 rounded-sm flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            {commentCount} Comments
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1.5 text-xs text-muted-foreground gap-1.5"
            onClick={() =>
              navigator
                .share({ url: window.location.origin + `/post/${post.id}` })
                .catch(() => {})
            }
          >
            <LinkIcon className="h-4 w-4" />
            Share
          </Button>
          {/* Save button shortcut can go here too if desired */}
        </CardFooter>
      </div>
    </Card>
  );
}

