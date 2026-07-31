import { PROFILE_IMAGE_STORAGE_LIMIT_BYTES } from "./profile.ts";

export type ProfileImageStorageUsage = {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  objectCount: number;
  usagePercent: number;
};

export async function getProfileImageStorageUsage(
  bucket: R2Bucket,
): Promise<ProfileImageStorageUsage> {
  let cursor: string | undefined;
  let usedBytes = 0;
  let objectCount = 0;

  do {
    const page = await bucket.list({ cursor });

    usedBytes += page.objects.reduce(
      (sum, object) => sum + object.size,
      0,
    );
    objectCount += page.objects.length;
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  return {
    usedBytes,
    limitBytes: PROFILE_IMAGE_STORAGE_LIMIT_BYTES,
    remainingBytes: Math.max(
      0,
      PROFILE_IMAGE_STORAGE_LIMIT_BYTES - usedBytes,
    ),
    objectCount,
    usagePercent: Math.min(
      100,
      (usedBytes / PROFILE_IMAGE_STORAGE_LIMIT_BYTES) * 100,
    ),
  };
}
