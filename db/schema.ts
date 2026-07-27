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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;