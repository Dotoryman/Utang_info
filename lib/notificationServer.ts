import { and, eq } from "drizzle-orm";

import { getDb } from "../db";
import { notifications, posts } from "../db/schema";

type AppDb = ReturnType<typeof getDb>;

type NotificationEvent = {
  postId: string;
  actorId: string;
  actorNickname: string;
};

async function findPostOwner(db: AppDb, postId: string) {
  const rows = await db
    .select({
      authorId: posts.authorId,
      title: posts.title,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  return rows[0] ?? null;
}

export async function notifyPostComment({
  postId,
  actorId,
  actorNickname,
}: NotificationEvent): Promise<void> {
  try {
    const db = getDb();
    const post = await findPostOwner(db, postId);

    if (!post || post.authorId === actorId) {
      return;
    }

    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      recipientId: post.authorId,
      actorId,
      postId,
      type: "comment",
      message: `${actorNickname}님이 내 이야기에 댓글을 남겼숭`,
      isRead: false,
      createdAt: new Date(),
    });
  } catch (error) {
    // A notification must never make the original comment request fail.
    console.error("댓글 알림 생성 실패:", error);
  }
}

export async function notifyPostLike({
  postId,
  actorId,
  actorNickname,
}: NotificationEvent): Promise<void> {
  try {
    const db = getDb();
    const post = await findPostOwner(db, postId);

    if (!post || post.authorId === actorId) {
      return;
    }

    const unreadNotification = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, post.authorId),
          eq(notifications.actorId, actorId),
          eq(notifications.postId, postId),
          eq(notifications.type, "like"),
          eq(notifications.isRead, false),
        ),
      )
      .limit(1);

    if (unreadNotification.length > 0) {
      return;
    }

    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      recipientId: post.authorId,
      actorId,
      postId,
      type: "like",
      message: `${actorNickname}님이 내 이야기를 좋아했숭`,
      isRead: false,
      createdAt: new Date(),
    });
  } catch (error) {
    // A notification must never make the original like request fail.
    console.error("좋아요 알림 생성 실패:", error);
  }
}
