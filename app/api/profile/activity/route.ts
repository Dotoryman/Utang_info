import { count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../../db";
import {
  comments,
  postLikes,
  posts,
} from "../../../../db/schema";
import { getRequestUser } from "../../../../lib/authSession";

export async function GET(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "내 활동을 보려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  const userId = String(user.id);
  const db = getDb();

  const [
    postCountRows,
    commentCountRows,
    receivedLikeCountRows,
    recentPosts,
    recentComments,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(posts)
      .where(eq(posts.authorId, userId)),
    db
      .select({ value: count() })
      .from(comments)
      .where(eq(comments.authorId, userId)),
    db
      .select({ value: count() })
      .from(postLikes)
      .innerJoin(posts, eq(postLikes.postId, posts.id))
      .where(eq(posts.authorId, userId)),
    db
      .select({
        id: posts.id,
        title: posts.title,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(5),
    db
      .select({
        id: comments.id,
        postId: comments.postId,
        postTitle: posts.title,
        content: comments.content,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .innerJoin(posts, eq(comments.postId, posts.id))
      .where(eq(comments.authorId, userId))
      .orderBy(desc(comments.createdAt))
      .limit(5),
  ]);

  return NextResponse.json({
    ok: true,
    summary: {
      postCount: postCountRows[0]?.value ?? 0,
      commentCount: commentCountRows[0]?.value ?? 0,
      receivedLikeCount: receivedLikeCountRows[0]?.value ?? 0,
    },
    recentPosts: recentPosts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
    })),
    recentComments: recentComments.map((comment) => ({
      ...comment,
      content:
        comment.content.length > 80
          ? `${comment.content.slice(0, 80)}…`
          : comment.content,
      createdAt: comment.createdAt.toISOString(),
    })),
  });
}
