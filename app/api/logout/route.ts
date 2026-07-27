import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../db";
import { sessions } from "../../../db/schema";
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

export async function POST(request: Request) {
  const sessionToken = getCookieValue(
    request.headers.get("cookie"),
    SESSION_COOKIE_NAME,
  );

  if (sessionToken) {
    const tokenHash = await hashSessionToken(sessionToken);
    const db = getDb();

    await db
      .delete(sessions)
      .where(eq(sessions.tokenHash, tokenHash));
  }

  const response = NextResponse.json({
    ok: true,
  });

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