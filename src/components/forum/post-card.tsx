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

export function PostCard({ post, userVote }: { post: any; userVote?: number }) {
  // Mock data handling if relations aren't fully populated
  const tags = post.tags || [];
  const author = post.author || { name: "Unknown" };

  return (
    <Card className="flex flex-row overflow-hidden">
      <div className="p-4 bg-muted/20 border-r flex flex-col justify-center">
        {/* We need current user ID for voting, passing generic placeholder for now */}
        <VoteButtons
          postId={post.id}
          initialScore={0} // TODO: fetch actual score
          initialUserVote={userVote}
          userId={"00000000-0000-0000-0000-000000000000"} // TODO: Get from session
          authorId={post.userId}
        />
      </div>
      <div className="flex-1">
        <CardHeader>
          <div className="flex gap-2 mb-2">
            {/* Assuming post.tags is populated with the join */}
            {/* Placeholder tags for now if empty */}
            <Badge variant="secondary">2023</Badge>
            <Badge variant="secondary">Toyota</Badge>
          </div>
          <Link href={`/forum/${post.id}`} className="hover:underline">
            <CardTitle>{post.title}</CardTitle>
          </Link>
          <div className="text-xs text-muted-foreground">
            Posted by {author.name} •{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.content}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
