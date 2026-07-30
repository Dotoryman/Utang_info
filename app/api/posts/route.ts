import { count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../db";
import { posts, users } from "../../../db/schema";
import { getRequestUser } from "../../../lib/authSession";
import {
  COMMUNITY_PAGE_SIZE,
  parsePage,
  validatePostInput,
} from "../../../lib/community";
import {
  communityPostSummarySelection,
  serializeCommunityPostSummary,
} from "../../../lib/communityServer";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedPage = parsePage(url.searchParams.get("page"));
  const db = getDb();

  const countRows = await db.select({ value: count() }).from(posts);
  const totalItems = countRows[0]?.value ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / COMMUNITY_PAGE_SIZE),
  );
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * COMMUNITY_PAGE_SIZE;

  const postRows = await db
    .select(communityPostSummarySelection)
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.isNotice), desc(posts.createdAt))
    .limit(COMMUNITY_PAGE_SIZE)
    .offset(offset);

  return NextResponse.json({
    ok: true,
    posts: postRows.map(serializeCommunityPostSummary),
    pagination: {
      page,
      pageSize: COMMUNITY_PAGE_SIZE,
      totalItems,
      totalPages,
    },
  });
}

export async function POST(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "글을 쓰려면 먼저 입장해 주세요.",
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

  const db = getDb();
  const now = new Date();
  const postId = crypto.randomUUID();

  await db.insert(posts).values({
    id: postId,
    authorId: String(user.id),
    title: validation.value.title,
    content: validation.value.content,
    isNotice: validation.value.isNotice,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    {
      ok: true,
      post: {
        id: postId,
        authorId: String(user.id),
        authorNickname: user.nickname,
        authorProfileImage: user.profileImage,
        title: validation.value.title,
        content: validation.value.content,
        isNotice: validation.value.isNotice,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    },
    { status: 201 },
  );
}
