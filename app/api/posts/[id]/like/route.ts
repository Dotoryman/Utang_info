import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../../../db";
import {
  postLikes,
  posts,
} from "../../../../../db/schema";
import { getRequestUser } from "../../../../../lib/authSession";

type LikeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: LikeRouteContext,
) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "좋아요를 누르려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as Record<string, unknown>).liked !== "boolean"
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: "좋아요 요청 형식이 올바르지 않습니다.",
      },
      { status: 400 },
    );
  }

  const liked = (body as { liked: boolean }).liked;
  const { id: postId } = await context.params;
  const userId = String(user.id);
  const db = getDb();
  const postRows = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (postRows.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "글을 찾을 수 없어요.",
      },
      { status: 404 },
    );
  }

  if (liked) {
    await db
      .insert(postLikes)
      .values({
        id: crypto.randomUUID(),
        postId,
        userId,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  } else {
    await db
      .delete(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId),
        ),
      );
  }

  const countRows = await db
    .select({ value: count() })
    .from(postLikes)
    .where(eq(postLikes.postId, postId));

  return NextResponse.json({
    ok: true,
    liked,
    likeCount: countRows[0]?.value ?? 0,
  });
}
