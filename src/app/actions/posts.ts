"use server";

import { db } from "@/lib/db";
import {
  posts,
  postTags,
  tags,
  users,
  votes,
  savedPosts,
  hiddenPosts,
  reports,
  comments,
} from "@/lib/db/schema";
import { tagSchema, validateTags } from "@/lib/forum-rules";
import { and, desc, eq, inArray, like, sql, notExists } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createPost(data: {
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
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
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
  const tagNames = Object.values(data.tags).filter(Boolean) as string[];

  if (tagNames.length > 0) {
    // 1. Get existing tags
    const existingTags = await db
      .select()
      .from(tags)
      .where(inArray(tags.name, tagNames));

    const existingTagNames = new Set(existingTags.map((t) => t.name));

    // 2. Identify missing tags
    const tagsToCreate: {
      name: string;
      type: "year" | "make" | "model" | "trim" | "drivetrain" | "transmission";
    }[] = [];

    Object.entries(data.tags).forEach(([key, value]) => {
      if (value && !existingTagNames.has(value)) {
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
        allTags.map((tag) => ({
          postId: post.id,
          tagId: tag.id,
        })),
      );
    }
  }

  revalidatePath("/");
  return post;
}

export async function getPosts(filters?: {
  make?: string[];
  year?: string[];
  model?: string[];
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user.id;
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

  const userVotes = alias(votes, "user_votes");
  const userSaved = alias(savedPosts, "user_saved");

  let query = db
    .select({
      post: posts,
      author: users,
      score: sql<number>`COALESCE(SUM(${votes.value}), 0)`.mapWith(Number),
      userVote: sql<number>`COALESCE((
        SELECT ${userVotes.value} 
        FROM ${votes} as user_votes
        WHERE ${userVotes.postId} = ${posts.id} 
        AND ${userVotes.userId} = ${currentUserId || "00000000-0000-0000-0000-000000000000"}
        LIMIT 1
      ), 0)`.mapWith(Number),
      commentCount: sql<number>`(
        SELECT count(*) 
        FROM ${comments} 
        WHERE ${comments.postId} = ${posts.id}
      )`.mapWith(Number),
      isSaved: sql<boolean>`CASE WHEN (
        SELECT count(*) 
        FROM ${savedPosts} as user_saved
        WHERE ${userSaved.postId} = ${posts.id} 
        AND ${userSaved.userId} = ${currentUserId || "00000000-0000-0000-0000-000000000000"}
      ) > 0 THEN true ELSE false END`.mapWith(Boolean),
      tags: sql<{ name: string; type: string }[]>`(
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'name', ${tags.name}, 
              'type', ${tags.type}
            )
          ), 
          '[]'::json
        )
        FROM ${postTags}
        INNER JOIN ${tags} ON ${postTags.tagId} = ${tags.id}
        WHERE ${postTags.postId} = ${posts.id}
      )`.mapWith((val: any) => val),
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(votes, eq(posts.id, votes.postId))
    .groupBy(posts.id, users.id)
    .orderBy(desc(posts.createdAt));

  if (validPostIds) {
    query.where(inArray(posts.id, validPostIds));
  }

  // Filter hidden posts
  if (currentUserId) {
    // This approach is a bit manual because we're not using a subquery in WHERE directly in the initial select
    // Or we could join hiddenPosts and filter where null
    query.leftJoin(
      hiddenPosts,
      and(
        eq(hiddenPosts.postId, posts.id),
        eq(hiddenPosts.userId, currentUserId),
      ),
    );
    // @ts-ignore - conflict with dynamic where
    query.where(and(query.config.where, sql`${hiddenPosts.postId} IS NULL`));
  }

  return await query;
}

export async function toggleSavePost(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const existing = await db.query.savedPosts.findFirst({
    where: and(
      eq(savedPosts.postId, postId),
      eq(savedPosts.userId, session.user.id),
    ),
  });

  if (existing) {
    await db
      .delete(savedPosts)
      .where(
        and(
          eq(savedPosts.postId, postId),
          eq(savedPosts.userId, session.user.id),
        ),
      );
    revalidatePath("/");
    return { saved: false };
  } else {
    await db.insert(savedPosts).values({
      postId,
      userId: session.user.id,
    });
    revalidatePath("/");
    return { saved: true };
  }
}

export async function hidePost(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Check if already hidden
  const existing = await db.query.hiddenPosts.findFirst({
    where: and(
      eq(hiddenPosts.postId, postId),
      eq(hiddenPosts.userId, session.user.id),
    ),
  });

  if (!existing) {
    await db.insert(hiddenPosts).values({
      postId,
      userId: session.user.id,
    });
    revalidatePath("/");
  }
}

export async function reportPost(postId: string, reason: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.insert(reports).values({
    postId,
    userId: session.user.id,
    reason,
  });
}

export async function deletePost(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Delete dependencies first if no cascade (Votes, Comments, PostTags)
  // Assuming cascade is not set up on DB level for everything or handled by ORM, let's play safe.
  // Actually, standard delete is fine if FKs are set to cascade.
  // Let's assume we need to clean up manualy or rely on DB.
  // For now, let's just try deleting the post. If it fails due to FK, we'll know.
  // In `schema.ts`, no `onDelete: cascade` is specified, so we likely need to delete related data.

  await db.delete(votes).where(eq(votes.postId, postId));
  await db.delete(comments).where(eq(comments.postId, postId));
  await db.delete(postTags).where(eq(postTags.postId, postId));
  await db.delete(savedPosts).where(eq(savedPosts.postId, postId));
  await db.delete(hiddenPosts).where(eq(hiddenPosts.postId, postId));
  await db.delete(reports).where(eq(reports.postId, postId));

  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath("/");
}

export async function updatePost(
  postId: string,
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  validateTags(data.tags);

  await db
    .update(posts)
    .set({
      title: data.title,
      content: data.content,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));

  // Handle Tags - This is a bit complex as we need to sync
  // Simplest strategy: Remove all tags for this post and re-add them.
  // Less efficient but robust for now.

  const tagNames = Object.values(data.tags).filter(Boolean) as string[];

  // 0. Clear existing post tags
  await db.delete(postTags).where(eq(postTags.postId, postId));

  if (tagNames.length > 0) {
    // 1. Get existing tags
    const existingTags = await db
      .select()
      .from(tags)
      .where(inArray(tags.name, tagNames));

    const existingTagNames = new Set(existingTags.map((t) => t.name));

    // 2. Identify missing tags
    const tagsToCreate: {
      name: string;
      type: "year" | "make" | "model" | "trim" | "drivetrain" | "transmission";
    }[] = [];

    Object.entries(data.tags).forEach(([key, value]) => {
      if (value && !existingTagNames.has(value)) {
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
        allTags.map((tag) => ({
          postId: postId,
          tagId: tag.id,
        })),
      );
    }
  }

  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
  return { success: true };
}
