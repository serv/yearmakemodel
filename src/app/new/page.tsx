"use client";

import { createPost } from "@/app/actions/posts";
import { useRouter } from "next/navigation";
import { PostForm } from "@/components/forum/post-form";

export default function NewPostPage() {
  const router = useRouter();

  async function handleCreate(data: any) {
    try {
      await createPost(data);
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Failed to create post: " + (error as Error).message);
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <PostForm onSubmit={handleCreate} />
    </div>
  );
}
