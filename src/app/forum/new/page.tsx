"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/app/actions/posts";
import { useRouter } from "next/navigation";



export default function NewPostPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);

    try {
      await createPost({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        tags: {
          year: (formData.get("year") as string) || undefined,
          make: (formData.get("make") as string) || undefined,
          model: (formData.get("model") as string) || undefined,
        },
      });
      router.push("/forum");
    } catch (error) {
      console.error(error);
      alert("Failed to create post: " + (error as Error).message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-6 border p-6 rounded-lg bg-card"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="What's on your mind?"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" placeholder="2023" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Input id="make" name="make" placeholder="Toyota" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" placeholder="Camry" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Note: If you provide Year and Model, Make is required.
        </p>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            name="content"
            required
            placeholder="Share your thoughts..."
            rows={8}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Posting..." : "Create Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
