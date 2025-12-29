"use server";

import { db } from "@/lib/db";
import { posts, postTags, tags, users } from "@/lib/db/schema";
import { tagSchema, validateTags } from "@/lib/forum-rules";
import { and, desc, eq, inArray, like, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPost(
  userId: string,
  data: {
    title: string;
    content: string;
    tags: {
      year?: string;
      make?: string;
      model?: string;
      trim?: string;
      drivetrain?: string;
      transmission?: string;
    };
  },
) {
  validateTags(data.tags);

  const [post] = await db
    .insert(posts)
    .values({
      userId,
      title: data.title,
      content: data.content,
    })
    .returning();

  // Handle Tags
  // This is a simplified version. In reality, we might need to find IDs for existing tags or create new ones if allowed.
  // Assuming tags must exist in DB for Year/Make/Model, or we find them by name.
  // For this implementation, we'll try to find existing tags by name/type and link them.

  const tagNames = Object.values(data.tags).filter(Boolean) as string[];

  if (tagNames.length > 0) {
    const foundTags = await db
      .select()
      .from(tags)
      .where(inArray(tags.name, tagNames));

    for (const tag of foundTags) {
      await db.insert(postTags).values({
        postId: post.id,
        tagId: tag.id,
      });
    }
  }

  revalidatePath("/forum");
  return post;
}

export async function getPosts(filters?: {
  make?: string[];
  year?: string[];
  model?: string[];
}) {
  // Basic implementation of filtering
  // This requires complex joins for proper filtering by multiple tags logic
  // For MVP, we fetch posts and their tags.

  // More efficient:
  /*
    SELECT p.*, count(t.id) as matched_tags 
    FROM posts p
    JOIN post_tags pt ON p.id = pt.post_id
    JOIN tags t ON pt.tag_id = t.id
    WHERE t.name IN (values)
    GROUP BY p.id
    HAVING count(t.id) = required_count
    */

  let query = db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt));

  // For now, return all posts and filter in memory or enhance query later for specific filters
  // A proper filter implementation needs dynamic query building

  return await query;
}
