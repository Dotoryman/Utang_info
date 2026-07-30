import {
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),

  email: text("email").notNull().unique(),

  passwordHash: text("password_hash").notNull(),

  nickname: text("nickname").notNull().unique(),

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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
