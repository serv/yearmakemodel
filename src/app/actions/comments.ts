'use server';

import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function createComment(userId: string, postId: string, content: string, parentId?: string) {
    await db.insert(comments).values({
        userId,
        postId,
        content,
        parentId
    });
    
    revalidatePath(`/forum/${postId}`);
}
