"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

interface PostFormProps {
  initialData?: {
    title: string;
    content: string;
    tags?: {
      year?: string;
      make?: string;
      model?: string;
    };
  };
  onSubmit: (data: {
    title: string;
    content: string;
    tags: {
        year?: string;
        make?: string;
        model?: string;
    };
  }) => Promise<void>;
  isEditing?: boolean;
}

export function PostForm({ initialData, onSubmit, isEditing = false }: PostFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);

    try {
      await onSubmit({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        tags: {
          year: (formData.get("year") as string) || undefined,
          make: (formData.get("make") as string) || undefined,
          model: (formData.get("model") as string) || undefined,
        },
      });
    } catch (error) {
        // Error handling should be done by the parent or here if generic
       // But assuming parent handles the heavy lifting / redirects
       console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
        onSubmit={handleSubmit}
        className="space-y-6 border p-6 rounded-lg bg-card"
    >
        <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
            id="title"
            name="title"
            required
            placeholder="What's on your mind?"
            defaultValue={initialData?.title}
            />
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input 
                id="year" 
                name="year" 
                placeholder="2023" 
                defaultValue={initialData?.tags?.year}
            />
            </div>
            <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Input 
                id="make" 
                name="make" 
                placeholder="Toyota" 
                defaultValue={initialData?.tags?.make}
            />
            </div>
            <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input 
                id="model" 
                name="model" 
                placeholder="Camry" 
                defaultValue={initialData?.tags?.model}
            />
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
            defaultValue={initialData?.content}
            />
        </div>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending ? (isEditing ? "Updating..." : "Posting...") : (isEditing ? "Update Post" : "Create Post")}
            </Button>
        </div>
    </form>
  );
}
