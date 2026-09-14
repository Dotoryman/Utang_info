import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3001";
  const protocol = requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "우땅랜드 운영 안내";
  const description =
    "우땅랜드는 우땅이 공식 홈페이지가 아닙니다. 우땅이 공식 인스타그램을 확인해 주세요.";

  return {
    title,
    description,
    icons: {
      icon: "/utang-favicon.png",
      shortcut: "/utang-favicon.png",
      apple: "/utang-favicon.png",
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: `${origin}/closure-utang.png`, width: 512, height: 512, alt: "우땅랜드 운영 안내" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/closure-utang.png`],
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
