import { and, eq, gt } from "drizzle-orm";

import { getDb } from "../db";
import { sessions, users } from "../db/schema";
import type { AuthUser } from "../components/auth/authTypes";
import { getCookieValue } from "./auth";
import {
  hashSessionToken,
  SESSION_COOKIE_NAME,
} from "./session";

export async function getRequestUser(
  request: Request,
): Promise<AuthUser | null> {
  const sessionToken = getCookieValue(
    request.headers.get("cookie"),
    SESSION_COOKIE_NAME,
  );

  if (!sessionToken) {
    return null;
  }

  const tokenHash = await hashSessionToken(sessionToken);
  const db = getDb();

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      nickname: users.nickname,
      profileImage: users.profileImage,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}
