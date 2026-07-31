import type { Metadata } from "next";
import { headers } from "next/headers";

import { SiteFooter } from "@/components/site/SiteFooter";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3001";
  const protocol = requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "우땅이 | 우다다 달리는 다정한 친구";
  const description = "엉뚱해서 웃기고 다정해서 좋은 원숭이 캐릭터, 우땅이를 소개합니다.";

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
