"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

/**
 * Check if the current user has a username set.
 * If not, redirect to the username onboarding page.
 * Call this in pages that require a username.
 */
export async function requireUsername() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      username: true,
    },
  });

  if (!user?.username) {
    redirect("/onboarding/username");
  }

  return session;
}
