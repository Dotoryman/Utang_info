import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../db";
import { sessions, users } from "../../../db/schema";
import { verifyPassword } from "../../../lib/password";
import {
  generateSessionToken,
  hashSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  SESSION_DURATION_SECONDS,
} from "../../../lib/session";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "요청 형식이 올바르지 않습니다.",
      },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string"
      ? normalizeEmail(body.email)
      : "";

  const password =
    typeof body.password === "string"
      ? body.password
      : "";

  if (!email || !password) {
    return NextResponse.json(
      {
        ok: false,
        message: "이메일과 비밀번호를 입력해 주세요.",
      },
      { status: 400 },
    );
  }

  const db = getDb();

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      },
      { status: 401 },
    );
  }

  const passwordMatches = await verifyPassword(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return NextResponse.json(
      {
        ok: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      },
      { status: 401 },
    );
  }

  const sessionToken = generateSessionToken();
  const tokenHash = await hashSessionToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
  });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  return response;
}