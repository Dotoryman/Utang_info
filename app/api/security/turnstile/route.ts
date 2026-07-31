import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

import { getTurnstileConfiguration } from "@/lib/security";

export async function GET() {
  const configuration = getTurnstileConfiguration(env);

  return NextResponse.json(
    {
      enabled: configuration.enabled,
      siteKey: configuration.siteKey,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
