import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../db";
import { users } from "../../../db/schema";
import { hashPassword } from "../../../lib/password";

type RegisterBody = {
  email?: unknown;
  password?: unknown;
  nickname?: unknown;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: RegisterBody;

  try {
    body = (await request.json()) as RegisterBody;
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
    typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password =
    typeof body.password === "string" ? body.password : "";
  const nickname =
    typeof body.nickname === "string" ? body.nickname.trim() : "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        ok: false,
        message: "올바른 이메일 주소를 입력해 주세요.",
      },
      { status: 400 },
    );
  }

  if (password.length < 8 || password.length > 128) {
    return NextResponse.json(
      {
        ok: false,
        message: "비밀번호는 8자 이상 128자 이하로 입력해 주세요.",
      },
      { status: 400 },
    );
  }

  if (nickname.length < 2 || nickname.length > 20) {
    return NextResponse.json(
      {
        ok: false,
        message: "닉네임은 2자 이상 20자 이하로 입력해 주세요.",
      },
      { status: 400 },
    );
  }

  const db = getDb();

  const existingUsers = await db
    .select({
      email: users.email,
      nickname: users.nickname,
    })
    .from(users)
    .where(or(eq(users.email, email), eq(users.nickname, nickname)))
    .limit(1);

  const existingUser = existingUsers[0];

  if (existingUser?.email === email) {
    return NextResponse.json(
      {
        ok: false,
        message: "이미 가입된 이메일입니다.",
      },
      { status: 409 },
    );
  }

  if (existingUser?.nickname === nickname) {
    return NextResponse.json(
      {
        ok: false,
        message: "이미 사용 중인 닉네임입니다.",
      },
      { status: 409 },
    );
  }

  const now = new Date();
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  try {
    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      nickname,
      role: "user",
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Failed to create user:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "회원가입 처리 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      user: {
        id: userId,
        email,
        nickname,
      },
    },
    { status: 201 },
  );
}