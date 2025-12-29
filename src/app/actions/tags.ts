"use server";

import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { MODELS } from "@/lib/constants";

export async function getUniqueTagValues(type: "year" | "make" | "model") {
  const results = await db
    .select({ name: tags.name })
    .from(tags)
    .where(eq(tags.type, type))
    .orderBy(type === "year" ? desc(tags.name) : asc(tags.name));

  // Use Set to ensure uniqueness, though seed data should be unique per type usually
  const uniqueNames = Array.from(new Set(results.map((r) => r.name)));

  return uniqueNames;
}

export async function getMakeModelMap() {
  return MODELS;
}
