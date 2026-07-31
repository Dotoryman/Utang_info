import { count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../../../db";
import {
  comments,
  posts,
  users,
} from "../../../../../db/schema";
import { getRequestUser } from "../../../../../lib/authSession";
import {
  COMMUNITY_COMMENT_PAGE_SIZE,
  parsePage,
  validateCommentInput,
} from "../../../../../lib/community";
import {
  communityCommentSelection,
  serializeCommunityComment,
} from "../../../../../lib/communityServer";
import { notifyPostComment } from "../../../../../lib/notificationServer";

type CommentsRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function postExists(id: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  return rows.length > 0;
}

export async function GET(
  request: Request,
  context: CommentsRouteContext,
) {
  const { id: postId } = await context.params;

  if (!(await postExists(postId))) {
    return NextResponse.json(
      {
        ok: false,
        message: "글을 찾을 수 없어요.",
      },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const requestedPage = parsePage(url.searchParams.get("page"));
  const db = getDb();
  const countRows = await db
    .select({ value: count() })
    .from(comments)
    .where(eq(comments.postId, postId));
  const totalItems = countRows[0]?.value ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / COMMUNITY_COMMENT_PAGE_SIZE),
  );
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * COMMUNITY_COMMENT_PAGE_SIZE;

  const rows = await db
    .select(communityCommentSelection)
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt))
    .limit(COMMUNITY_COMMENT_PAGE_SIZE)
    .offset(offset);

  return NextResponse.json({
    ok: true,
    comments: rows.map(serializeCommunityComment),
    pagination: {
      page,
      pageSize: COMMUNITY_COMMENT_PAGE_SIZE,
      totalItems,
      totalPages,
    },
  });
}

export async function POST(
  request: Request,
  context: CommentsRouteContext,
) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "댓글을 남기려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  const { id: postId } = await context.params;

  if (!(await postExists(postId))) {
    return NextResponse.json(
      {
        ok: false,
        message: "글을 찾을 수 없어요.",
      },
      { status: 404 },
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

  const now = new Date();
  const commentId = crypto.randomUUID();
  const db = getDb();

  await db.insert(comments).values({
    id: commentId,
    postId,
    authorId: String(user.id),
    content: validation.value.content,
    createdAt: now,
    updatedAt: now,
  });

  await notifyPostComment({
    postId,
    actorId: String(user.id),
    actorNickname: user.nickname,
  });

  return NextResponse.json(
    {
      ok: true,
      comment: {
        id: commentId,
        postId,
        authorId: String(user.id),
        authorNickname: user.nickname,
        authorProfileImage: user.profileImage,
        content: validation.value.content,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    },
    { status: 201 },
  );
}
