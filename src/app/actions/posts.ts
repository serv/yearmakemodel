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
    // 1. Get existing tags
    const existingTags = await db
      .select()
      .from(tags)
      .where(inArray(tags.name, tagNames));
    
    const existingTagNames = new Set(existingTags.map(t => t.name));
    
    // 2. Identify missing tags
    const tagsToCreate: { name: string; type: "year" | "make" | "model" | "trim" | "drivetrain" | "transmission" }[] = [];
    
    Object.entries(data.tags).forEach(([key, value]) => {
      if (value && !existingTagNames.has(value)) {
        // Warning: This assumes values are unique across types or we don't care about type mismatch for same name for now.
        // Actually, schema has unique (name, type).
        // If "2023" is year, it's fine.
        tagsToCreate.push({ name: value, type: key as any });
      }
    });

    // 3. Create missing tags
    let newTags: typeof existingTags = [];
    if (tagsToCreate.length > 0) {
      newTags = await db.insert(tags).values(tagsToCreate).returning();
    }

    // 4. Link all tags
    const allTags = [...existingTags, ...newTags];
    
    if (allTags.length > 0) {
      await db.insert(postTags).values(
        allTags.map(tag => ({
          postId: post.id,
          tagId: tag.id,
        }))
      );
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
  const conditions = [];

  if (filters?.make && filters.make.length > 0) {
    const makeIds = await db
      .select({ postId: postTags.postId })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(and(eq(tags.type, "make"), inArray(tags.name, filters.make)));
    conditions.push(makeIds.map((r) => r.postId));
  }

  if (filters?.model && filters.model.length > 0) {
    const modelIds = await db
      .select({ postId: postTags.postId })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(and(eq(tags.type, "model"), inArray(tags.name, filters.model)));
    conditions.push(modelIds.map((r) => r.postId));
  }

  if (filters?.year && filters.year.length > 0) {
    const yearIds = await db
      .select({ postId: postTags.postId })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(and(eq(tags.type, "year"), inArray(tags.name, filters.year)));
    conditions.push(yearIds.map((r) => r.postId));
  }

  let validPostIds: string[] | undefined;
  
  if (conditions.length > 0) {
    // Intersect
    validPostIds = conditions.reduce((a, b) => a.filter((c) => b.includes(c)));
    
    // If intersection is empty, return empty array immediately
    if (validPostIds.length === 0) {
        return [];
    }
  }

  let query = db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt));

  if (validPostIds) {
    query.where(inArray(posts.id, validPostIds));
  }

  return await query;
}
