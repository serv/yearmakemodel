'use client';

import { useRouter } from 'next/navigation';
import { PostForm } from '@/components/forum/post-form';
import { createPost } from '@/app/actions/posts';

interface NewPostClientProps {
  makes: string[];
  models: Record<string, string[]>;
}

export function NewPostClient({ makes, models }: NewPostClientProps) {
  const router = useRouter();

  async function handleCreate(data: any) {
    try {
      await createPost(data);
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('Failed to create post: ' + (error as Error).message);
    }
  }

  return <PostForm onSubmit={handleCreate} makes={makes} models={models} />;
}
