import { db } from "./db";
import { users } from "./db/schema";
import { eq, sql } from "drizzle-orm";

export async function updateUserKarma(userId: string, change: number) {
  await db
    .update(users)
    .set({
      karma: sql`${users.karma} + ${change}`,
    })
    .where(eq(users.id, userId));
}
