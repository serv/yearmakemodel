import { TagFilter } from "@/components/forum/tag-filter";
import { PostCard } from "@/components/forum/post-card";
import { getPosts } from "@/app/actions/posts";
import { getUniqueTagValues, getMakeModelMap } from "@/app/actions/tags";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const year = params.year as string | undefined;
  const make = params.make as string | undefined;
  const model = params.model as string | undefined;

  const [posts, years, makes, models, makeModelMap] = await Promise.all([
    getPosts(),
    getUniqueTagValues("year"),
    getUniqueTagValues("make"),
    getUniqueTagValues("model"),
    getMakeModelMap(),
  ]);

  return (
    <div className="container mx-auto py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className="md:col-span-3">
        <Suspense fallback={<div>Loading filters...</div>}>
          <TagFilter
            availableYears={years}
            availableMakes={makes}
            availableModels={models}
            makeModelMap={makeModelMap}
          />
        </Suspense>
        <div className="mt-4">
          <Link href="/forum/new">
            <Button className="w-full">Create New Post</Button>
          </Link>
        </div>
      </aside>

      <main className="md:col-span-9 space-y-4">
        <h1 className="text-2xl font-bold mb-4">
          Viewing: {year || "Any Year"} {make || "Any Make"}{" "}
          {model || "Any Model"}
        </h1>

        {posts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No posts found with these tags. Be the first to post!
          </div>
        ) : (
          posts.map((wrapper: any) => (
            <PostCard
              key={wrapper.post.id}
              post={{ ...wrapper.post, author: wrapper.author }}
            />
          ))
        )}
      </main>
    </div>
  );
}
