import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../../db";
import {
  comments,
  users,
} from "../../../../db/schema";
import { getRequestUser } from "../../../../lib/authSession";
import {
  canDeleteComment,
  canEditComment,
  validateCommentInput,
} from "../../../../lib/community";
import {
  communityCommentSelection,
  serializeCommunityComment,
} from "../../../../lib/communityServer";

type CommentRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function findComment(id: string) {
  const db = getDb();
  const rows = await db
    .select(communityCommentSelection)
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function PATCH(
  request: Request,
  context: CommentRouteContext,
) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "댓글을 수정하려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const existingComment = await findComment(id);

  if (!existingComment) {
    return NextResponse.json(
      {
        ok: false,
        message: "댓글을 찾을 수 없어요.",
      },
      { status: 404 },
    );
  }

  if (!canEditComment(user.id, existingComment.authorId)) {
    return NextResponse.json(
      {
        ok: false,
        message: "이 댓글을 수정할 권한이 없어요.",
      },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const validation = validateCommentInput(body);

  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: validation.message,
      },
      { status: 400 },
    );
  }

  const updatedAt = new Date();
  const db = getDb();

  await db
    .update(comments)
    .set({
      content: validation.value.content,
      updatedAt,
    })
    .where(eq(comments.id, id));

  return NextResponse.json({
    ok: true,
    comment: {
      ...serializeCommunityComment(existingComment),
      content: validation.value.content,
      updatedAt: updatedAt.toISOString(),
    },
  });
}

export async function DELETE(
  request: Request,
  context: CommentRouteContext,
) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "댓글을 삭제하려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const existingComment = await findComment(id);

  if (!existingComment) {
    return NextResponse.json(
      {
        ok: false,
        message: "댓글을 찾을 수 없어요.",
      },
      { status: 404 },
    );
  }

  if (
    !canDeleteComment(
      user.id,
      user.role,
      existingComment.authorId,
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: "이 댓글을 삭제할 권한이 없어요.",
      },
      { status: 403 },
    );
  }

  const db = getDb();
  await db.delete(comments).where(eq(comments.id, id));

  return NextResponse.json({
    ok: true,
  });
}
