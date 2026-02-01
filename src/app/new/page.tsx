import { createPost } from '@/app/actions/posts';
import { getMakes, getMakeModelMap } from '@/lib/makes';
import { NewPostClient } from './new-post-client';

export default async function NewPostPage() {
  const makes = getMakes();
  const makesMap = getMakeModelMap();

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <NewPostClient makes={makes} models={makesMap} />
    </div>
  );
}
