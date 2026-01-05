"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Username validation regex: alphanumeric and underscores only, 4-24 characters
const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,24}$/;

export async function checkUsernameAvailability(username: string) {
  // Validate format
  if (!USERNAME_REGEX.test(username)) {
    return {
      available: false,
      error: "Username must be 4-24 characters and contain only letters, numbers, and underscores",
    };
  }

  // Check if username exists (case-insensitive)
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`LOWER(${users.username}) = LOWER(${username})`)
    .limit(1);

  return {
    available: existingUser.length === 0,
    error: existingUser.length > 0 ? "Username is already taken" : null,
  };
}

export async function saveUsername(username: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate format
  if (!USERNAME_REGEX.test(username)) {
    return {
      success: false,
      error: "Username must be 4-24 characters and contain only letters, numbers, and underscores",
    };
  }

  // Check availability again (double-check to prevent race conditions)
  const availabilityCheck = await checkUsernameAvailability(username);
  if (!availabilityCheck.available) {
    return {
      success: false,
      error: availabilityCheck.error || "Username is not available",
    };
  }

  try {
    // Update user with username
    await db
      .update(users)
      .set({ username, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error saving username:", error);
    return { success: false, error: "Failed to save username" };
  }
}
