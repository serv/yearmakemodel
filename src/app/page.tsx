import { TagFilter } from "@/components/forum/tag-filter";
import { PostCard } from "@/components/forum/post-card";
import { getPosts } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter as FilterIcon, Plus } from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const year = params.year as string | undefined;
  const make = params.make as string | undefined;
  const model = params.model as string | undefined;

  const { MAKES, MODELS, YEARS } = await import("@/lib/constants");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [posts] = await Promise.all([
    getPosts({
      year: year && year !== "all" ? [year] : undefined,
      make: make && make !== "all" ? [make] : undefined,
      model: model && model !== "all" ? [model] : undefined,
    }),
  ]);

  // Use constants for filters
  const allModels = Object.values(MODELS).flat().sort();

  const filterContent = (
    <>
      <TagFilter
        availableYears={YEARS}
        availableMakes={MAKES}
        availableModels={allModels}
        makeModelMap={MODELS}
      />
      <div className="mt-4">
        <Link href="/new">
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:block md:col-span-3">
        <Suspense fallback={<div>Loading filters...</div>}>
          {filterContent}
        </Suspense>
      </aside>

      {/* Main Content */}
      <main className="md:col-span-9 space-y-4">
        {/* Mobile Header with Filters Toggle */}
        <div className="flex flex-col gap-2 md:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-xl font-bold">
                {year || "Any Year"} {make || "Any Make"} {model || "Any Model"}
                </h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <FilterIcon className="h-4 w-4" />
                            Filters
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px]">
                        <SheetHeader>
                            <SheetTitle className="text-left">Filters</SheetTitle>
                        </SheetHeader>
                        <div className="py-6">
                            <Suspense fallback={<div>Loading filters...</div>}>
                                {filterContent}
                            </Suspense>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="h-px bg-border" />
        </div>

        {/* Desktop Title */}
        <h1 className="hidden md:block text-2xl font-bold mb-2">
          Viewing: {year || "Any Year"} {make || "Any Make"}{" "}
          {model || "Any Model"}
        </h1>

        <div className="grid gap-4">
          {posts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
              No posts found with these tags. Be the first to post!
            </div>
          ) : (
            posts.map((wrapper: any) => (
              <PostCard
                key={wrapper.post.id}
                post={{ ...wrapper.post, author: wrapper.author }}
                currentUserId={session?.user.id || ""}
                userVote={wrapper.userVote}
                score={wrapper.score}
                commentCount={wrapper.commentCount}
                isSaved={wrapper.isSaved}
                tags={wrapper.tags}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
