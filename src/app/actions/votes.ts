"use server";

import { db } from "@/lib/db";
import { votes, users } from "@/lib/db/schema";
import { updateUserKarma } from "@/lib/karma";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function votePost(
  postId: string,
  value: number,
  authorId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!session?.user?.id) {
    throw new Error("Unauthorized: User not found in session");
  }

  const userId = session.user.id;
  if (value !== 1 && value !== -1) return;

  try {
    // Check existing vote
    const existingVote = await db.query.votes.findFirst({
      where: and(eq(votes.userId, userId), eq(votes.postId, postId)),
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote (toggle)
        await db.delete(votes).where(eq(votes.id, existingVote.id));
        await updateUserKarma(authorId, -value);
      } else {
        // Change vote
        await db
          .update(votes)
          .set({ value })
          .where(eq(votes.id, existingVote.id));
        await updateUserKarma(authorId, value * 2); // Reverse previous and apply new
      }
    } else {
      // New vote
      await db.insert(votes).values({
        userId,
        postId,
        value,
      });
      await updateUserKarma(authorId, value);
    }
  } catch (error) {
    console.error("Failed to vote:", error);
    throw new Error("Failed to vote");
  }

  revalidatePath(`/forum`);
  revalidatePath(`/forum/${postId}`);
}
