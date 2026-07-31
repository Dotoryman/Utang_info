import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../../../db";
import { users } from "../../../../../db/schema";
import {
  canDeleteResident,
  canViewAdminUsers,
} from "../../../../../lib/admin";
import { getRequestUser } from "../../../../../lib/authSession";
import { getProfileImageObjectKey } from "../../../../../lib/profile";

type AdminUserRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: Request,
  context: AdminUserRouteContext,
) {
  const viewer = await getRequestUser(request);

  if (!viewer) {
    return NextResponse.json(
      {
        ok: false,
        message: "주민을 관리하려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  if (!canViewAdminUsers(viewer.role)) {
    return NextResponse.json(
      {
        ok: false,
        message: "관리자만 주민을 내보낼 수 있어요.",
      },
      { status: 403 },
    );
  }

  const { id: targetId } = await context.params;
  const db = getDb();
  const targetRows = await db
    .select({
      id: users.id,
      nickname: users.nickname,
      profileImage: users.profileImage,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, targetId))
    .limit(1);
  const target = targetRows[0];

  if (!target) {
    return NextResponse.json(
      {
        ok: false,
        message: "삭제할 주민을 찾을 수 없어요.",
      },
      { status: 404 },
    );
  }

  if (
    !canDeleteResident(
      viewer.id,
      viewer.role,
      target.id,
      target.role,
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        message:
          target.role === "admin"
            ? "관리소장 계정은 주민관리에서 삭제할 수 없어요."
            : "자기 계정은 주민관리에서 삭제할 수 없어요.",
      },
      { status: 403 },
    );
  }

  await db.delete(users).where(eq(users.id, target.id));

  const objectKey = getProfileImageObjectKey(target.profileImage);
  let imageCleanupPending = false;

  if (objectKey && env.PROFILE_IMAGES) {
    try {
      await env.PROFILE_IMAGES.delete(objectKey);
    } catch (error) {
      imageCleanupPending = true;
      console.error("Failed to delete resident profile image:", error);
    }
  }

  return NextResponse.json({
    ok: true,
    deletedUser: {
      id: target.id,
      nickname: target.nickname,
    },
    imageCleanupPending,
  });
}
