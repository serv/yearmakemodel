import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  uniqueIndex,
  index,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const tagTypeEnum = pgEnum("tag_type", [
  "year",
  "make",
  "model",
  "trim",
  "drivetrain",
  "transmission",
]);

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  karma: integer("karma").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
  cars: many(cars),
}));

// Posts
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  tags: many(postTags),
  votes: many(votes),
}));

// Comments
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .references(() => posts.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  parentId: uuid("parent_id"), // For nested comments
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "nested_comments",
  }),
  children: many(comments, {
    relationName: "nested_comments",
  }),
}));

// Tags
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(), // e.g., "2023", "Toyota", "Camry"
    type: tagTypeEnum("type").notNull(),
  },
  (t) => ({
    nameIdx: index("tag_name_idx").on(t.name),
    typeIdx: index("tag_type_idx").on(t.type),
    uniqueNameType: uniqueIndex("unique_name_type").on(t.name, t.type),
  }),
);

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}));

// Post Tags (Many-to-Many)
export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .references(() => posts.id)
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id)
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  }),
);

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

// Votes
export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    postId: uuid("post_id").references(() => posts.id),
    commentId: uuid("comment_id").references(() => comments.id),
    value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  },
  (t) => ({
    // Ensure one vote per target per user
    uniquePostVote: uniqueIndex("unique_post_vote").on(t.userId, t.postId),
    uniqueCommentVote: uniqueIndex("unique_comment_vote").on(
      t.userId,
      t.commentId,
    ),
  }),
);

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id],
  }),
}));

// Cars (Garage)
export const cars = pgTable("cars", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  color: text("color"),
  transmission: text("transmission"),
  drivetrain: text("drivetrain"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carsRelations = relations(cars, ({ one }) => ({
  owner: one(users, {
    fields: [cars.userId],
    references: [users.id],
  }),
}));
