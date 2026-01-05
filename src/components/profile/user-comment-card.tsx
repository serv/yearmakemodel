import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface UserCommentCardProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    postId: string;
  };
  post: {
    id: string;
    title: string;
  };
  author: {
    name: string;
    username?: string | null;
  };
}

export function UserCommentCard({ comment, post, author }: UserCommentCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="p-4 pb-2 space-y-1">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          <span>{author.username || author.name} commented on</span>
          <Link 
            href={`/post/${post.id}`} 
            className="font-medium text-foreground hover:underline truncate max-w-[300px]"
          >
            {post.title}
          </Link>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Link href={`/post/${post.id}#comment-${comment.id}`} className="block group">
          <div className="bg-muted/50 p-3 rounded-md text-sm group-hover:bg-muted transition-colors">
            {comment.content}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
