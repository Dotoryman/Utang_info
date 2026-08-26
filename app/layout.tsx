import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import { SiteFooter } from "@/components/site/SiteFooter";

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
  const title = "우땅랜드";
  const description =
    "엉뚱하고 솔직하고 다정한 원숭이 캐릭터 우땅이를 좋아하는 사람들이 함께 즐기는 비영리 팬페이지입니다.";

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
      images: [{ url: `${origin}/og.png`, width: 1728, height: 908, alt: "UTANG! 우땅이 소개" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
