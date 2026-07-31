import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../db";
import { users } from "../../../db/schema";
import { getRequestUser } from "../../../lib/authSession";
import { validateProfileNickname } from "../../../lib/profile";

type ProfileBody = {
  nickname?: unknown;
};

export async function PATCH(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "프로필을 바꾸려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  let body: ProfileBody;

  try {
    body = (await request.json()) as ProfileBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "요청 형식이 올바르지 않습니다.",
      },
      { status: 400 },
    );
  }

  const validation = validateProfileNickname(body.nickname);

  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: validation.message,
      },
      { status: 400 },
    );
  }

  const db = getDb();
  const now = new Date();

  await db
    .update(users)
    .set({
      nickname: validation.value,
      updatedAt: now,
    })
    .where(eq(users.id, String(user.id)));

  return NextResponse.json({
    ok: true,
    user: {
      ...user,
      nickname: validation.value,
    },
  });
}
