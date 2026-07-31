import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../../db";
import { sessions, users } from "../../../../db/schema";
import { getRequestUser } from "../../../../lib/authSession";
import {
  hashPassword,
  verifyPassword,
} from "../../../../lib/password";
import { validateNewPassword } from "../../../../lib/profile";
import { SESSION_COOKIE_NAME } from "../../../../lib/session";

type PasswordBody = {
  currentPassword?: unknown;
  newPassword?: unknown;
};

export async function PATCH(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "비밀번호를 바꾸려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  let body: PasswordBody;

  try {
    body = (await request.json()) as PasswordBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "요청 형식이 올바르지 않습니다.",
      },
      { status: 400 },
    );
  }

  const currentPassword =
    typeof body.currentPassword === "string"
      ? body.currentPassword
      : "";
  const newPasswordValidation = validateNewPassword(body.newPassword);

  if (!currentPassword) {
    return NextResponse.json(
      {
        ok: false,
        message: "현재 비밀번호를 입력해 주세요.",
      },
      { status: 400 },
    );
  }

  if (!newPasswordValidation.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: newPasswordValidation.message,
      },
      { status: 400 },
    );
  }

  if (currentPassword === newPasswordValidation.value) {
    return NextResponse.json(
      {
        ok: false,
        message: "새 비밀번호는 현재 비밀번호와 다르게 입력해 주세요.",
      },
      { status: 400 },
    );
  }

  const db = getDb();
  const account = await db.query.users.findFirst({
    columns: {
      passwordHash: true,
    },
    where: eq(users.id, String(user.id)),
  });

  if (
    !account ||
    !(await verifyPassword(currentPassword, account.passwordHash))
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: "현재 비밀번호가 올바르지 않습니다.",
      },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(newPasswordValidation.value);

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, String(user.id)));

  await db
    .delete(sessions)
    .where(eq(sessions.userId, String(user.id)));

  const response = NextResponse.json({
    ok: true,
    message: "비밀번호가 변경되었어요. 새 비밀번호로 다시 입장해 주세요.",
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
