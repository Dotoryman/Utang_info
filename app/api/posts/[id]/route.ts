import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../../db";
import { posts, users } from "../../../../db/schema";
import { getRequestUser } from "../../../../lib/authSession";
import {
  canDeletePost,
  canEditPost,
  validatePostInput,
} from "../../../../lib/community";
import {
  communityPostSelection,
  serializeCommunityPost,
} from "../../../../lib/communityServer";

type PostRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function findPost(id: string) {
  const db = getDb();
  const rows = await db
    .select(communityPostSelection)
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function GET(
  _request: Request,
  context: PostRouteContext,
) {
  const { id } = await context.params;
  const post = await findPost(id);

  if (!post) {
    return NextResponse.json(
      {
        ok: false,
        message: "글을 찾을 수 없어요.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    post: serializeCommunityPost(post),
  });
}

export async function PATCH(
  request: Request,
  context: PostRouteContext,
) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "글을 수정하려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const existingPost = await findPost(id);

  if (!existingPost) {
    return NextResponse.json(
      {
        ok: false,
        message: "글을 찾을 수 없어요.",
      },
      { status: 404 },
    );
  }

  const canEdit =
    canEditPost(user.id, existingPost.authorId) ||
    (user.role === "admin" && existingPost.isNotice);

  if (!canEdit) {
    return NextResponse.json(
      {
        ok: false,
        message: "이 글을 수정할 권한이 없어요.",
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

  const validation = validatePostInput(body);

  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: validation.message,
      },
      { status: 400 },
    );
  }

  if (validation.value.isNotice && user.role !== "admin") {
    return NextResponse.json(
      {
        ok: false,
        message: "공지글은 관리자만 작성할 수 있어요.",
      },
      { status: 403 },
    );
  }

  const updatedAt = new Date();
  const db = getDb();

  await db
    .update(posts)
    .set({
      title: validation.value.title,
      content: validation.value.content,
      isNotice: validation.value.isNotice,
      updatedAt,
    })
    .where(eq(posts.id, id));

  return NextResponse.json({
    ok: true,
    post: {
      ...serializeCommunityPost(existingPost),
      title: validation.value.title,
      content: validation.value.content,
      isNotice: validation.value.isNotice,
      updatedAt: updatedAt.toISOString(),
    },
  });
}

export async function DELETE(
  request: Request,
  context: PostRouteContext,
) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "글을 삭제하려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const existingPost = await findPost(id);

  if (!existingPost) {
    return NextResponse.json(
      {
        ok: false,
        message: "글을 찾을 수 없어요.",
      },
      { status: 404 },
    );
  }

  if (
    !canDeletePost(
      user.id,
      user.role,
      existingPost.authorId,
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: "이 글을 삭제할 권한이 없어요.",
      },
      { status: 403 },
    );
  }

  const db = getDb();
  await db.delete(posts).where(eq(posts.id, id));

  return NextResponse.json({
    ok: true,
  });
}
