import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VoteButtons } from './vote-buttons';

export function PostCard({ post, userVote, currentUserId, score }: { post: any; userVote?: number; currentUserId: string; score: number }) {
  // Mock data handling if relations aren't fully populated
  const author = post.author || { name: 'Unknown' };

  return (
    <Card className="flex flex-row overflow-hidden gap-0 py-0">
      <div className="p-3 w-14 bg-muted/20 border-r flex flex-col items-center justify-center">
        {/* We need current user ID for voting, passing generic placeholder for now */}
        <VoteButtons
          postId={post.id}
          initialScore={score}
          initialUserVote={userVote}
          userId={currentUserId}
          authorId={post.userId}
        />
      </div>
      <div className="flex-1">
        <CardHeader className="px-4 py-3 gap-1">
          <div className="flex items-center gap-1 mb-1">
            {/* Assuming post.tags is populated with the join */}
            {/* Placeholder tags for now if empty */}
            <Badge variant="outline">2023</Badge>
            <Badge variant="outline">Toyota</Badge>
          </div>
          <Link href={`/forum/${post.id}`} className="hover:underline">
            <CardTitle className="text-base leading-tight">{post.title}</CardTitle>
          </Link>
          <div className="text-xs text-muted-foreground">
            Posted by {author.name} • {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
        </CardContent>
      </div>
    </Card>
  );
}
