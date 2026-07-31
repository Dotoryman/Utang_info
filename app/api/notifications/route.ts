import { and, count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../db";
import { notifications } from "../../../db/schema";
import { getRequestUser } from "../../../lib/authSession";
import {
  NOTIFICATION_PAGE_SIZE,
  parseNotificationPage,
} from "../../../lib/notifications";

export async function GET(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "알림을 확인하려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const requestedPage = parseNotificationPage(
    url.searchParams.get("page"),
  );
  const recipientId = String(user.id);
  const db = getDb();
  const unreadFilter = and(
    eq(notifications.recipientId, recipientId),
    eq(notifications.isRead, false),
  );
  const recipientFilter = eq(
    notifications.recipientId,
    recipientId,
  );

  const [unreadRows, totalRows] = await Promise.all([
    db.select({ value: count() }).from(notifications).where(unreadFilter),
    db.select({ value: count() }).from(notifications).where(recipientFilter),
  ]);

  const totalItems = totalRows[0]?.value ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / NOTIFICATION_PAGE_SIZE),
  );
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * NOTIFICATION_PAGE_SIZE;
  const rows = await db
    .select({
      id: notifications.id,
      postId: notifications.postId,
      type: notifications.type,
      message: notifications.message,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(recipientFilter)
    .orderBy(desc(notifications.createdAt))
    .limit(NOTIFICATION_PAGE_SIZE)
    .offset(offset);

  const response = NextResponse.json({
    ok: true,
    notifications: rows.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    })),
    unreadCount: unreadRows[0]?.value ?? 0,
    pagination: {
      page,
      pageSize: NOTIFICATION_PAGE_SIZE,
      totalItems,
      totalPages,
    },
  });

  response.headers.set("Cache-Control", "private, no-store, max-age=0");

  return response;
}

export async function PATCH(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "알림을 처리하려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  let body: { id?: unknown } = {};

  try {
    body = (await request.json()) as { id?: unknown };
  } catch {
    // An empty body means mark all notifications as read.
  }

  const db = getDb();
  const recipientId = String(user.id);

  if (typeof body.id === "string" && body.id.trim()) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, body.id),
          eq(notifications.recipientId, recipientId),
        ),
      );
  } else {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.recipientId, recipientId),
          eq(notifications.isRead, false),
        ),
      );
  }

  const unreadRows = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, recipientId),
        eq(notifications.isRead, false),
      ),
    );

  return NextResponse.json({
    ok: true,
    unreadCount: unreadRows[0]?.value ?? 0,
  });
}
