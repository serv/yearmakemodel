import { db } from "@/lib/db";
import { posts, tags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PostForm } from "@/components/forum/post-form";
import { updatePost } from "@/app/actions/posts";

export default async function EditPostPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const userId = session.user.id; // Corrected: session.user is correct type

  // Fetch Post with Tags
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!post) notFound();

  // Verify ownership
  if (post.userId !== userId) {
    redirect("/"); // Or show an error page
  }

  // Transform data for form
  // PostForm expects: { title, content, tags: { year, make, model } }
  // Our fetched tags are in array format. We need to map them back to keys if possible.
  // The PostForm expects simplistic tags (year, make, model).
  // Ideally we should make PostForm smarter or map types here.
  // Let's inspect tags.
  
  const formTags = {
    year: post.tags.find((pt) => pt.tag.type === "year")?.tag.name,
    make: post.tags.find((pt) => pt.tag.type === "make")?.tag.name,
    model: post.tags.find((pt) => pt.tag.type === "model")?.tag.name,
  };

  async function handleUpdate(data: any) {
    "use server";
    await updatePost(id, data);
    redirect(`/post/${id}`);
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      <PostForm 
        initialData={{
            title: post.title,
            content: post.content,
            tags: formTags
        }}
        onSubmit={handleUpdate} 
        isEditing={true}
      />
    </div>
  );
}
