"use server";

import { db } from "@/lib/db";
import {
  comments,
  savedComments,
  hiddenComments,
  reports,
} from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function createComment(
  userId: string,
  postId: string,
  content: string,
  parentId?: string,
) {
  await db.insert(comments).values({
    userId,
    postId,
    content,
    parentId,
  });

  revalidatePath(`/post/${postId}`);
}

export async function toggleSaveComment(commentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Check if already saved
  const existing = await db
    .select()
    .from(savedComments)
    .where(
      and(
        eq(savedComments.userId, userId),
        eq(savedComments.commentId, commentId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    // Unsave
    await db
      .delete(savedComments)
      .where(
        and(
          eq(savedComments.userId, userId),
          eq(savedComments.commentId, commentId),
        ),
      );
    return { saved: false };
  } else {
    // Save
    await db.insert(savedComments).values({
      userId,
      commentId,
    });
    return { saved: true };
  }
}

export async function hideComment(commentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  await db.insert(hiddenComments).values({
    userId,
    commentId,
  });

  // Get the comment to find the postId for revalidation
  const comment = await db
    .select({ postId: comments.postId })
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (comment[0]) {
    revalidatePath(`/post/${comment[0].postId}`);
  }
}

export async function unhideComment(commentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  await db
    .delete(hiddenComments)
    .where(
      and(
        eq(hiddenComments.userId, userId),
        eq(hiddenComments.commentId, commentId),
      ),
    );

  // Get the comment to find the postId for revalidation
  const comment = await db
    .select({ postId: comments.postId })
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (comment[0]) {
    revalidatePath(`/post/${comment[0].postId}`);
  }
}

export async function reportComment(commentId: string, reason: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  await db.insert(reports).values({
    userId,
    commentId,
    reason,
  });
}

export async function deleteComment(commentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Verify ownership
  const comment = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment[0]) {
    throw new Error("Comment not found");
  }

  if (comment[0].userId !== userId) {
    throw new Error("Unauthorized");
  }

  const postId = comment[0].postId;

  // Delete the comment
  await db.delete(comments).where(eq(comments.id, commentId));

  revalidatePath(`/post/${postId}`);
}

export async function updateComment(commentId: string, content: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Verify ownership
  const comment = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment[0]) {
    throw new Error("Comment not found");
  }

  if (comment[0].userId !== userId) {
    throw new Error("Unauthorized");
  }

  const postId = comment[0].postId;

  // Update the comment
  await db
    .update(comments)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId));

  revalidatePath(`/post/${postId}`);
}
