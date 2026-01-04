"use server";

import { db } from "@/lib/db";
import {
  posts,
  comments,
  users,
  votes,
  savedPosts,
  hiddenPosts,
  postTags,
  tags,
} from "@/lib/db/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { alias } from "drizzle-orm/pg-core";

export async function getUserProfile(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user;
}

export async function getUserPosts(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user.id;

  const userVotes = alias(votes, "user_votes");
  const userSaved = alias(savedPosts, "user_saved");
  const userHidden = alias(hiddenPosts, "user_hidden");

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
      isHidden: sql<boolean>`CASE WHEN (
        SELECT count(*)
        FROM ${hiddenPosts} as user_hidden
        WHERE ${userHidden.postId} = ${posts.id} 
        AND ${userHidden.userId} = ${currentUserId || "00000000-0000-0000-0000-000000000000"}
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
    .where(eq(posts.userId, userId))
    .groupBy(posts.id, users.id)
    .orderBy(desc(posts.createdAt));

  return await query;
}

export async function getUserComments(userId: string) {
  // We need to fetch comments and also enough post info to show context
  const userComments = await db
    .select({
      comment: comments,
      post: posts,
      author: users, // Post author, not comment author (who is known)
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(comments.userId, userId))
    .orderBy(desc(comments.createdAt));

  return userComments;
}

export async function getUserSavedPosts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return [];

  const currentUserId = session.user.id;

  const userVotes = alias(votes, "user_votes");
  const userSaved = alias(savedPosts, "user_saved");
  const userHidden = alias(hiddenPosts, "user_hidden");

  // Join savedPosts -> posts
  let query = db
    .select({
      post: posts,
      author: users,
      score: sql<number>`COALESCE(SUM(${votes.value}), 0)`.mapWith(Number),
      userVote: sql<number>`COALESCE((
        SELECT ${userVotes.value} 
        FROM ${votes} as user_votes
        WHERE ${userVotes.postId} = ${posts.id} 
        AND ${userVotes.userId} = ${currentUserId}
        LIMIT 1
      ), 0)`.mapWith(Number),
      commentCount: sql<number>`(
        SELECT count(*) 
        FROM ${comments} 
        WHERE ${comments.postId} = ${posts.id}
      )`.mapWith(Number),
      isSaved: sql<boolean>`true`.mapWith(Boolean), // By definition true
      isHidden: sql<boolean>`CASE WHEN (
        SELECT count(*)
        FROM ${hiddenPosts} as user_hidden
        WHERE ${userHidden.postId} = ${posts.id} 
        AND ${userHidden.userId} = ${currentUserId}
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
    .from(savedPosts)
    .innerJoin(posts, eq(savedPosts.postId, posts.id))
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(votes, eq(posts.id, votes.postId))
    .where(eq(savedPosts.userId, currentUserId))
    .groupBy(posts.id, users.id, savedPosts.createdAt) // group by savedPosts.createdAt for ordering?
    .orderBy(desc(savedPosts.createdAt));

  return await query;
}

export async function getUserHiddenPosts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return [];

  const currentUserId = session.user.id;
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
        AND ${userVotes.userId} = ${currentUserId}
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
        AND ${userSaved.userId} = ${currentUserId}
      ) > 0 THEN true ELSE false END`.mapWith(Boolean),
      isHidden: sql<boolean>`true`.mapWith(Boolean), // By definition true
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
    .from(hiddenPosts)
    .innerJoin(posts, eq(hiddenPosts.postId, posts.id))
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(votes, eq(posts.id, votes.postId))
    .where(eq(hiddenPosts.userId, currentUserId))
    .groupBy(posts.id, users.id, hiddenPosts.createdAt)
    .orderBy(desc(hiddenPosts.createdAt));

  return await query;
}
