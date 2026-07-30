import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../../../db";
import { posts } from "../../../../../db/schema";

type ViewRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: ViewRouteContext,
) {
  const { id } = await context.params;
  const db = getDb();

  await db
    .update(posts)
    .set({
      viewCount: sql`${posts.viewCount} + 1`,
    })
    .where(eq(posts.id, id));

  const rows = await db
    .select({ viewCount: posts.viewCount })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!rows[0]) {
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
    viewCount: rows[0].viewCount,
  });
}
