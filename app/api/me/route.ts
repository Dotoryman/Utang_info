import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../db";
import { sessions, users } from "../../../db/schema";
import { getCookieValue } from "../../../lib/auth";
import {
  hashSessionToken,
  SESSION_COOKIE_NAME,
} from "../../../lib/session";

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
    await db
      .delete(sessions)
      .where(eq(sessions.tokenHash, tokenHash));

    const response = NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 401 },
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
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
