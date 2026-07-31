import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { getRequestUser } from "../../../../lib/authSession";
import {
  canStoreProfileImage,
  createProfileImageObjectKey,
  createProfileImageUrl,
  getProfileImageObjectKey,
  hasValidProfileImageSignature,
  validateProfileImageMetadata,
} from "../../../../lib/profile";
import { getProfileImageStorageUsage } from "../../../../lib/profileStorage";

export async function POST(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "프로필 이미지를 바꾸려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "이미지 요청을 읽지 못했어요.",
      },
      { status: 400 },
    );
  }

  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        ok: false,
        message: "업로드할 이미지를 선택해 주세요.",
      },
      { status: 400 },
    );
  }

  const metadataValidation = validateProfileImageMetadata(file);

  if (!metadataValidation.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: metadataValidation.message,
      },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (
    !hasValidProfileImageSignature(
      bytes,
      metadataValidation.value.contentType,
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: "이미지 파일의 실제 형식을 확인해 주세요.",
      },
      { status: 400 },
    );
  }

  if (!env.PROFILE_IMAGES) {
    return NextResponse.json(
      {
        ok: false,
        message: "이미지 저장소를 사용할 수 없어요.",
      },
      { status: 503 },
    );
  }

  const objectKey = createProfileImageObjectKey(
    metadataValidation.value.extension,
  );
  const profileImage = createProfileImageUrl(objectKey);
  const previousObjectKey = getProfileImageObjectKey(user.profileImage);
  const [storageUsage, previousObject] = await Promise.all([
    getProfileImageStorageUsage(env.PROFILE_IMAGES),
    previousObjectKey
      ? env.PROFILE_IMAGES.head(previousObjectKey)
      : Promise.resolve(null),
  ]);
  if (
    !canStoreProfileImage({
      currentUsageBytes: storageUsage.usedBytes,
      previousImageBytes: previousObject?.size,
      nextImageBytes: bytes.byteLength,
    })
  ) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "프로필 이미지 저장 공간이 가득 찼숭. 관리자에게 알려주세요.",
      },
      { status: 507 },
    );
  }

  await env.PROFILE_IMAGES.put(objectKey, bytes, {
    httpMetadata: {
      contentType: metadataValidation.value.contentType,
    },
    customMetadata: {
      ownerId: String(user.id),
    },
  });

  const db = getDb();

  try {
    await db
      .update(users)
      .set({
        profileImage,
        updatedAt: new Date(),
      })
      .where(eq(users.id, String(user.id)));
  } catch (error) {
    await env.PROFILE_IMAGES.delete(objectKey);
    throw error;
  }

  if (previousObjectKey) {
    await env.PROFILE_IMAGES.delete(previousObjectKey);
  }

  return NextResponse.json({
    ok: true,
    profileImage,
  });
}

export async function DELETE(request: Request) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "프로필 이미지를 바꾸려면 먼저 입장해 주세요.",
      },
      { status: 401 },
    );
  }

  const objectKey = getProfileImageObjectKey(user.profileImage);
  const db = getDb();

  await db
    .update(users)
    .set({
      profileImage: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, String(user.id)));

  if (objectKey && env.PROFILE_IMAGES) {
    await env.PROFILE_IMAGES.delete(objectKey);
  }

  return NextResponse.json({
    ok: true,
    profileImage: null,
  });
}
