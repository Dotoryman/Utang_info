import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),

  email: text("email").notNull().unique(),

  passwordHash: text("password_hash").notNull(),

  nickname: text("nickname").notNull(),

  profileImage: text("profile_image"),

  role: text("role", {
    enum: ["user", "admin"],
  })
    .notNull()
    .default("user"),

  createdAt: integer("created_at", {
    mode: "timestamp",
  })
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: integer("updated_at", {
    mode: "timestamp",
  })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    tokenHash: text("token_hash").notNull().unique(),

    expiresAt: integer("expires_at", {
      mode: "timestamp",
    }).notNull(),

    createdAt: integer("created_at", {
      mode: "timestamp",
    })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("sessions_user_id_index").on(table.userId),
    index("sessions_expires_at_index").on(table.expiresAt),
  ],
);

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),

    authorId: text("author_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    title: text("title").notNull(),

    content: text("content").notNull(),

    isNotice: integer("is_notice", {
      mode: "boolean",
    })
      .notNull()
      .default(false),

    viewCount: integer("view_count")
      .notNull()
      .default(0),

    createdAt: integer("created_at", {
      mode: "timestamp",
    })
      .notNull()
      .$defaultFn(() => new Date()),

    updatedAt: integer("updated_at", {
      mode: "timestamp",
    })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("posts_author_id_index").on(table.authorId),
    index("posts_created_at_index").on(table.createdAt),
    index("posts_notice_created_at_index").on(
      table.isNotice,
      table.createdAt,
    ),
  ],
);

export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),

    postId: text("post_id")
      .notNull()
      .references(() => posts.id, {
        onDelete: "cascade",
      }),

    authorId: text("author_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    content: text("content").notNull(),

    createdAt: integer("created_at", {
      mode: "timestamp",
    })
      .notNull()
      .$defaultFn(() => new Date()),

    updatedAt: integer("updated_at", {
      mode: "timestamp",
    })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("comments_post_id_created_at_index").on(
      table.postId,
      table.createdAt,
    ),
    index("comments_author_id_index").on(table.authorId),
  ],
);

export const postLikes = sqliteTable(
  "post_likes",
  {
    id: text("id").primaryKey(),

    postId: text("post_id")
      .notNull()
      .references(() => posts.id, {
        onDelete: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    createdAt: integer("created_at", {
      mode: "timestamp",
    })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("post_likes_post_user_unique").on(
      table.postId,
      table.userId,
    ),
    index("post_likes_post_id_index").on(table.postId),
    index("post_likes_user_id_index").on(table.userId),
  ],
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),

    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    actorId: text("actor_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    postId: text("post_id")
      .notNull()
      .references(() => posts.id, {
        onDelete: "cascade",
      }),

    type: text("type", {
      enum: ["comment", "like"],
    }).notNull(),

    message: text("message").notNull(),

    isRead: integer("is_read", {
      mode: "boolean",
    })
      .notNull()
      .default(false),

    createdAt: integer("created_at", {
      mode: "timestamp",
    })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("notifications_recipient_created_index").on(
      table.recipientId,
      table.createdAt,
    ),
    index("notifications_recipient_read_index").on(
      table.recipientId,
      table.isRead,
    ),
    index("notifications_post_id_index").on(table.postId),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type PostLike = typeof postLikes.$inferSelect;
export type NewPostLike = typeof postLikes.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
