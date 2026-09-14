import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPaths = new Set([
  "/",
  "/closure-utang.png",
  "/utang-favicon.png",
]);

export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    publicPaths.has(pathname) ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_vinext/")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        ok: false,
        message: "우땅랜드의 커뮤니티 기능은 운영을 종료했습니다.",
      },
      {
        status: 410,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.redirect(new URL("/", request.url), 307);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
