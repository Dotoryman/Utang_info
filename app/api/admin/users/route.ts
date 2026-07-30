import { count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import {
  ADMIN_USER_PAGE_SIZE,
  canViewAdminUsers,
  parseAdminPage,
} from "../../../../lib/admin";
import { getRequestUser } from "../../../../lib/authSession";

export async function GET(request: Request) {
  const viewer = await getRequestUser(request);

  if (!viewer) {
    return NextResponse.json(
      {
        ok: false,
        message: "회원 목록을 보려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  if (!canViewAdminUsers(viewer.role)) {
    return NextResponse.json(
      {
        ok: false,
        message: "관리자만 확인할 수 있는 공간이에요.",
      },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const requestedPage = parseAdminPage(url.searchParams.get("page"));
  const db = getDb();

  const [totalRows, adminRows] = await Promise.all([
    db.select({ value: count() }).from(users),
    db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "admin")),
  ]);

  const totalItems = totalRows[0]?.value ?? 0;
  const totalAdmins = adminRows[0]?.value ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / ADMIN_USER_PAGE_SIZE),
  );
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * ADMIN_USER_PAGE_SIZE;

  const memberRows = await db
    .select({
      id: users.id,
      email: users.email,
      nickname: users.nickname,
      profileImage: users.profileImage,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt), desc(users.id))
    .limit(ADMIN_USER_PAGE_SIZE)
    .offset(offset);

  const response = NextResponse.json({
    ok: true,
    users: memberRows.map((member) => ({
      ...member,
      createdAt: member.createdAt.toISOString(),
    })),
    summary: {
      totalUsers: totalItems,
      totalAdmins,
      totalResidents: Math.max(0, totalItems - totalAdmins),
    },
    pagination: {
      page,
      pageSize: ADMIN_USER_PAGE_SIZE,
      totalItems,
      totalPages,
    },
  });

  response.headers.set(
    "Cache-Control",
    "private, no-store, max-age=0",
  );

  return response;
}
