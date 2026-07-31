import { env } from "cloudflare:workers";

type ProfileImageRouteProps = {
  params: Promise<{
    key: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: ProfileImageRouteProps,
) {
  const { key } = await params;

  if (!/^[0-9a-f-]+\.(?:jpg|png|webp)$/i.test(key)) {
    return new Response("Not Found", { status: 404 });
  }

  if (!env.PROFILE_IMAGES) {
    return new Response("Not Found", { status: 404 });
  }

  const object = await env.PROFILE_IMAGES.get(`profile-images/${key}`);

  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(object.body, {
    status: 200,
    headers,
  });
}
