import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../db";
import { sessions, users } from "../../../db/schema";
import {
  hashSessionToken,
  SESSION_COOKIE_NAME,
} from "../../../lib/session";

function getCookieValue(
  cookieHeader: string | null,
  cookieName: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name === cookieName) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export async function GET(request: Request) {
  const sessionToken = getCookieValue(
    request.headers.get("cookie"),
    SESSION_COOKIE_NAME,
  );

  if (!sessionToken) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 401 },
    );
  }

  const tokenHash = await hashSessionToken(sessionToken);
  const db = getDb();

  const result = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      userId: users.id,
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

  const login = result[0];

  if (!login) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: login.userId,
      email: login.email,
      nickname: login.nickname,
      profileImage: login.profileImage,
      role: login.role,
    },
  });
}